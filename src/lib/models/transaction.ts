
'use client';

import { format } from 'date-fns';

export interface TransactionProperties {
  id: string; // Firestore document ID
  userId: string;
  planId: string;
  planName: string;
  credits: number;
  price: number;
  userName: string;
  userEmail: string;
  status: 'pending' | 'verified' | 'rejected';
  proofUrl: string;
  createdAt: string;
  adminNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export class Transaction implements TransactionProperties {
    public id: string;
    public userId: string;
    public planId: string;
    public planName: string;
    public credits: number;
    public price: number;
    public userName: string;
    public userEmail: string;
    public status: 'pending' | 'verified' | 'rejected';
    public proofUrl: string;
    public createdAt: string;
    public adminNotes?: string;
    public verifiedAt?: string;
    public verifiedBy?: string;

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
}
