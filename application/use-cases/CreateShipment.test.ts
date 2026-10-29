import { describe, it, expect, vi } from "vitest";
import { InMemoryShipmentRepository } from "../../infrastructure/persistence/InMemoryShipmentRepository";
import { createTestShipment } from "../../tests/factories/createTestShipment";
import { CreateShipment } from "./CreateShipment";

describe("CreateShipment", () => {

    it("Should create and persist a shipment", async () => {
        const repository = new InMemoryShipmentRepository();

        const useCase = new CreateShipment(repository);

        const shipmentTest = createTestShipment()

        const shipment = await useCase.execute({
            senderId: shipmentTest.senderId,
            sender: shipmentTest.getSender(),
            recipient: shipmentTest.getRecipient(),
            weight: shipmentTest.getWeight()
        });

        expect(shipment.getStatus()).toBe("CREATED");

        const saved = await repository.findById(shipment.id);

        expect(saved).not.toBeNull();
        expect(saved?.trackingNumber).toMatch(
            /^PF-\d{4}-(0[1-9]|1[0-2])-[A-F0-9]{16}$/
        );
    });

    it("Should call repository save when creating shipment", async () => {
        const repository = new InMemoryShipmentRepository();
        const saveSpy = vi.spyOn(repository, "save");

        const useCase = new CreateShipment(repository);
        const shipmentTest = createTestShipment();

        const shipment = await useCase.execute({
            senderId: shipmentTest.senderId,
            sender: shipmentTest.getSender(),
            recipient: shipmentTest.getRecipient(),
            weight: shipmentTest.getWeight()
        });

        expect(saveSpy).toHaveBeenCalledOnce();
        expect(saveSpy).toHaveBeenCalledWith(shipment);
    });

})