import express from "express";
import { PickupShipment } from "./application/use-cases/PickupShipment";
import { ShipmentController } from "./infrastructure/http/ShipmentController";
import { createShipmentRoutes } from "./infrastructure/http/ShipmentRoutes";
import { errorHandler, notFoundHandler } from "./infrastructure/http/errorHandler";
import { FindShipmentById } from "./application/use-cases/FindShipmentById";
import { CreateShipment } from "./application/use-cases/CreateShipment";
import type { ShipmentRepository } from "./domain/repositories/ShipmentRepository";
import { FindShipmentByTrackingNumber } from "./application/use-cases/FindShypmentByTrackingNumber";

interface AppDependencies {
    repository: ShipmentRepository;
}

export function createApp({ repository }: AppDependencies) {
    const app = express();

    app.use(express.json());

    app.use((req, _res, next) => {
        console.log("REQUEST:", req.method, req.url);
        next();
    });

    // Dependency Injection
    const pickupShipment = new PickupShipment(repository);
    const shipmentById = new FindShipmentById(repository);
    const shipmentByTrackingNumber = new FindShipmentByTrackingNumber(repository);
    const createShipment = new CreateShipment(repository);
    const controller = new ShipmentController(pickupShipment, shipmentById, shipmentByTrackingNumber, createShipment);

    app.use("/shipments", createShipmentRoutes(controller));

    app.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok" });
    })

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}