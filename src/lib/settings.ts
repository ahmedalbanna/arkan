// Define types for better type safety
export interface CurrencyDetails {
    iban: string;
}

export interface BankAccount {
    bankName: string;
    accountHolder: string;
    currencies: {
        SAR?: CurrencyDetails;
        USD?: CurrencyDetails;
        YER?: CurrencyDetails;
    };
}

export interface PublicSettings {
    bankAccounts: BankAccount[];
}
