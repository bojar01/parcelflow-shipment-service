interface CreateAddressProps {
    number: number;
    streetName: string;
    postCode: string;
    city: string;
}

export class Address {
    constructor(
        public readonly number: number,
        public readonly streetName: string,
        public readonly postCode: string,
        public readonly city: string,
    ) { }

    static create(props: CreateAddressProps): Address {
        return new Address(
            props.number,
            props.streetName,
            props.postCode,
            props.city
        )
    }
}