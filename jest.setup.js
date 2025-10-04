// jest.setup.js

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

// Mock TextEncoder and TextDecoder for Node.js/JSDOM compatibility
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(input) {
      return new Uint8Array(Buffer.from(input, 'utf8'));
    }
  };
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(input) {
      return Buffer.from(input).toString('utf8');
    }
  };
}

// Import jest-dom matchers
import '@testing-library/jest-dom';

// Mock global fetch for API testing
global.fetch = global.fetch || jest.fn();

// Mock Next.js APIs for testing
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(url, options = {}) {
      this.url = url;
      this.method = options.method || 'GET';
      this.headers = new Headers(options.headers);
      this.nextUrl = { pathname: url };
    }
  },
  NextResponse: {
    json: (data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: init?.headers || new Headers(),
    }),
  },
}));

// Reset state before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock crypto for JSDOM
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
  },
});
