import { describe, it, expect, vi } from "vitest";
import { InMemoryShipmentRepository } from "../../infrastructure/persistence/InMemoryShipmentRepository";
import { Address } from "../../domain/value-objects/Address";
import { Contact } from "../../domain/value-objects/Contact";
import { Shipment } from "../../domain/entities/Shipment";
import { Weight } from "../../domain/value-objects/Weight";
import { PickupShipment } from "./PickupShipment";

describe("PickupShipment", () => {

    function createTestShipment(): Shipment {
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

    it("should pikcup and existing shipment", async () => {
        const repository = new InMemoryShipmentRepository();

        const shipment = createTestShipment()

        await repository.save(shipment);

        const useCase = new PickupShipment(repository);

        await useCase.execute(shipment.id);

        const updatedShipment = await repository.findById(shipment.id);

        expect(updatedShipment?.getStatus()).toBe("PICKED_UP");
    });

    it("Should reject pickup when shipment does not exist", async () => {
        const repository = new InMemoryShipmentRepository();

        const useCase = new PickupShipment(repository);

        await expect(
            useCase.execute('unknown-shipement')
        ).rejects.toThrow("Shipment not found");
    })

    it("Should prevent pickup of a cancelled shipment", async () => {
        const repository = new InMemoryShipmentRepository();

        const shipment = createTestShipment();

        shipment.cancel();

        await repository.save(shipment);

        const useCase = new PickupShipment(repository);

        await expect(
            useCase.execute(shipment.id)
        ).rejects.toThrow("Shipment is canceled");

        const savedShipment = await repository.findById(shipment.id);

        expect(savedShipment?.getStatus()).toBe("CANCELLED");
    })

    it("Should persist shipment after pickup", async () => {
        const repository = new InMemoryShipmentRepository();

        const shipment = createTestShipment();

        await repository.save(shipment);

        const saveSpy = vi.spyOn(repository, "save");

        const useCase = new PickupShipment(repository);

        await useCase.execute(shipment.id);

        expect(saveSpy).toHaveBeenCalledOnce();
        expect(saveSpy).toHaveBeenCalledWith(shipment);
    })


})