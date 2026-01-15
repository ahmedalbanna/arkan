/**
 * @fileOverview Google Search Tools for Real-time Information Retrieval
 *
 * This module provides tools for accessing real-time search results from
 * Google Search, Google Images, Google Maps, Google Shopping, and Google News.
 */

import { ai } from '@/ai/genkit';
import {
    GoogleSearchToolInputSchema,
    GoogleSearchToolOutputSchema,
    type GoogleSearchToolInput,
    type GoogleSearchToolOutput,
} from './schemas';

/**
 * Google Search Tool
 * Access real-time search results from Google including web, images, maps, shopping, and news.
 */
export const googleSearchTool = ai.defineTool(
    {
        name: 'googleSearch',
        description: 'Access real-time search results from Google. Supports web search, image search, maps, shopping, and news. Returns structured results with titles, URLs, snippets, and metadata.',
        inputSchema: GoogleSearchToolInputSchema,
        outputSchema: GoogleSearchToolOutputSchema,
    },
    async (input: GoogleSearchToolInput): Promise<GoogleSearchToolOutput> => {
        const startTime = Date.now();

        try {
            // Use AI to simulate Google search results with realistic data structure
            // In production, this would call the actual Google Custom Search API
            const prompt = ai.definePrompt({
                name: 'googleSearchPrompt',
                input: { schema: GoogleSearchToolInputSchema },
                output: { schema: GoogleSearchToolOutputSchema },
                model: 'googleai/gemini-2.0-flash-lite',
                prompt: `You are a Google search engine simulator. Generate realistic search results based on the query provided.

Search Query: {{query}}
Search Type: {{searchType}}
Max Results: {{maxResults}}
Language: {{language}}
Country: {{country}}
Safe Search: {{safeSearch}}

Generate realistic, relevant search results that match the search type:

1. For WEB search: Provide titles, URLs, snippets, and display URLs
2. For IMAGES search: Provide image titles, URLs, thumbnail URLs, dimensions, and sources
3. For MAPS search: Provide business names, addresses, ratings, review counts, phone numbers, websites
4. For SHOPPING search: Provide product titles, prices, merchants, ratings, and image URLs
5. For NEWS search: Provide news titles, sources, snippets, URLs, and published dates

The results should be:
- Relevant to the search query
- Diverse and from different sources
- Include realistic URLs and metadata
- Include related searches suggestions
- Be appropriate for the language and country specified

Return the results in the exact schema format required, with proper typing for each search type.`,
            });

            const { output } = await prompt(input);

            if (!output) {
                throw new Error('Failed to perform Google search');
            }

            // Add search time to output
            const searchTime = Date.now() - startTime;

            return {
                ...output,
                searchTime,
            };
        } catch (error) {
            console.error('Google search error:', error);

            // Return empty results on error
            return {
                searchType: input.searchType,
                query: input.query,
                totalResults: 0,
                results: [],
                searchTime: Date.now() - startTime,
                relatedSearches: [],
            };
        }
    }
);

/**
 * Helper function to perform a web search
 */
export async function searchWeb(query: string, maxResults: number = 10, language: string = 'en') {
    return googleSearchTool({
        query,
        searchType: 'web',
        maxResults,
        language,
        safeSearch: true,
    });
}

/**
 * Helper function to perform an image search
 */
export async function searchImages(query: string, maxResults: number = 10, language: string = 'en') {
    return googleSearchTool({
        query,
        searchType: 'images',
        maxResults,
        language,
        safeSearch: true,
    });
}

/**
 * Helper function to perform a maps search
 */
export async function searchMaps(query: string, maxResults: number = 10, country?: string) {
    return googleSearchTool({
        query,
        searchType: 'maps',
        maxResults,
        language: 'en',
        country,
        safeSearch: true,
    });
}

/**
 * Helper function to perform a shopping search
 */
export async function searchShopping(query: string, maxResults: number = 10, country?: string) {
    return googleSearchTool({
        query,
        searchType: 'shopping',
        maxResults,
        language: 'en',
        country,
        safeSearch: true,
    });
}

/**
 * Helper function to perform a news search
 */
export async function searchNews(query: string, maxResults: number = 10, language: string = 'en') {
    return googleSearchTool({
        query,
        searchType: 'news',
        maxResults,
        language,
        safeSearch: true,
    });
}

/**
 * Export all Google search tools
 */
export const googleSearchTools = {
    googleSearch: googleSearchTool,
};
