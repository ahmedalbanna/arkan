import { PaymentMethod } from "@/modules/billing/domain/entities/PaymentMethod";


/**
 * Default payment methods for Yemen including:
 * - E-Wallets (محافظ إلكترونية)
 * - Bank Transfers (تحويلات بنكية)
 * - Local & International Transfers (حوالات محلية ودولية)
 */
export const defaultPaymentMethods: PaymentMethod[] = [
    // E-Wallets - المحافظ الإلكترونية
    {
        id: 'cac-bank-wallet',
        type: 'e-wallet',
        name: 'CAC Bank',
        displayName: 'كاك بنك',
        icon: 'wallet',
        isActive: true,
        wallet: {
            name: 'Arkan Platform',
            id: 'cac-bank',
            number: '770123456'
        },
        processingTime: 'فوري',
        instructions: 'قم بتحويل المبلغ المطلوب إلى رقم المحفظة وأرسل إيصال الدفع'
    },
    {
        id: 'mobi-cash-wallet',
        type: 'e-wallet',
        name: 'Mobi Cash',
        displayName: 'موبي كاش',
        icon: 'smartphone',
        isActive: true,
        wallet: {
            name: 'Arkan Platform',
            id: 'mobi-cash',
            number: '712345678'
        },
        processingTime: 'فوري',
        instructions: 'استخدم تطبيق موبي كاش للتحويل إلى رقم الحساب المذكور'
    },
    {
        id: 'yemen-mobile-wallet',
        type: 'e-wallet',
        name: 'Yemen Mobile',
        displayName: 'يمن موبايل',
        icon: 'smartphone',
        isActive: true,
        wallet: {
            name: 'Arkan Platform',
            id: 'yemen-mobile',
            number: '730123456'
        },
        processingTime: 'فوري',
        instructions: 'احفظ رقم المحفظة وقم بالتحويل من خلال *133#'
    },
    {
        id: 'mtn-mobile-money',
        type: 'e-wallet',
        name: 'MTN Mobile Money',
        displayName: 'MTN موبايل موني',
        icon: 'smartphone',
        isActive: true,
        wallet: {
            name: 'Arkan Platform',
            id: 'mtn-mobile-money',
            number: '782345678'
        },
        processingTime: 'فوري',
        instructions: 'استخدم رمز *141# للتحويل إلى رقم المحفظة'
    },
    {
        id: 'you-telecom-wallet',
        type: 'e-wallet',
        name: 'YOU Telecom',
        displayName: 'يو تليكوم',
        icon: 'smartphone',
        isActive: true,
        wallet: {
            name: 'Arkan Platform',
            id: 'you-telecom',
            number: '790123456'
        },
        processingTime: 'فوري',
        instructions: 'قم بالتحويل من خلال تطبيق يو أو استخدم *155#'
    },
    
    // Bank Transfers - التحويلات البنكية
    {
        id: 'aljazira-bank',
        type: 'bank',
        name: 'AlJazira Bank',
        displayName: 'بنك الجزيرة',
        icon: 'building',
        isActive: true,
        accountHolder: 'Arkan Platform Services',
        currencies: {
            YER: {
                iban: 'YE01AJIB0001234567890123456',
            },
            USD: {
                iban: 'YE02AJIB0002234567890123456',
                swift: 'AJIBYHSA'
            }
        },
        processingTime: '1-2 يوم عمل',
        instructions: 'قم بزيارة أقرب فرع أو استخدم الخدمات المصرفية الإلكترونية'
    },
    {
        id: 'tadhamon-bank',
        type: 'bank',
        name: 'Tadhamon Bank',
        displayName: 'بنك التضامن الإسلامي',
        icon: 'building',
        isActive: true,
        accountHolder: 'Arkan Platform Services',
        currencies: {
            YER: {
                iban: 'YE03TDMN0003234567890123456',
            },
            USD: {
                iban: 'YE04TDMN0004234567890123456',
                swift: 'TDMNYHSA'
            }
        },
        processingTime: '1-2 يوم عمل',
        instructions: 'التحويل متاح من خلال الفروع أو الخدمات الإلكترونية'
    },
    {
        id: 'cac-bank-transfer',
        type: 'bank',
        name: 'CAC Bank',
        displayName: 'بنك الكريمي - كاك بنك',
        icon: 'building',
        isActive: true,
        accountHolder: 'Arkan Platform Services',
        currencies: {
            YER: {
                iban: 'YE05CACB0005234567890123456',
            },
            USD: {
                iban: 'YE06CACB0006234567890123456',
                swift: 'CACBYHSA'
            },
            SAR: {
                iban: 'YE07CACB0007234567890123456',
                swift: 'CACBYHSA'
            }
        },
        processingTime: '1-2 يوم عمل',
        instructions: 'يمكنك الإيداع من خلال الصراف الآلي أو الفروع'
    },
    
    // Local Transfers - الحوالات المحلية
    {
        id: 'local-transfer',
        type: 'local-transfer',
        name: 'Local Money Transfer',
        displayName: 'حوالة محلية',
        icon: 'banknote',
        isActive: true,
        accountHolder: 'Arkan Platform',
        wallet: {
            name: 'Arkan Platform',
            id: 'other',
            number: 'ARKAN-2024'
        },
        processingTime: 'فوري - 24 ساعة',
        instructions: 'قم بإرسال الحوالة باسم "Arkan Platform" مع رقم المستخدم الخاص بك كمرجع'
    },
    
    // International Transfers - الحوالات الدولية
    {
        id: 'international-transfer',
        type: 'international-transfer',
        name: 'International Wire Transfer',
        displayName: 'حوالة دولية',
        icon: 'globe',
        isActive: true,
        accountHolder: 'Arkan Platform LLC',
        currencies: {
            USD: {
                iban: 'YE08INTL0008234567890123456',
                swift: 'INTLYHSA'
            }
        },
        processingTime: '2-5 أيام عمل',
        instructions: 'استخدم معلومات SWIFT للتحويل الدولي. تأكد من إضافة معرف المستخدم في الوصف'
    }
];

/**
 * Get wallet provider display name in Arabic
 */
export function getWalletProviderName(provider: string): string {
    const names: Record<string, string> = {
        'cac-bank': 'كاك بنك',
        'mobi-cash': 'موبي كاش',
        'yemen-mobile': 'يمن موبايل',
        'mtn-mobile-money': 'MTN موبايل موني',
        'you-telecom': 'يو تليكوم',
        'aljazira-bank': 'بنك الجزيرة',
        'tadhamon-bank': 'بنك التضامن',
        'other': 'أخرى'
    };
    return names[provider] || provider;
}

/**
 * Get payment method icon based on type
 */
export function getPaymentMethodIcon(type: string): string {
    const icons: Record<string, string> = {
        'e-wallet': 'wallet',
        'bank': 'building',
        'local-transfer': 'banknote',
        'international-transfer': 'globe'
    };
    return icons[type] || 'credit-card';
}
