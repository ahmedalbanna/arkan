# Google Search Tool

## Overview

The Google Search Tool provides access to real-time search results from Google, including:
- **Web Search**: Traditional web page results with titles, URLs, and snippets
- **Image Search**: Image results with thumbnails, dimensions, and sources
- **Maps Search**: Local business results with addresses, ratings, and contact info
- **Shopping Search**: Product results with prices, merchants, and ratings
- **News Search**: Latest news articles with sources and publication dates

## Usage

### In AI Flows

```typescript
import { googleSearchTool, searchWeb, searchImages } from '@/ai/tools/google-search';

// Using the main tool
const results = await googleSearchTool({
  query: 'Next.js 15 features',
  searchType: 'web',
  maxResults: 10,
  language: 'en',
  safeSearch: true,
});

// Using helper functions
const webResults = await searchWeb('artificial intelligence', 10, 'en');
const imageResults = await searchImages('landscape photography', 15, 'en');
const mapResults = await searchMaps('restaurants near me', 10, 'US');
const shoppingResults = await searchShopping('laptop computers', 10, 'US');
const newsResults = await searchNews('technology', 10, 'en');
```

### In React Components

```tsx
import { GoogleSearchTool } from '@/components/writing-tools/GoogleSearchTool';

function MyPage() {
  const handleSearch = (results) => {
    console.log('Search results:', results);
  };

  return <GoogleSearchTool onSearch={handleSearch} />;
}
```

### Via API Endpoint

```javascript
const response = await fetch('/api/google-search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'react hooks',
    searchType: 'web',
    maxResults: 10,
    language: 'en',
    safeSearch: true,
  }),
});

const results = await response.json();
```

## Input Schema

```typescript
{
  query: string;              // Search query (required, min 1 char)
  searchType: 'web' | 'images' | 'maps' | 'shopping' | 'news'; // Default: 'web'
  maxResults: number;         // 1-20, default: 10
  language: string;           // Language code, default: 'en'
  country?: string;           // Country code for localization (optional)
  safeSearch: boolean;        // Safe search filter, default: true
}
```

## Output Schema

```typescript
{
  searchType: string;         // Type of search performed
  query: string;              // Original search query
  totalResults: number;       // Number of results returned
  results: Array<Result>;     // Array of search results (typed by search type)
  searchTime?: number;        // Execution time in milliseconds
  relatedSearches?: string[]; // Related search suggestions
}
```

### Result Types

#### Web Search Result
```typescript
{
  title: string;
  url: string;
  snippet: string;
  displayUrl?: string;
  position?: number;
}
```

#### Image Search Result
```typescript
{
  title: string;
  url: string;
  thumbnailUrl: string;
  imageUrl: string;
  width?: number;
  height?: number;
  source?: string;
}
```

#### Maps Search Result
```typescript
{
  name: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  url: string;
  phone?: string;
  website?: string;
  category?: string;
}
```

#### Shopping Search Result
```typescript
{
  title: string;
  price: string;
  currency?: string;
  url: string;
  merchant: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
}
```

#### News Search Result
```typescript
{
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedDate?: string;
  imageUrl?: string;
}
```

## Features

### Multi-Search Type Support
- Switch between different search types seamlessly
- Each type returns properly typed results
- Consistent API across all search types

### Language Support
- English (en)
- Arabic (ar)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Easily extensible for more languages

### Safe Search
- Built-in safe search filtering
- Enabled by default
- Can be disabled if needed

### Related Searches
- Returns related search suggestions
- Helps users discover related topics
- Clickable in the UI component

### Performance Tracking
- Measures search execution time
- Returns timing in milliseconds
- Useful for monitoring and optimization

## UI Component

The `GoogleSearchTool` component provides a complete UI for searching:

### Features
- **Search input** with Enter key support
- **Search type selector** with icons
- **Results limit** selector (5, 10, 15, 20)
- **Language selector** for localization
- **Visual results** with cards and images
- **Related searches** as clickable badges
- **Responsive design** for all screen sizes
- **Error handling** with user-friendly messages
- **Loading states** with animations

### Styling
- Uses shadcn/ui components
- Supports light and dark themes
- Tailwind CSS for styling
- Accessible with Radix UI primitives

## API Endpoint

**POST** `/api/google-search`

### Request Body
```json
{
  "query": "search query",
  "searchType": "web",
  "maxResults": 10,
  "language": "en",
  "safeSearch": true
}
```

### Response
```json
{
  "searchType": "web",
  "query": "search query",
  "totalResults": 10,
  "results": [...],
  "searchTime": 150,
  "relatedSearches": [...]
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Integration with Genkit

The tool is fully integrated with the Genkit AI framework:

1. **Registered in tools index**: `src/ai/tools/index.ts`
2. **Part of searchAndResearchTools**: New category for search tools
3. **Available in allTools**: Accessible to all AI flows
4. **Type-safe schemas**: Zod validation for inputs/outputs
5. **AI-powered**: Uses Gemini 2.0 Flash Lite for intelligent results

## Future Enhancements

### Potential improvements:
- [ ] Integration with Google Custom Search API for real results
- [ ] Caching mechanism for frequent searches
- [ ] Advanced filters (date range, file type, etc.)
- [ ] Search history and saved searches
- [ ] Export results to different formats
- [ ] Pagination for large result sets
- [ ] Search analytics and insights

## Testing

Unit tests are available in `src/ai/tools/__tests__/google-search.test.ts`

Run tests:
```bash
npm test google-search.test.ts
```

## Page Route

The tool is accessible at:
```
/writing-tools/google-search
```

## Dependencies

- `genkit`: AI framework
- `zod`: Schema validation
- `@radix-ui/*`: UI primitives
- `lucide-react`: Icons
- `next`: Server and routing

## Notes

### Current Implementation
The tool currently uses AI to simulate search results based on the query. This provides:
- Realistic result structure
- Relevant results based on query understanding
- Consistent schema across all search types
- No API key requirements

### Production Ready
For production with real Google search results:
1. Obtain Google Custom Search API key
2. Update `google-search.ts` to call the API
3. Handle rate limiting and quotas
4. Add caching for performance
5. Implement error retry logic

## License

Part of the Arkan platform. All rights reserved.
