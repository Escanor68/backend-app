import { Router } from "express"
import { futbolController } from "../api/controller"
import { validateSchema } from "../middleware/validation.middleware"
import { authenticateToken } from "../middleware/auth.middleware"
import Joi from "joi"

// Define schemas
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

const router = Router({ mergeParams: true })

// Apply middleware to routes
router.post(
  `/api/v1/futbol/crearCancha`,
  authenticateToken,
  validateSchema(createCanchaSchema),
  futbolController.crearTurnos,
)

router.get(`/api/v1/futbol/traerCanchas`, validateSchema(traerCanchasSchema), futbolController.traerCanchas)

router.post(
  `/api/v1/futbol/reservarCanchas`,
  authenticateToken,
  validateSchema(reservarCanchaSchema),
  futbolController.reservarCanchas,
)

router.post(
  `/api/v1/futbol/liberarCancha`,
  authenticateToken,
  validateSchema(liberarCanchaSchema),
  futbolController.liberarCancha,
)

router.get(`/api/v1/futbol/nearby`, futbolController.getNearbyFields)

export default router
