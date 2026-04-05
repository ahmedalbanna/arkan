import { MetadataRoute } from 'next';

/**
 * robots.ts — Production crawl instructions for search engine bots.
 * Defines access rules for the public platform and restricts indexing of protected builder nodes.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/builder/',
          '/admin/',
          '/profile/',
          '/api/',
          '/phone-auth/',
          '/reset-password/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'], // Restrict LLM crawlers from scraping platform content
      },
    ],
    sitemap: 'https://arkan.io/sitemap.xml',
  };
}
