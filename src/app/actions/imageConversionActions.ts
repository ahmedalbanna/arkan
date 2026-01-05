'use server';

const EXTERNAL_API_ENDPOINT = 'http://185.190.140.93:9003/api/convert';

export async function convertImageToSvgAction(formData: FormData): Promise<string> {
  const response = await fetch(EXTERNAL_API_ENDPOINT, { method: 'POST', body: formData });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'An error occurred during conversion.');
  }
  return response.text();
}
