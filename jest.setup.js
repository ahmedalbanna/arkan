// jest.setup.js
import '@testing-library/jest-dom';

// Mock the canvas context for text measurement functions
// This prevents errors when running tests in a JSDOM environment
// where the canvas API is not implemented.
Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
  value: (contextType) => {
    if (contextType === '2d') {
      return {
        measureText: (text) => ({ width: text.length * 6 }),
        // Add other mock canvas 2d context methods if needed by your tests
      };
    }
    return null;
  },
  writable: true,
  configurable: true,
});
