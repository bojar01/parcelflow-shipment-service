import type { ShipmentRepository } from "../../domain/repositories/ShipmentRepository";
import { Shipment } from "../../domain/entities/Shipment";

export class InMemoryShipmentRepository implements ShipmentRepository {
    private shipments = new Map<string, Shipment>();

    async findById(id: string): Promise<Shipment | null> {
        return this.shipments.get(id) ?? null;
    }

    async findByTrackingNumber(trackingNumber: string): Promise<Shipment | null> {
        for (const shipment of this.shipments.values()) {
            if (shipment.trackingNumber === trackingNumber) {
                return shipment;
            }
        }

        return null;
    }

    async save(shipment: Shipment): Promise<void> {
        this.shipments.set(shipment.id, shipment);
    }
}