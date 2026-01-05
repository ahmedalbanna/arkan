// import puppeteer, { Browser } from 'puppeteer';

// async function extractTextFromDynamicPage(url: string): Promise<string> {
//     let browser: Browser | undefined;
//     try {
//         browser = await puppeteer.launch({ headless: 'new' });
//         const page = await browser.newPage();
//         await page.setUserAgent('Mozilla/5.0 (compatible; TextExtractor/1.0)');
//         await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

//         // Wait for main content if you can target a selector
//         // await page.waitForSelector('main, article, .content', { timeout: 10000 }).catch(() => {});

//         const text: string = await page.evaluate(() => {
//             const remove = (sel: string) => document.querySelectorAll(sel).forEach(el => el.remove());
//             remove('script, style, noscript, template, iframe, nav, header, footer, aside, [role="navigation"]');

//             const walker = document.createTreeWalker(
//                 document.body,
//                 NodeFilter.SHOW_TEXT,
//                 {
//                     acceptNode: (node: Node): number => {
//                         const s = node.textContent?.trim() || '';
//                         return s ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
//                     }
//                 }
//             );

//             const parts: string[] = [];
//             let n: Node | null;
//             while ((n = walker.nextNode())) {
//                 parts.push(n.textContent?.trim() || '');
//             }
//             return parts.join('\n');
//         });

//         return text.split('\n').map(s => s.trim()).filter(Boolean).join('\n');
//     } finally {
//         if (browser) {
//             await browser.close();
//         }
//     }
// }

// extractTextFromDynamicPage('https://example.com')
//     .then(console.log)
//     .catch(console.error);
