import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { createApp } from "../../app";
import { InMemoryShipmentRepository } from "../../infrastructure/persistence/InMemoryShipmentRepository";
import { createTestShipment } from "../factories/createTestShipment";

describe("Shipment HTTP API", () => {
    let repository: InMemoryShipmentRepository;
    let app: Express;

    const validPayload = {
        senderId: "customer-123",
        sender: {
            name: "Dupont",
            email: "dupont@test.com",
            address: {
                number: 12,
                streetName: "rue de Paris",
                postCode: "44000",
                city: "Nantes"
            }
        },
        recipient: {
            name: "Martin",
            email: "martin@test.com",
            address: {
                number: 25,
                streetName: "rue Victor Hugo",
                postCode: "75000",
                city: "Paris"
            }
        },
        weightGrams: 2600
    };

    // Fresh repository and app per test: no state shared between tests
    beforeEach(() => {
        vi.spyOn(console, "log").mockImplementation(() => { });
        repository = new InMemoryShipmentRepository();
        app = createApp({ repository });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("POST /shipments", () => {
        it("should create a shipment and return 201", async () => {
            const response = await request(app)
                .post("/shipments")
                .send(validPayload);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                id: expect.any(String),
                trackingNumber: expect.stringMatching(
                    /^PF-\d{4}-(0[1-9]|1[0-2])-[A-F0-9]{16}$/
                ),
                status: "CREATED"
            });

            const saved = await repository.findById(response.body.id);
            expect(saved?.getStatus()).toBe("CREATED");
            expect(saved?.trackingNumber).toBe(response.body.trackingNumber);
        });

        it("should ignore a trackingNumber sent by the client", async () => {
            const response = await request(app)
                .post("/shipments")
                .send({ ...validPayload, trackingNumber: "PF-CLIENT-FORGED" });

            expect(response.status).toBe(201);
            expect(response.body.trackingNumber).not.toBe("PF-CLIENT-FORGED");
        });

        it("should return 400 when payload is invalid", async () => {
            const response = await request(app)
                .post("/shipments")
                .send({ ...validPayload, weightGrams: -1, sender: { ...validPayload.sender, email: "not-an-email" } });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Invalid shipment data");
            expect(response.body.details).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ path: ["weightGrams"] }),
                    expect.objectContaining({ path: ["sender", "email"] })
                ])
            );
        });

        it("should return 400 when body is empty", async () => {
            const response = await request(app)
                .post("/shipments")
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Invalid shipment data");
        });
    });

    describe("GET /shipments/:id", () => {
        it("should return 200 with the shipment", async () => {
            const shipment = createTestShipment();
            await repository.save(shipment);

            const response = await request(app).get(`/shipments/${shipment.id}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: shipment.id,
                trackingNumber: shipment.trackingNumber,
                senderId: "customer-123",
                weightGrams: 2600,
                status: "CREATED"
            });
        });

        it("should return 404 when shipment does not exist", async () => {
            const response = await request(app).get("/shipments/unknown-shipment");

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                status: 404,
                error: "Shipment not found"
            });
        });
    });

    describe("GET /shipments/tracking/:trackingNumber", () => {
        it("should return 200 with the shipment", async () => {
            const shipment = createTestShipment();
            await repository.save(shipment);

            const response = await request(app).get(`/shipments/tracking/${shipment.trackingNumber}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: shipment.id,
                trackingNumber: shipment.trackingNumber,
                status: "CREATED"
            });
        });

        it("should return 404 when tracking number does not exist", async () => {
            const response = await request(app).get("/shipments/tracking/PF-2026-10-0000000000000000");

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                status: 404,
                error: "Shipment not found"
            });
        });
    });

    describe("POST /shipments/:id/pickup", () => {
        it("should pick up the shipment and return 204", async () => {
            const shipment = createTestShipment();
            await repository.save(shipment);

            const response = await request(app).post(`/shipments/${shipment.id}/pickup`);

            expect(response.status).toBe(204);
            expect(response.body).toEqual({});

            const updated = await repository.findById(shipment.id);
            expect(updated?.getStatus()).toBe("PICKED_UP");
        });

        it("should return 409 when shipment is already picked up", async () => {
            const shipment = createTestShipment();
            await repository.save(shipment);

            await request(app).post(`/shipments/${shipment.id}/pickup`).expect(204);
            const response = await request(app).post(`/shipments/${shipment.id}/pickup`);

            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                status: 409,
                error: "Shipment is already picked up"
            });
        });

        it("should return 409 when shipment is cancelled", async () => {
            const shipment = createTestShipment();
            shipment.cancel();
            await repository.save(shipment);

            const response = await request(app).post(`/shipments/${shipment.id}/pickup`);

            expect(response.status).toBe(409);
            expect(response.body.error).toBe("Shipment is canceled");

            const unchanged = await repository.findById(shipment.id);
            expect(unchanged?.getStatus()).toBe("CANCELLED");
        });

        it("should return 404 when shipment does not exist", async () => {
            const response = await request(app).post("/shipments/unknown-shipment/pickup");

            expect(response.status).toBe(404);
        });
    });

    it("should chain create, find and pickup through the API", async () => {
        const created = await request(app).post("/shipments").send(validPayload).expect(201);

        await request(app).get(`/shipments/${created.body.id}`).expect(200);
        await request(app).post(`/shipments/${created.body.id}/pickup`).expect(204);

        const found = await request(app).get(`/shipments/${created.body.id}`).expect(200);
        expect(found.body.status).toBe("PICKED_UP");
    });

    describe("GET /shipments/tracking/:trackingNumber", () => {
        it("should return 200 when tracking number exists", async () => {
            const shipment = createTestShipment();
            await repository.save(shipment);

            const response = await request(app)
                .get(`/shipments/tracking/${shipment.trackingNumber}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: shipment.id,
                trackingNumber: shipment.trackingNumber,
                status: "CREATED"
            });
        });

        it("should return 404 when tracking number does not exist", async () => {
            const response = await request(app)
                .get("/shipments/tracking/PF-2026-10-FFFFFFFFFFFFFFFF");

            expect(response.status).toBe(404);
        });
    });
});
