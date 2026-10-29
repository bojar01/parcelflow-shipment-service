import { Weight } from "../value-objects/Weight";
import { Contact } from "../value-objects/Contact";
import { Address } from "../value-objects/Address";
import { ShipmentPickedUp } from "../events/ShipmentPickedUp";

type ShipmentStatus = | "CREATED" | "PICKED_UP" | "CANCELLED";


interface CreateShipmentProps {
    id: string;
    trackingNumber: string;
    senderId: string;
    sender: Contact;
    recipient: Contact;
    weight: Weight;
}

interface ReconstituteShipmentProps {
    id: string;
    trackingNumber: string;
    senderId: string;
    sender: Contact;
    recipient: Contact;
    weight: Weight;
    status: ShipmentStatus;
}


export class Shipment {
    private constructor(
        public readonly id: string,
        public readonly trackingNumber: string,

        public readonly senderId: string,

        private readonly sender: Contact,
        private recipient: Contact,

        private readonly weight: Weight,
        private status: ShipmentStatus
    ) { }

    private domainEvents: ShipmentPickedUp[] = [];

    static create(
        props: CreateShipmentProps
    ): Shipment {
        if (!props.id.trim()) {
            throw new Error("Shipment id is required");
        }
        if (!props.trackingNumber.trim()) {
            throw new Error("Tracking number is required");
        }
        if (!props.senderId.trim()) {
            throw new Error("Sender id is required");
        }

        return new Shipment(
            props.id,
            props.trackingNumber,
            props.senderId,
            props.sender,
            props.recipient,
            props.weight,
            "CREATED"
        )
    }

    static reconstitute(props: ReconstituteShipmentProps): Shipment {
        return new Shipment(
            props.id,
            props.trackingNumber,
            props.senderId,
            props.sender,
            props.recipient,
            props.weight,
            props.status
        )
    }

    cancel(): void {
        if (this.status === "CANCELLED") {
            throw new Error("Shipment already canceled");
        }

        if (this.status === "PICKED_UP") {
            throw new Error("Shipment already picked");
        }

        this.status = "CANCELLED";
    }

    pickup(): void {
        if (this.status === "CANCELLED") {
            throw new Error("Shipment is canceled");
        }

        if (this.status === "PICKED_UP") {
            throw new Error("Shipment is already picked up");
        }

        this.status = "PICKED_UP"

        this.domainEvents.push(
            new ShipmentPickedUp(this.id, new Date())
        );
    }

    changeRecipientAddress(address: Address): Shipment {
        if (this.status !== "CREATED") {
            throw new Error('Shipment is already treated')
        }

        const newRecipient = this.recipient.withAddress(address);
        this.recipient = newRecipient
        return this
    }

    getWeight(): Weight {
        return this.weight;
    }

    getStatus(): ShipmentStatus {
        return this.status;
    }

    getSender(): Contact {
        return this.sender
    }

    getRecipient(): Contact {
        return this.recipient
    }

    getDomainEvents(): readonly ShipmentPickedUp[] {
        return [...this.domainEvents];
    }

    pullDomainEvents(): ShipmentPickedUp[] {
        const events = this.domainEvents
        this.domainEvents = [];
        return events;
    }
}