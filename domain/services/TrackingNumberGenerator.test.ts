import { describe, it, expect, afterEach, vi } from "vitest";
import { TrackingNumberGenerator } from "./TrackingNumberGenerator";

const TRACKING_NUMBER_FORMAT = /^PF-\d{4}-(0[1-9]|1[0-2])-[A-F0-9]{16}$/;

describe("TrackingNumberGenerator", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("Should generate a tracking number matching the expected format", () => {
        expect(TrackingNumberGenerator.generate()).toMatch(TRACKING_NUMBER_FORMAT);
    });

    it("Should pad single-digit months with a zero", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2027-01-15T12:00:00Z"));

        const trackingNumber = TrackingNumberGenerator.generate();

        expect(trackingNumber.startsWith("PF-2027-01-")).toBe(true);
        expect(trackingNumber).toMatch(TRACKING_NUMBER_FORMAT);
    });

    it("Should use UTC for both year and month", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-12-31T23:30:00Z"));

        expect(TrackingNumberGenerator.generate().startsWith("PF-2026-12-")).toBe(true);
    });

    it("Should generate unique tracking numbers", () => {
        const trackingNumbers = new Set(
            Array.from({ length: 1000 }, () => TrackingNumberGenerator.generate())
        );

        expect(trackingNumbers.size).toBe(1000);
    });
});
