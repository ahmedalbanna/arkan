import { describe, expect, it } from '@jest/globals';
import type { GoogleSearchToolInput, GoogleSearchToolOutput } from '../schemas';

describe('Google Search Tool', () => {
    it('should have correct input schema properties', () => {
        const mockInput: GoogleSearchToolInput = {
            query: 'test query',
            searchType: 'web',
            maxResults: 10,
            language: 'en',
            safeSearch: true,
        };

        expect(mockInput.query).toBe('test query');
        expect(mockInput.searchType).toBe('web');
        expect(mockInput.maxResults).toBe(10);
    });

    it('should have correct output schema properties', () => {
        const mockOutput: GoogleSearchToolOutput = {
            searchType: 'web',
            query: 'test query',
            totalResults: 5,
            results: [],
            searchTime: 100,
            relatedSearches: ['related query 1', 'related query 2'],
        };

        expect(mockOutput.totalResults).toBe(5);
        expect(mockOutput.results).toEqual([]);
        expect(mockOutput.searchTime).toBe(100);
    });

    it('should support all search types', () => {
        const searchTypes: Array<'web' | 'images' | 'maps' | 'shopping' | 'news'> = [
            'web',
            'images',
            'maps',
            'shopping',
            'news',
        ];

        searchTypes.forEach((type) => {
            const input: GoogleSearchToolInput = {
                query: 'test',
                searchType: type,
                maxResults: 10,
                language: 'en',
                safeSearch: true,
            };

            expect(input.searchType).toBe(type);
        });
    });
});
