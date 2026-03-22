// jest.setup.js
require('reflect-metadata');
require('@testing-library/jest-dom');

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

// Mock for react-resizable-panels
// This is necessary because JSDOM doesn't support ResizeObserver, which this library uses.
// https://github.com/bvaughn/react-resizable-panels/issues/143
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock matchMedia for components that use it (e.g., ThemeProvider, useMobile hook)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
