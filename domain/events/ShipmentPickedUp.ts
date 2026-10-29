export class ShipmentPickedUp {
    readonly type = "ShipmentPickedUp";

    constructor(
        public readonly shipmentId: string,
        public readonly occuredAt: Date
    ) { }
}