'use server';

/**
 * @fileOverview Text styling prompt definitions
 */


// Style instructions for text rewriting
export const styleInstructions: Record<string, string> = {
    'Informal': 'Use a casual, conversational tone. Employ contractions (e.g., "don\'t", "it\'s") and simpler vocabulary. The goal is to make the text feel like a friendly chat.',
    'Friendly': 'Adopt a warm, approachable, and personable tone. Use positive language and address the reader directly where appropriate. The text should feel welcoming.',
    'Simple': 'Rewrite the text using straightforward language and simple sentence structures. Avoid jargon and complex concepts. The primary goal is maximum clarity and ease of understanding for a broad audience.',
    'Formal': 'Use a professional, objective, and respectful tone. Avoid contractions, slang, and overly casual phrasing. The structure should be logical and sentences should be grammatically precise.',
    'Professional': 'Rewrite the text to be suitable for a business or professional context. Focus on clarity, conciseness, and a respectable tone. The language should be polished and confident.',
    'Narrative': 'Rewrite the text in a storytelling style. Focus on conveying a sequence of events or a personal experience, with a clear beginning, middle, and end. Use descriptive details to engage the reader.',
    'Descriptive': 'Rewrite the text with vivid language and sensory details (sight, sound, smell, touch, taste) to create a clear and immersive picture for the reader.',
    'Expository': 'Rewrite the text to explain, inform, or clarify a topic. Present facts and ideas in a clear, logical, and organized manner. The tone should be neutral and educational.',
    'Argumentative': 'Rewrite the text to present a clear and well-supported argument. State a clear position and back it up with logical reasoning and evidence.',
    'Persuasive': 'Rewrite the text with the primary goal of influencing the reader\'s thoughts or actions. Use rhetorical devices, emotional appeals, and strong calls to action.',
    'Creative': 'Rewrite the text with imagination and originality. Feel free to use figurative language, unique expressions, and an unconventional style to make the text more engaging and memorable.',
    'Technical': 'Rewrite the text using precise language and terminology relevant to a specific technical field. The focus should be on accuracy and detail, assuming an audience with some domain knowledge.',
    'Academic': 'Rewrite the text to adhere to academic conventions. Use formal language, structured arguments, and an objective tone. Cite evidence where appropriate (if context is available).',
    'Journalistic': 'Rewrite the text in the style of a news report. Focus on factual information, objectivity, and a concise presentation of events. Use the "inverted pyramid" structure where the most important information comes first.',
    'Poetic': 'Rewrite the text with a focus on rhythm, imagery, and emotional expression. Use figurative language like metaphors and similes to create a more artistic and evocative piece.',
    'Satirical': 'Rewrite the text using humor, irony, or exaggeration to criticize or mock a subject. The tone should be witty and critical, often with a humorous underlying message.',
    'Humorous': 'Rewrite the text with the main intention of being funny or amusing. Use jokes, wit, and lighthearted language to entertain the reader.'
};

// Rewrite text prompt
export const textStylistPrompt = `You are an expert editor. Your task is to rewrite the following text based on the provided style instruction, preserving the core meaning and markdown formatting.
Return only the rewritten text.

**Style Instruction**: {{instruction}}

**Original Text:**
---
{{text}}
---`;

// Summarize text with ratio prompt
export const summarizeTextWithRatioPrompt = `You are an expert summarizer. Your task is to summarize the following text to approximately {{ratio}}% of its original length while preserving the most important information and maintaining the original tone and style.

**Original Text:**
---
{{text}}
---`;
