// jest.setup.js

// Mock the canvas context for text measurement functions
// This prevents errors when running tests in a Node.js environment
// where the canvas API is not available.
Object.defineProperty(global, 'document', {
  value: {
    ...global.document,
    createElement: (tag) => {
      if (tag === 'canvas') {
        return {
          getContext: (contextType) => {
            if (contextType === '2d') {
              // A very rough mock for measureText.
              // It returns a width proportional to the text length.
              return { measureText: (text) => ({ width: text.length * 6 }) };
            }
            return null;
          },
        };
      }
      // Fallback for other elements if needed by other tests
      return document.createElement(tag);
    },
  },
  writable: true,
  configurable: true,
});
