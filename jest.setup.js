// jest.setup.js

// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');
const fetchMock = require('jest-fetch-mock'); // Use const for consistency

// Mock useRouter from next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  }
}));

// Mock window.matchMedia
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

// Enable fetch mocks
fetchMock.enableMocks();

// Mock localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    removeItem: function (key) {
      delete store[key];
    },
    clear: function () {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock useLocalization
jest.mock('@/context/LocalizationContext', () => ({
  useLocalization: () => ({
    t: (key) => key, // Return the key itself for simplicity in tests
    locale: 'en',
    setLocale: jest.fn(),
  }),
}));
