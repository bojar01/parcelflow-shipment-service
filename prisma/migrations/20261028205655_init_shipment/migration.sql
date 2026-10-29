-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('CREATED', 'PICKED_UP', 'CANCELLED');

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "tracking_number" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "sender_email" TEXT NOT NULL,
    "sender_street_number" INTEGER NOT NULL,
    "sender_street_name" TEXT NOT NULL,
    "sender_post_code" TEXT NOT NULL,
    "sender_city" TEXT NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "recipient_email" TEXT NOT NULL,
    "recipient_street_number" INTEGER NOT NULL,
    "recipient_street_name" TEXT NOT NULL,
    "recipient_post_code" TEXT NOT NULL,
    "recipient_city" TEXT NOT NULL,
    "weight_grams" INTEGER NOT NULL,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'CREATED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shipments_tracking_number_key" ON "shipments"("tracking_number");
