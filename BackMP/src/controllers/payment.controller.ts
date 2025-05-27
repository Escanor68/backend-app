import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { logger } from '../utils/logger';
import { paymentEvents } from '../index';
import { AppDataSource } from '../config/database';
import { Payment } from '../models/payment.model';
import { InvoiceService } from '../services/invoice.service';
import { Between, IsNull } from 'typeorm';

export class PaymentController {
  private paymentService: PaymentService;
  private paymentRepository = AppDataSource.getRepository(Payment);
  private invoiceService = new InvoiceService();

  constructor() {
    this.paymentService = new PaymentService();
  }

  createPaymentPreference = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const preference = await this.paymentService.createPreference(req.body);
      res.status(201).json(preference);
    } catch (error) {
      logger.error('Error creating payment preference:', error);
      next(error);
    }
  };

  processPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = await this.paymentService.processPayment(req.body);
      // Emitir evento de actualización de estado
      paymentEvents.emitPaymentStatusUpdate(payment.id, payment.status);
      res.status(200).json(payment);
    } catch (error) {
      logger.error('Error processing payment:', error);
      next(error);
    }
  };

  getPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = await this.paymentService.getPaymentStatus(req.params.id);
      // Emitir evento de actualización de estado
      paymentEvents.emitPaymentStatusUpdate(req.params.id, status);
      res.status(200).json(status);
    } catch (error) {
      logger.error('Error getting payment status:', error);
      next(error);
    }
  };

  getPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const payments = await this.paymentRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' }
      });

      return res.json({
        payments: payments.map(payment => ({
          id: payment.id,
          bookingId: payment.bookingId,
          amount: payment.amount,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          createdAt: payment.createdAt,
          field: payment.field
        }))
      });
    } catch (error) {
      logger.error('Error getting payment history:', error);
      next(error);
    }
  };

  requestRefund = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refund = await this.paymentService.requestRefund(req.params.id);
      // Emitir evento de actualización de reembolso
      paymentEvents.emitRefundUpdate(req.params.id, refund.status);
      res.status(200).json(refund);
    } catch (error) {
      logger.error('Error requesting refund:', error);
      next(error);
    }
  };

  async refundPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason, amount } = req.body;

      const payment = await this.paymentRepository.findOne({
        where: { id }
      });

      if (!payment) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }

      if (payment.refund) {
        return res.status(400).json({ message: 'Este pago ya fue reembolsado' });
      }

      // Realizar reembolso en MercadoPago
      // ... lógica de reembolso con MercadoPago ...

      payment.refund = {
        status: 'completed',
        reason,
        amount: amount || payment.amount,
        date: new Date()
      };

      await this.paymentRepository.save(payment);

      return res.json({ message: 'Reembolso procesado correctamente' });
    } catch (error) {
      return res.status(500).json({ message: 'Error al procesar reembolso' });
    }
  }

  async getRefundStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payment = await this.paymentRepository.findOne({
        where: { id }
      });

      if (!payment) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }

      return res.json({
        refundStatus: payment.refund?.status || 'no_refund',
        refundDetails: payment.refund
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener estado del reembolso' });
    }
  }

  async getPaymentReports(req: Request, res: Response) {
    try {
      const { startDate, endDate, status } = req.query;

      const whereClause: any = {};
      
      if (startDate && endDate) {
        whereClause.createdAt = Between(new Date(startDate as string), new Date(endDate as string));
      }
      
      if (status) {
        whereClause.status = status;
      }

      const payments = await this.paymentRepository.find({
        where: whereClause
      });

      const paymentsByStatus = payments.reduce((acc, payment) => {
        const status = payment.status;
        if (!acc[status]) {
          acc[status] = { status, count: 0, amount: 0 };
        }
        acc[status].count++;
        acc[status].amount += Number(payment.amount);
        return acc;
      }, {});

      return res.json({
        totalAmount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
        totalPayments: payments.length,
        paymentsByStatus: Object.values(paymentsByStatus)
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error al generar reporte' });
    }
  }

  async getInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payment = await this.paymentRepository.findOne({
        where: { id }
      });

      if (!payment) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }

      if (!payment.invoice) {
        // Generar factura si no existe
        await this.invoiceService.generateInvoice(payment);
      }

      return res.download(payment.invoice.url);
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener factura' });
    }
  }

  async sendInvoiceEmail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email } = req.body;

      const payment = await this.paymentRepository.findOne({
        where: { id }
      });

      if (!payment) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }

      if (!payment.invoice) {
        await this.invoiceService.generateInvoice(payment);
      }

      await this.invoiceService.sendInvoiceEmail(payment, email);

      return res.json({ message: 'Factura enviada correctamente' });
    } catch (error) {
      return res.status(500).json({ message: 'Error al enviar factura' });
    }
  }
} 