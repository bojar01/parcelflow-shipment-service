import { ShipmentRepository } from "../../domain/repositories/ShipmentRepository";

export class PickupShipment {
    constructor(
        private readonly repository: ShipmentRepository
    ) { }

    async execute(id: string) {
        const shipment = await this.repository.findById(id);
        if (shipment === null) {
            throw new Error("Shipment not found")
        }
        shipment.pickup();

        await this.repository.save(shipment);
    }
}