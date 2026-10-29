import { describe, it, expect } from "vitest";
import { FindShipmentById } from "./FindShipmentById";
import { InMemoryShipmentRepository } from "../../infrastructure/persistence/InMemoryShipmentRepository";
import { createTestShipment } from "../../tests/factories/createTestShipment";

describe("FindShipmentById", () => {
    it("Should return an existing shipment", async () => {
        const repository = new InMemoryShipmentRepository();
        const shipment = createTestShipment();

        await repository.save(shipment);

        const useCase = new FindShipmentById(repository);

        const result = await useCase.execute(shipment.id);

        expect(result.id).toBe(shipment.id);
        expect(result.getStatus()).toBe("CREATED");
    });

    it("Should throw if shipment does not exist", async () => {
        const repository = new InMemoryShipmentRepository();
        const useCase = new FindShipmentById(repository);

        await expect(
            useCase.execute("unknown-id")
        ).rejects.toThrow("Shipment not found");
    });
});