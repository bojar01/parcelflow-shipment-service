import { Shipment } from "../../../domain/entities/Shipment";
import { Address } from "../../../domain/value-objects/Address";
import { Contact } from "../../../domain/value-objects/Contact";
import { Weight } from "../../../domain/value-objects/Weight";
import type { ShipmentPersistence } from "./ShipmentPersistence";

export class ShipmentMapper {
    static toPersistence(
        shipment: Shipment
    ): ShipmentPersistence {
        const sender = shipment.getSender();
        const recipient = shipment.getRecipient();
        const weight = shipment.getWeight();

        return {
            id: shipment.id,
            trackingNumber: shipment.trackingNumber,
            senderId: shipment.senderId,

            senderName: sender.name,
            senderEmail: sender.email,
            senderStreetNumber: sender.address.number,
            senderStreetName: sender.address.streetName,
            senderPostCode: sender.address.postCode,
            senderCity: sender.address.city,

            recipientName: recipient.name,
            recipientEmail: recipient.email,
            recipientStreetNumber: recipient.address.number,
            recipientStreetName: recipient.address.streetName,
            recipientPostCode: recipient.address.postCode,
            recipientCity: recipient.address.city,

            weightGrams: weight.grams,
            status: shipment.getStatus()
        };
    }

    static toDomain(data: ShipmentPersistence): Shipment {
        const senderAddress = Address.create({
            number: data.senderStreetNumber,
            streetName: data.senderStreetName,
            postCode: data.senderPostCode,
            city: data.senderCity
        });

        const sender = Contact.create({
            name: data.senderName,
            email: data.senderEmail,
            address: senderAddress
        });

        const recipientAddress = Address.create({
            number: data.recipientStreetNumber,
            streetName: data.recipientStreetName,
            postCode: data.recipientPostCode,
            city: data.recipientCity
        });

        const recipient = Contact.create({
            name: data.recipientName,
            email: data.recipientEmail,
            address: recipientAddress
        });

        const weight = Weight.create(data.weightGrams);

        return Shipment.reconstitute({
            id: data.id,
            trackingNumber: data.trackingNumber,
            senderId: data.senderId,
            sender,
            recipient,
            weight,
            status: data.status
        });
    }
}