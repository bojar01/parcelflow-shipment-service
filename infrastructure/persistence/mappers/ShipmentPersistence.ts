export interface ShipmentPersistence {
    id: string;
    trackingNumber: string;
    senderId: string;

    // Expéditeur
    senderName: string;
    senderEmail: string;
    senderStreetNumber: number;
    senderStreetName: string;
    senderPostCode: string;
    senderCity: string;

    // Destinataire
    recipientName: string;
    recipientEmail: string;
    recipientStreetNumber: number;
    recipientStreetName: string;
    recipientPostCode: string;
    recipientCity: string;

    // Colis
    weightGrams: number;
    status: "CREATED" | "PICKED_UP" | "CANCELLED";
}
