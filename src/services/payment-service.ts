
'use client';

import type { PricingPlan } from '@/lib/types';

export async function submitPaymentProof({ formData, token }: { formData: FormData, token: string }) {
    if (!token) throw new Error("User not authenticated");
    
    const response = await fetch('/api/purchase-request', {
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

export async function purchaseCreditsApi(
  plan: PricingPlan,
  token: string
): Promise<{ newBalance: number }> {
  const response = await fetch("/api/purchase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planId: plan.id, credits: plan.credits }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Purchase failed.");
  }
  return response.json();
}
