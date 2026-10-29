import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../app";
import { InMemoryShipmentRepository } from "../../infrastructure/persistence/InMemoryShipmentRepository";
import { createTestShipment } from "../factories/createTestShipment";

describe("HTTP error handling", () => {
    let repository: InMemoryShipmentRepository;
    let app: ReturnType<typeof createApp>;

    beforeEach(() => {
        vi.spyOn(console, "log").mockImplementation(() => { });
        repository = new InMemoryShipmentRepository();
        app = createApp({ repository });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return 400 JSON when body is malformed JSON", async () => {
        const response = await request(app)
            .post("/shipments")
            .set("Content-Type", "application/json")
            .send("{bad json");

        expect(response.status).toBe(400);
        expect(response.headers["content-type"]).toMatch(/application\/json/);
        expect(response.body).toEqual({
            status: 400,
            error: "Malformed JSON body"
        });
    });

    it("should return 413 JSON when body is too large", async () => {
        const response = await request(app)
            .post("/shipments")
            .set("Content-Type", "application/json")
            .send(JSON.stringify({ padding: "x".repeat(200_000) }));

        expect(response.status).toBe(413);
        expect(response.headers["content-type"]).toMatch(/application\/json/);
        expect(response.body.status).toBe(413);
    });

    it("should return 404 JSON for an unknown route", async () => {
        const response = await request(app).get("/unknown");

        expect(response.status).toBe(404);
        expect(response.headers["content-type"]).toMatch(/application\/json/);
        expect(response.body).toEqual({
            status: 404,
            error: "Route GET /unknown not found"
        });
    });

    // The repository spy replaces the method on the instance already injected in the app
    it("should return 500 JSON without leaking internals on unexpected error", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => { });
        const failure = new Error("connection refused at db.internal:5432");
        vi.spyOn(repository, "findById").mockRejectedValue(failure);

        const response = await request(app).get("/shipments/any-id");

        expect(response.status).toBe(500);
        expect(response.headers["content-type"]).toMatch(/application\/json/);
        expect(response.body).toEqual({
            status: 500,
            error: "Internal server error"
        });
        expect(response.body).not.toHaveProperty("stack");
        expect(response.text).not.toContain("db.internal");
        expect(response.text).not.toContain("connection refused");

        // Details are hidden from the client but kept in server logs for diagnosis
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("Unhandled error:", failure);
    });

    it("should return 500 JSON when an unexpected error happens during pickup", async () => {
        vi.spyOn(console, "error").mockImplementation(() => { });
        const shipment = createTestShipment();
        await repository.save(shipment);
        vi.spyOn(repository, "save").mockRejectedValue(new Error("write failed"));

        const response = await request(app).post(`/shipments/${shipment.id}/pickup`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            status: 500,
            error: "Internal server error"
        });
        expect(response.text).not.toContain("write failed");
    });
});
