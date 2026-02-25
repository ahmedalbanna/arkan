
export interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    description: string;
    type: 'offline' | 'online';
}
