import type { Shipment } from "../entities/Shipment";

export interface ShipmentRepository {
    findById(id: string): Promise<Shipment | null>;
    findByTrackingNumber(id: string): Promise<Shipment | null>;
    save(shipment: Shipment): Promise<void>;
}