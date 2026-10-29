import type { ShipmentRepository } from "../../domain/repositories/ShipmentRepository";
import { Shipment } from "../../domain/entities/Shipment";

export class InMemoryShipmentRepository implements ShipmentRepository {
    private shipments = new Map<string, Shipment>();

    findById(id: string): Promise<Shipment | null> {
        return Promise.resolve(this.shipments.get(id) ?? null);
    }

    findByTrackingNumber(trackingNumber: string): Promise<Shipment | null> {
        for (const shipment of this.shipments.values()) {
            if (shipment.trackingNumber === trackingNumber) {
                return Promise.resolve(shipment);
            }
        }

        return Promise.resolve(null);
    }

    save(shipment: Shipment): Promise<void> {
        this.shipments.set(shipment.id, shipment);
        return Promise.resolve();
    }
}
