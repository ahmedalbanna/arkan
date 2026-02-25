
export interface BankAccount {
    bankName: string;
    accountHolder: string;
    currencies: {
        [key: string]: {
            iban: string;
            swift?: string;
        }
    };
}
