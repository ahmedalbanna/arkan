
export interface TransactionProperties {
    id: string;
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
