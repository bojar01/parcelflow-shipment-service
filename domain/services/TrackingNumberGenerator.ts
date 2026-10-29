import { randomBytes } from "node:crypto";

export class TrackingNumberGenerator {
    static generate(): string {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, "0");
        const random = randomBytes(8).toString("hex").toUpperCase();

        return `PF-${year}-${month}-${random}`;
    }
}