import { Address } from "./Address";

interface CreateContactProps {
    name: string;
    email: string;
    address: Address
}

export class Contact {
    constructor(
        public readonly name: string,
        public readonly email: string,
        public readonly address: Address
    ) { }

    static create(props: CreateContactProps): Contact {
        return new Contact(props.name, props.email, props.address)
    }

    withAddress(newAddress: Address): Contact {
        return Contact.create({
            name: this.name,
            email: this.email,
            address: newAddress
        });
    }
}