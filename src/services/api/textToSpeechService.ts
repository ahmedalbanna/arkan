
'use client';

export interface TTSInput {
    text: string;
}

export interface TTSOutput {
    audioDataUri: string;
}

interface TTSApiVariables {
    data: TTSInput;
    token: string;
}

export async function textToSpeechApi(variables: TTSApiVariables): Promise<TTSOutput> {
    const { data, token } = variables;
    const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate speech');
    }
    return response.json();
}
