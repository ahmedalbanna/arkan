
import type { BankAccount } from '@/lib/types';

export const defaultBankAccounts: BankAccount[] = [
    {
        bankName: 'Default Bank',
        accountHolder: 'Your Company Name',
        currencies: {
            SAR: { iban: 'SA03 8000 0000 6080 1016 7519' },
            USD: { iban: 'USD IBAN HERE' },
            YER: { iban: 'YER IBAN HERE' },
        }
    }
];
