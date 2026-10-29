import type { Request, Response } from "express";
import { PickupShipment } from "../../application/use-cases/PickupShipment";
import { Shipment } from "../../domain/entities/Shipment";
import { FindShipmentById } from "../../application/use-cases/FindShipmentById";
import { Contact } from "../../domain/value-objects/Contact";
import { Address } from "../../domain/value-objects/Address";
import { Weight } from "../../domain/value-objects/Weight";
import { CreateShipment } from "../../application/use-cases/CreateShipment";
import { createShipmentSchema } from "./schemas/CreateShipmentSchema";
import { FindShipmentByTrackingNumber } from "../../application/use-cases/FindShypmentByTrackingNumber";

export class ShipmentController {
    constructor(
        private readonly pickupShipment: PickupShipment,
        private readonly shipment: FindShipmentById,
        private readonly findShipmentByTrackingNumber: FindShipmentByTrackingNumber,
        private readonly createShipment: CreateShipment,

    ) { }

    async pickup(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        if (typeof id !== "string") {
            res.status(400).json({
                error: "Invalid shipment ID"
            });
            return;
        }

        try {
            await this.pickupShipment.execute(id);

            res.status(204).send();
        } catch (error) {
            if (error instanceof Error &&
                error.message === "Shipment not found") {
                res.status(404).json({
                    status: 404,
                    error: "Shipment not found"
                });
                return;
            }

            if (error instanceof Error &&
                (error.message === "Shipment is canceled" ||
                    error.message === "Shipment is already picked up")) {
                res.status(409).json({
                    status: 409,
                    error: error.message
                });
                return;
            }

            throw error;
        }
    }

    async findByTrackingNumber(req: Request, res: Response): Promise<void | Shipment> {
        const { trackingNumber } = req.params

        if (typeof trackingNumber !== "string") {
            res.status(400).json({
                error: "Invalid tracking number"
            });
            return;
        }

        try {
            const shipment = await this.findShipmentByTrackingNumber.execute(trackingNumber);

            res.status(200).json({
                id: shipment.id,
                trackingNumber: shipment.trackingNumber,
                senderId: shipment.senderId,
                sender: shipment.getSender(),
                recipient: shipment.getRecipient(),
                weightGrams: shipment.getWeight().grams,
                status: shipment.getStatus()
            });

        } catch (error) {
            if (error instanceof Error &&
                error.message === "Shipment not found") {
                res.status(404).json({
                    status: 404,
                    error: "Shipment not found"
                });
                return;
            }

            throw error;
        }
    }

    async findById(req: Request, res: Response): Promise<void | Shipment> {
        const { id } = req.params

        if (typeof id !== "string") {
            res.status(400).json({
                error: "Invalid shipment ID"
            });
            return;
        }

        try {
            const shipment = await this.shipment.execute(id);

            res.status(200).json({
                id: shipment.id,
                trackingNumber: shipment.trackingNumber,
                senderId: shipment.senderId,
                sender: shipment.getSender(),
                recipient: shipment.getRecipient(),
                weightGrams: shipment.getWeight().grams,
                status: shipment.getStatus()
            });

        } catch (error) {
            if (error instanceof Error &&
                error.message === "Shipment not found") {
                res.status(404).json({
                    status: 404,
                    error: "Shipment not found"
                });
                return;
            }

            throw error;
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        const result = createShipmentSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                error: "Invalid shipment data",
                details: result.error.issues
            });
            return;
        }

        const data = result.data;

        const sender = Contact.create({
            name: data.sender.name,
            email: data.sender.email,
            address: Address.create(data.sender.address)
        });

        const recipient = Contact.create({
            name: data.recipient.name,
            email: data.recipient.email,
            address: Address.create(data.recipient.address)
        });

        const shipment = await this.createShipment.execute({
            senderId: data.senderId,
            sender,
            recipient,
            weight: Weight.create(data.weightGrams)
        });

        res.status(201).json({
            id: shipment.id,
            trackingNumber: shipment.trackingNumber,
            status: shipment.getStatus()
        });
    }
}