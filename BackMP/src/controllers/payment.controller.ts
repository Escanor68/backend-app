import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { logger } from '../utils/logger';
import { paymentEvents } from '../index';

export class PaymentController {
  private paymentService: PaymentService;

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
      const history = await this.paymentService.getPaymentHistory(req.user.id);
      res.status(200).json(history);
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
} 