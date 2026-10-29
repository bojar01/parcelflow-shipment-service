import { Shipment } from "../../domain/entities/Shipment";
import { ShipmentRepository } from "../../domain/repositories/ShipmentRepository";
import { PrismaClient } from "../../generated/prisma/client";
import { ShipmentMapper } from "./mappers/ShipmentMapper";

export class PrismaShipmentRepository implements ShipmentRepository {
    constructor(
        private readonly prisma: PrismaClient,
    ) { }

    async findByTrackingNumber(trackingNumber: string): Promise<Shipment | null> {
        const data = await this.prisma.shipment.findUnique({
            where: { trackingNumber }
        })

        if (!data) {
            return null;
        }

        return ShipmentMapper.toDomain(data)
    }

    async findById(id: string): Promise<Shipment | null> {
        const data = await this.prisma.shipment.findUnique({
            where: { id }
        })

        if (!data) {
            return null;
        }

        return ShipmentMapper.toDomain(data);
    }

    async save(shipment: Shipment): Promise<void> {
        const data = ShipmentMapper.toPersistence(shipment);

        await this.prisma.shipment.upsert({
            where: { id: shipment.id },
            create: data,
            update: data
        });
    }
}