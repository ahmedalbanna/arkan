
'use client';

/**
 * Submits the payment proof form data to the backend API.
 * @param formData The FormData object containing the file and other details.
 * @param token The user's authentication token.
 * @returns A promise that resolves with the server's response.
 */
export async function submitPaymentProof({ formData, token }: { formData: FormData, token: string }) {
    if (!token) throw new Error("User not authenticated");

    const response = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit request.');
    }
    return response.json();
}
