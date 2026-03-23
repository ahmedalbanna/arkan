/**
 * Generates a lightweight, custom browser fingerprint for security tracking.
 */
export async function generateFingerprint(): Promise<{ hash: string; data: any }> {
  if (typeof window === 'undefined') {
    return { hash: '', data: {} };
  }

  const data = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screen: `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    platform: (navigator as any).platform || 'unknown',
  };

  const str = JSON.stringify(data);
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    hash: hashHex,
    data
  };
}
