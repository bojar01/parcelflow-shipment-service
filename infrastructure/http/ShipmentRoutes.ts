import { Router } from "express";
import { ShipmentController } from "./ShipmentController";

export function createShipmentRoutes(
    controller: ShipmentController
): Router {
    const router = Router();

    router.post("/:id/pickup", (req, res, next) => {
        Promise.resolve(controller.pickup(req, res)).catch(next);
    })

    router.get('/tracking/:trackingNumber', (req, res, next) => {
        Promise.resolve(controller.findByTrackingNumber(req, res)).catch(next);
    })

    router.get('/:id', (req, res, next) => {
        Promise.resolve(controller.findById(req, res)).catch(next);
    })

    router.post('/', (req, res, next) => {
        Promise.resolve(controller.create(req, res)).catch(next);
    })

    return router;
}