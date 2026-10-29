import { describe, it, expect } from "vitest";
import { Address } from "../value-objects/Address";
import { Shipment } from "./Shipment";
import { createTestShipment } from "../../tests/factories/createTestShipment";
describe("Shipment", () => {

    describe('PICKED_UP STATUS', () => {
        it("Should change status to PICKED_UP", () => {
            const shipment = createTestShipment();
            shipment.pickup();

            expect(shipment.getStatus()).toBe("PICKED_UP");
        })

        it("Should prevent picking up twice", () => {
            const shipment = createTestShipment();

            shipment.pickup()

            expect(() => shipment.pickup()).toThrow();

            expect(shipment.getStatus()).toBe("PICKED_UP");
        })

        it("Should prevent pickup canceled shipment", () => {
            const shipment = createTestShipment();

            shipment.cancel()
            expect(() => shipment.pickup()).toThrow("Shipment is canceled");

            expect(shipment.getStatus()).toBe("CANCELLED")
        })
    })

    describe("CANCELLED STATUS", () => {
        it("Should change status to CANCELLED", () => {
            const shipment = createTestShipment();

            shipment.cancel();

            expect(shipment.getStatus()).toBe("CANCELLED");
        })

        it("Should prevent to cancelled twice ", () => {
            const shipment = createTestShipment();

            shipment.cancel();

            expect(() => shipment.cancel()).toThrow("Shipment already canceled");
            expect(shipment.getStatus()).toBe("CANCELLED");
        })

        it("Should prevent cancellation after pickup", () => {
            const shipment = createTestShipment();

            shipment.pickup();

            expect(() => shipment.cancel()).toThrow("Shipment already picked");

            expect(shipment.getStatus()).toBe("PICKED_UP")
        })
    })

    describe("RECIPIENT ADDRESS", () => {
        it("Should allow changing recipient address before pickup", () => {
            const shipment = createTestShipment();

            const newAddress = Address.create({
                number: 25,
                streetName: "rue Victor Hugo",
                postCode: "75000",
                city: "Paris"
            });

            shipment.changeRecipientAddress(newAddress);

            expect(shipment.getRecipient().address)
                .toEqual(newAddress);
        })

        it("Should prevent address change after pickup", () => {
            const shipment = createTestShipment();

            const originalAddress = shipment.getRecipient().address;

            const newAddress = Address.create({
                number: 25,
                streetName: "rue Victor Hugo",
                postCode: "75000",
                city: "Paris"
            });

            shipment.pickup();

            expect(() => shipment.changeRecipientAddress(newAddress)).toThrow();

            expect(shipment.getRecipient().address)
                .toEqual(originalAddress);
        })

        it("Should prevent address change after cancel", () => {
            const shipment = createTestShipment();

            const originalAddress = shipment.getRecipient().address;

            const newAddress = Address.create({
                number: 25,
                streetName: "rue Victor Hugo",
                postCode: "75000",
                city: "Paris"
            });

            shipment.cancel();

            expect(() => shipment.changeRecipientAddress(newAddress)).toThrow();

            expect(shipment.getRecipient().address)
                .toEqual(originalAddress);
        })
    })

    describe("DOMAIN EVENTS", () => {
        it("Should emit ShipmentPickedUp when picked up", () => {
            const shipment = createTestShipment();

            shipment.pickup();

            const events = shipment.getDomainEvents();

            expect(events).toHaveLength(1);
            expect(events[0]).toEqual(
                expect.objectContaining({
                    type: "ShipmentPickedUp",
                    shipmentId: shipment.id,
                    occuredAt: expect.any(Date)
                })
            );
        })

        it("Should ensure retrieve events and delete list", () => {
            const shipment = createTestShipment();
            shipment.pickup();

            const events = shipment.pullDomainEvents();

            expect(events).toHaveLength(1);

            expect(events[0]).toEqual(
                expect.objectContaining({
                    type: "ShipmentPickedUp",
                    shipmentId: shipment.id,
                    occuredAt: expect.any(Date)
                })
            );

            expect(shipment.getDomainEvents()).toHaveLength(0);

        })
    })

    describe("RECONSTITUTION", () => {
        it("Should restore a picked up shipment", () => {
            const original = createTestShipment();

            original.pickup();

            const restored = Shipment.reconstitute({
                id: original.id,
                trackingNumber: original.trackingNumber,
                senderId: original.senderId,
                sender: original.getSender(),
                recipient: original.getRecipient(),
                weight: original.getWeight(),
                status: "PICKED_UP"
            });

            expect(restored.getStatus()).toBe("PICKED_UP");

            expect(restored.getDomainEvents()).toHaveLength(0);
        });

        it("Should prevent cancellation of a reconstituted picked up shipment", () => {
            const original = createTestShipment();

            original.pickup();

            const restored = Shipment.reconstitute({
                id: original.id,
                trackingNumber: original.trackingNumber,
                senderId: original.senderId,
                sender: original.getSender(),
                recipient: original.getRecipient(),
                weight: original.getWeight(),
                status: original.getStatus()
            });

            expect(restored.getStatus()).toBe("PICKED_UP");

            expect(() => restored.cancel()).toThrow();

            expect(restored.getStatus()).toBe("PICKED_UP");
            expect(restored.getDomainEvents()).toHaveLength(0);
        });

    });
})