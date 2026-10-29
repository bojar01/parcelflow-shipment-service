import { Shipment } from "../../domain/entities/Shipment"
import { Address } from "../../domain/value-objects/Address"
import { Contact } from "../../domain/value-objects/Contact"
import { Weight } from "../../domain/value-objects/Weight"

export function createTestShipment(): Shipment {
    const address = Address.create({
        number: 12,
        streetName: "rue de Paris",
        postCode: "44000",
        city: "Nantes"

    })

    const contact = Contact.create({
        name: "Dupont",
        email: "dupont@test.com",
        address: address
    })

    const shipment = Shipment.create({
        id: crypto.randomUUID(),
        trackingNumber: "PF-2026-00001",
        senderId: "customer-123",
        sender: contact,
        recipient: contact,
        weight: Weight.create(2600)
    })

    return shipment
}