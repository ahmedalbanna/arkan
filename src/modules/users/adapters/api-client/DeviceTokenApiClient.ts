
'use client';

export async function saveDeviceToken(userId: string, token: string): Promise<void> {
  await fetch('/api/fcm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, token }),
  });
}
