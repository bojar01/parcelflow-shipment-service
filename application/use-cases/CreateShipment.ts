import { Shipment } from "../../domain/entities/Shipment";
import { ShipmentRepository } from "../../domain/repositories/ShipmentRepository";
import { TrackingNumberGenerator } from "../../domain/services/TrackingNumberGenerator";
import { Contact } from "../../domain/value-objects/Contact";
import { Weight } from "../../domain/value-objects/Weight";

interface CreateShipmentInput {
    senderId: string;
    sender: Contact;
    recipient: Contact;
    weight: Weight;
}

export class CreateShipment {
    constructor(
        private readonly repository: ShipmentRepository
    ) { }

    async execute(input: CreateShipmentInput): Promise<Shipment> {
        const shipment = Shipment.create({
            id: crypto.randomUUID(),
            trackingNumber: TrackingNumberGenerator.generate(),
            senderId: input.senderId,
            sender: input.sender,
            recipient: input.recipient,
            weight: input.weight
        })

        await this.repository.save(shipment)

        return shipment;
    }

}