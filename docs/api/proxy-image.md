This document describes the API endpoint that acts as an image proxy.

**Endpoint**: `GET /api/proxy-image`

**1. Purpose**

-   This endpoint's primary function is to circumvent Cross-Origin Resource Sharing (CORS) issues when displaying images from external domains, specifically `plantuml.com`.
-   Browsers would otherwise block the client-side code from directly fetching and displaying an image from an external server that doesn't have permissive CORS headers.

**2. Key Concepts**

-   **Proxying**: It takes a `url` as a query parameter, fetches the image from that URL on the server-side, and then streams the image data back to the client with the correct `Content-Type` header.
-   **Security**: To prevent abuse (i.e., using the endpoint as an open proxy for any domain), it contains an allowlist of trusted domains (`plantuml.com` and `placehold.co`). Requests for URLs from other domains are rejected.
-   **Caching**: It sets a long-lived `Cache-Control` header on the response. This tells the browser to cache the image aggressively, improving performance and reducing redundant calls to the proxy and the origin server.

**3. Workflow**

1.  The `DiagramViewer` component needs to display an image from a `plantuml.com` URL.
2.  It constructs a URL to this proxy endpoint, e.g., `/api/proxy-image?url=https://www.plantuml.com/...`.
3.  The browser requests the image from the proxy endpoint.
4.  The route handler fetches the image from the original `plantuml.com` URL on the server.
5.  The server streams the image data back to the browser with appropriate headers, allowing it to be displayed without CORS errors.
