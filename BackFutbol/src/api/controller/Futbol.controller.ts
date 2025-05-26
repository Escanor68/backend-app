import type { NextFunction, Request, Response } from "express"
import type { FutbolControllerInterface } from "../interface/Futbol.controller.interface"
import { futbolService } from "../../core/service"
import { AppError } from "../../middleware/error.middleware"
import Joi from "joi"

// Define schemas outside of the controller methods
const createCanchaSchema = Joi.object({
  userField: Joi.string().required(),
  availableFrom: Joi.string().required(),
  availableUntil: Joi.string().required(),
  fieldName: Joi.string().required(),
  price: Joi.number().required(),
})

const traerCanchasSchema = Joi.object({
  userField: Joi.number().required(),
})

const reservarCanchaSchema = Joi.object({
  owner: Joi.number().required(),
  fieldName: Joi.string().required(),
  schedule: Joi.string().required(),
  who_reserved_id: Joi.number().required(),
  who_reserved_name: Joi.string().required(),
})

const liberarCanchaSchema = Joi.object({
  id: Joi.string().required(),
})

export class FutbolController implements FutbolControllerInterface {
  async crearTurnos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userField, fieldName, availableFrom, availableUntil, price } = req.body

      await futbolService.crearCanchas(userField, fieldName, availableFrom, availableUntil, price)

      res.status(200).json({ message: "Canchas creadas exitosamente" })
    } catch (error: any) {
      next(new AppError(error.message, 500))
    }
  }

  async traerCanchas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userField } = req.body
      const canchas = await futbolService.traerCanchas(userField)
      res.status(200).json(canchas)
    } catch (error: any) {
      next(new AppError(error.message, 500))
    }
  }

  async reservarCanchas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { owner, fieldName, schedule, who_reserved_id, who_reserved_name } = req.body

      await futbolService.reservarCancha(owner, fieldName, schedule, who_reserved_id, who_reserved_name)

      res.status(200).json({ message: "Cancha reservada exitosamente" })
    } catch (error: any) {
      next(new AppError(error.message, 500))
    }
  }

  async liberarCancha(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.body
      await futbolService.liberarCancha(id)
      res.status(200).json({ message: "Cancha liberada exitosamente" })
    } catch (error: any) {
      next(new AppError(error.message, 500))
    }
  }

  async getNearbyFields(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { latitude, longitude, radius = 20 } = req.query

      if (!latitude || !longitude) {
        throw new AppError("Se requieren latitud y longitud", 400)
      }

      const lat = Number.parseFloat(latitude as string)
      const lng = Number.parseFloat(longitude as string)
      const radiusKm = Number.parseFloat(radius as string)

      const fields = await futbolService.getNearbyFields(lat, lng, radiusKm)
      res.status(200).json(fields)
    } catch (error: any) {
      next(new AppError(error.message, 500))
    }
  }
}
