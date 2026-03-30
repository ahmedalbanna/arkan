
import { type TransactionPropertiesType as TransactionProperties } from "../schemas/TransactionSchema";

export type { TransactionProperties };

export class Transaction implements TransactionProperties {
    public readonly id: string;
    public readonly userId: string;
    public readonly planId: string;
    public readonly planName: string;
    public readonly credits: number;
    public readonly price: number;
    public readonly userName: string;
    public readonly userEmail: string;
    public readonly status: 'pending' | 'verified' | 'rejected';
    public readonly proofUrl: string;
    public readonly createdAt: string;
    public readonly adminNotes?: string;
    public readonly verifiedAt?: string;
    public readonly verifiedBy?: string;

    constructor(props: TransactionProperties) {
        this.id = props.id;
        this.userId = props.userId;
        this.planId = props.planId;
        this.planName = props.planName;
        this.credits = props.credits;
        this.price = props.price;
        this.userName = props.userName;
        this.userEmail = props.userEmail;
        this.status = props.status;
        this.proofUrl = props.proofUrl;
        this.createdAt = props.createdAt;
        this.adminNotes = props.adminNotes;
        this.verifiedAt = props.verifiedAt;
        this.verifiedBy = props.verifiedBy;
    }

    /**
     * Returns a formatted string for the creation date.
     */
    public getFormattedDate(): string {
        return new Date(this.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    /**
     * Returns a formatted string for the price.
     */
    public getFormattedPrice(): string {
        return `$${this.price.toFixed(2)}`;
    }

    /**
     * Convert the entity to a plain properties object.
     */
    public toJSON(): TransactionProperties {
        return {
            id: this.id,
            userId: this.userId,
            planId: this.planId,
            planName: this.planName,
            credits: this.credits,
            price: this.price,
            userName: this.userName,
            userEmail: this.userEmail,
            status: this.status,
            proofUrl: this.proofUrl,
            createdAt: this.createdAt,
            adminNotes: this.adminNotes,
            verifiedAt: this.verifiedAt,
            verifiedBy: this.verifiedBy,
        };
    }
}
