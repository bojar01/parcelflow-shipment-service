import { Shipment } from "../../domain/entities/Shipment";
import { ShipmentRepository } from "../../domain/repositories/ShipmentRepository";

export class FindShipmentByTrackingNumber {
    constructor(
        private readonly repository: ShipmentRepository
    ) { }

    async execute(trackingNumber: string): Promise<Shipment> {
        const shipment = await this.repository.findByTrackingNumber(trackingNumber);
        if (shipment === null) {
            throw new Error("Shipment not found")
        }

        return shipment;
    }
}