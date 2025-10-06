# PDF Preview Component - Troubleshooting Guide

## Overview
The `PdfPreview` component provides a robust PDF viewing experience with comprehensive error handling, fallback strategies, and user-friendly error messages.

## Features Implemented

### ✅ Proper Error Handling
- **Dynamic Import**: Uses dynamic imports to handle PDF.js loading issues
- **Fallback Strategy**: Attempts main import first, then falls back to legacy build
- **Specific Error Messages**: Provides user-friendly error messages for different failure scenarios
- **Retry Mechanism**: Implements automatic retry with exponential backoff (max 3 attempts)

### ✅ User-Friendly Messages
- **Loading States**: Clear loading indicators with progress information
- **Error Alerts**: Uses Alert components with descriptive error messages
- **Action Buttons**: Provides retry and download options when errors occur
- **Accessibility**: Proper ARIA labels and keyboard navigation support

### ✅ Fallback Strategies
- **Multiple Import Paths**: Tries both `pdfjs-dist` and `pdfjs-dist/build/pdf`
- **Worker Fallback**: Multiple worker paths for different deployment scenarios
- **Download Option**: Always provides download fallback when preview fails
- **Custom Fallback Component**: Supports custom fallback UI components

### ✅ Testing Verification
- **Error Simulation**: Component handles various error scenarios gracefully
- **Type Safety**: Comprehensive TypeScript types for all PDF.js interfaces
- **Performance**: Optimized rendering with proper cleanup and memory management

## Error Scenarios Handled

### 1. Module Import Errors
```typescript
// Handles both main and legacy imports
try {
  pdfjs = await import('pdfjs-dist');
} catch (error) {
  pdfjs = await import('pdfjs-dist/build/pdf');
}
```

### 2. PDF Loading Errors
- **InvalidPDFException**: Invalid PDF file format
- **MissingPDFException**: PDF file not found
- **UnexpectedResponseException**: Network errors
- **Timeout Errors**: Loading timeout (30 seconds)
- **CORS Errors**: Cross-origin resource sharing issues

### 3. Rendering Errors
- **Canvas Context Issues**: Missing or invalid canvas context
- **Page Rendering Failures**: Individual page rendering errors
- **Memory Issues**: Large PDF handling with proper cleanup

## Configuration Updates

### Next.js Configuration (`next.config.ts`)
```typescript
webpack: (config, { isServer }) => {
  // Handle PDF.js worker for client-side
  if (!isServer) {
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.mjs',
    };
  }

  // Add fallback for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: false,
    crypto: false,
  };

  return config;
},

async rewrites() {
  return [
    {
      source: '/_next/static/chunks/pdf.worker.mjs',
      destination: '/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
    },
    {
      source: '/pdf.worker.mjs',
      destination: '/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
    },
  ]
}
```

### Type Declarations (`src/@types/pdfjs-dist.d.ts`)
```typescript
declare module 'pdfjs-dist' {
  export interface GlobalWorkerOptions {
    workerSrc: string;
  }

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  // ... additional interfaces
}

declare module 'pdfjs-dist/build/pdf' {
  export * from 'pdfjs-dist';
}
```

## Usage Examples

### Basic Usage
```tsx
<PdfPreview fileUri="/path/to/document.pdf" />
```

### With Error Handling
```tsx
<PdfPreview
  fileUri="/path/to/document.pdf"
  fileName="My Document.pdf"
  onError={(error) => console.error('PDF Error:', error)}
  fallbackComponent={<div>PDF preview unavailable</div>}
/>
```

### Error Handling Callback
```tsx
const handlePdfError = (error: string) => {
  // Log error for debugging
  console.error('PDF Preview Error:', error);

  // Show user notification
  toast.error(`Failed to load PDF: ${error}`);

  // Track error analytics
  analytics.track('pdf_preview_error', { error });
};

<PdfPreview
  fileUri={pdfUrl}
  onError={handlePdfError}
/>
```

## Testing Scenarios

### 1. Valid PDF Files
- ✅ Standard PDF documents
- ✅ Large PDF files (>10MB)
- ✅ Multi-page documents
- ✅ PDFs with images and text

### 2. Error Scenarios
- ✅ Invalid file formats
- ✅ Corrupted PDF files
- ✅ Network timeouts
- ✅ CORS restrictions
- ✅ Missing files (404 errors)

### 3. Browser Compatibility
- ✅ Chrome/Chromium browsers
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## Performance Optimizations

### Memory Management
- Proper canvas cleanup on component unmount
- Efficient page rendering with viewport optimization
- Lazy loading of PDF.js library

### User Experience
- Loading indicators with progress feedback
- Smooth page navigation
- Responsive zoom controls
- Keyboard navigation support

## Troubleshooting Common Issues

### Issue: "Cannot find module 'pdfjs-dist/build/pdf'"
**Solution**: Updated type declarations and dynamic imports handle this automatically.

### Issue: PDF Worker Not Loading
**Solution**: Multiple worker paths configured in Next.js rewrites.

### Issue: CORS Errors
**Solution**: Component provides clear error message and download fallback.

### Issue: Large PDF Performance
**Solution**: Optimized rendering with proper memory management and cleanup.

## Future Enhancements

### Planned Features
- [ ] Text selection and search
- [ ] Annotation support
- [ ] Print functionality
- [ ] Full-screen mode
- [ ] Thumbnail navigation
- [ ] Bookmark support

### Performance Improvements
- [ ] Virtual scrolling for large documents
- [ ] Progressive loading
- [ ] Caching strategies
- [ ] Web Workers for heavy processing

## Support

For additional support or bug reports:
1. Check browser console for detailed error logs
2. Verify PDF file accessibility and format
3. Test with different browsers
4. Check network connectivity and CORS settings

The component is designed to gracefully handle all common PDF viewing scenarios while providing clear feedback to users when issues occur.
