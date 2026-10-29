
import { describe, it, expect } from "vitest";
import { ShipmentMapper } from "./ShipmentMapper";
import { Shipment } from "../../../domain/entities/Shipment";
import { Address } from "../../../domain/value-objects/Address";
import { Contact } from "../../../domain/value-objects/Contact";
import { Weight } from "../../../domain/value-objects/Weight";
import { createTestShipment } from "../../../tests/factories/createTestShipment";

describe("ShipmentMapper", () => {
    it("Should convert Shipment to persistence data", () => {
        const sender = Contact.create({
            name: "Dupont",
            email: "dupont@test.com",
            address: Address.create({
                number: 12,
                streetName: "rue de Paris",
                postCode: "44000",
                city: "Nantes"
            })
        });

        const recipient = Contact.create({
            name: "Martin",
            email: "martin@test.com",
            address: Address.create({
                number: 25,
                streetName: "rue Victor Hugo",
                postCode: "75000",
                city: "Paris"
            })
        });

        const shipment = Shipment.create({
            id: "shipment-123",
            trackingNumber: "PF-2026-00001",
            senderId: "customer-123",
            sender,
            recipient,
            weight: Weight.create(2600)
        });

        const data = ShipmentMapper.toPersistence(shipment);

        expect(data).toEqual({
            id: "shipment-123",
            trackingNumber: "PF-2026-00001",
            senderId: "customer-123",

            senderName: "Dupont",
            senderEmail: "dupont@test.com",
            senderStreetNumber: 12,
            senderStreetName: "rue de Paris",
            senderPostCode: "44000",
            senderCity: "Nantes",

            recipientName: "Martin",
            recipientEmail: "martin@test.com",
            recipientStreetNumber: 25,
            recipientStreetName: "rue Victor Hugo",
            recipientPostCode: "75000",
            recipientCity: "Paris",

            weightGrams: 2600,
            status: "CREATED"
        });
    });


    describe("toDomain", () => {
        it("Should reconstitute a picked up shipment", () => {
            const shipment = createTestShipment();

            shipment.pickup();

            const data = ShipmentMapper.toPersistence(shipment);

            const restored = ShipmentMapper.toDomain(data);

            expect(restored.id).toBe(shipment.id);
            expect(restored.getStatus()).toBe("PICKED_UP");

            expect(restored.getSender())
                .toEqual(shipment.getSender());

            expect(restored.getRecipient())
                .toEqual(shipment.getRecipient());

            expect(restored.getWeight())
                .toEqual(shipment.getWeight());

            expect(restored.getDomainEvents()).toHaveLength(0);
        });
    });

    describe("MAPPING ROUND TRIP", () => {
        it("Should preserve shipment data after mapping", () => {
            const original = createTestShipment();

            original.pickup();

            // Domaine → Persistance
            const data = ShipmentMapper.toPersistence(original);

            // Persistance → Domaine
            const restored = ShipmentMapper.toDomain(data);

            // Vérification des données métier
            expect(restored.id).toBe(original.id);
            expect(restored.trackingNumber).toBe(original.trackingNumber);
            expect(restored.senderId).toBe(original.senderId);

            expect(restored.getStatus()).toBe(original.getStatus());
            expect(restored.getWeight()).toEqual(original.getWeight());
            expect(restored.getSender()).toEqual(original.getSender());
            expect(restored.getRecipient()).toEqual(original.getRecipient());

            // La réhydratation ne doit pas générer d'événement
            expect(restored.getDomainEvents()).toHaveLength(0);
        });
    });

});
