import type { ShipmentRepository } from "../../domain/repositories/ShipmentRepository";
import type { Shipment } from "../../domain/entities/Shipment";

export class FindShipmentById {
    constructor(
        private readonly repository: ShipmentRepository
    ) { }

    async execute(id: string): Promise<Shipment> {
        const shipment = await this.repository.findById(id);
        if (shipment === null) {
            throw new Error("Shipment not found")
        }

        return shipment;
    }
}