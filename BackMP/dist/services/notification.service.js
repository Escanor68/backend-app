"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const logger_1 = require("../utils/logger");
class NotificationService {
    async sendNotification(notification) {
        try {
            logger_1.logger.info('Enviando notificación:', notification);
            // Aquí se implementaría la lógica para enviar notificaciones
            // Por ejemplo, usando Firebase Cloud Messaging, email, etc.
        }
        catch (error) {
            logger_1.logger.error('Error enviando notificación:', error);
            throw error;
        }
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map