export class Weight {
    private constructor(
        public readonly grams: number
    ) { }

    static create(grams: number): Weight {
        if (!Number.isInteger(grams) || grams <= 0) {
            throw new Error(
                "Weight must be a positive integer"
            );
        }

        return new Weight(grams);
    }

    toKilograms(): number {
        return this.grams / 1000;
    }
}