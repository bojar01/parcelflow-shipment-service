import { createApp } from "./app";
import { prisma } from "./infrastructure/database/prisma";
import { PrismaShipmentRepository } from "./infrastructure/persistence/PrismaShipmentRepository";

const PORT = Number(process.env.PORT ?? 3100);

const repository = new PrismaShipmentRepository(prisma);

const app = createApp({ repository });

app.listen(PORT, () => {
    console.log(`Shipment Service running on port ${PORT}`)
})