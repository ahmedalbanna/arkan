/**
 * Comprehensive Type Guards
 * Provides type-safe runtime type checking and validation
 */

// Basic Type Guards
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

export function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp;
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return value instanceof Promise || (isObject(value) && 'then' in value && isFunction((value as any).then));
}

// Advanced Type Guards
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.length > 0;
}

export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value);
}

export function isPositiveInteger(value: unknown): value is number {
  return isInteger(value) && value > 0;
}

export function isNonEmptyArray<T = unknown>(value: unknown): value is T[] {
  return isArray(value) && value.length > 0;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return isObject(value) &&
         Object.prototype.toString.call(value) === '[object Object]' &&
         Object.getPrototypeOf(value) === Object.prototype;
}

export function isRecord<K extends string | number | symbol, V>(
  value: unknown,
  keyGuard?: (key: unknown) => key is K,
  valueGuard?: (val: unknown) => val is V
): value is Record<K, V> {
  if (!isPlainObject(value)) return false;

  if (keyGuard && valueGuard) {
    return Object.entries(value).every(([key, val]) =>
      keyGuard(key) && valueGuard(val)
    );
  }

  return true;
}

export function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value, isString, isString);
}

export function isNumberRecord(value: unknown): value is Record<string, number> {
  return isRecord(value, isString, isNumber);
}

export function isBooleanRecord(value: unknown): value is Record<string, boolean> {
  return isRecord(value, isString, isBoolean);
}

// API Type Guards
export function isApiResponse<T = unknown>(value: unknown): value is {
  data: T;
  status: number;
  message?: string;
  success: boolean;
} {
  return isPlainObject(value) &&
         'data' in value &&
         'status' in value &&
         'success' in value &&
         isNumber((value as any).status) &&
         isBoolean((value as any).success);
}

export function isApiError(value: unknown): value is {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
} {
  return isPlainObject(value) &&
         'message' in value &&
         'code' in value &&
         'status' in value &&
         isString((value as any).message) &&
         isString((value as any).code) &&
         isNumber((value as any).status);
}

export function isPaginatedResponse<T = unknown>(value: unknown): value is {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} {
  return isApiResponse(value) &&
         isArray(value.data) &&
         'pagination' in value &&
         isPlainObject((value as any).pagination) &&
         'page' in (value as any).pagination &&
         'limit' in (value as any).pagination &&
         'total' in (value as any).pagination &&
         'totalPages' in (value as any).pagination;
}

// User Type Guards
export function isUser(value: unknown): value is {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
} {
  return isPlainObject(value) &&
         'id' in value &&
         'email' in value &&
         'name' in value &&
         'role' in value &&
         'createdAt' in value &&
         'updatedAt' in value &&
         isString((value as any).id) &&
         isString((value as any).email) &&
         isString((value as any).name) &&
         isString((value as any).role) &&
         isDate((value as any).createdAt) &&
         isDate((value as any).updatedAt);
}

export function isUserProfile(value: unknown): value is {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
} {
  return isUser(value) && (
    !('avatar' in value) || isString((value as any).avatar)
  );
}

// Project Type Guards
export function isProject(value: unknown): value is {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
} {
  return isPlainObject(value) &&
         'id' in value &&
         'name' in value &&
         'type' in value &&
         'status' in value &&
         'createdAt' in value &&
         'updatedAt' in value &&
         isString((value as any).id) &&
         isString((value as any).name) &&
         isString((value as any).type) &&
         isString((value as any).status) &&
         isDate((value as any).createdAt) &&
         isDate((value as any).updatedAt) &&
         (!('description' in value) || isString((value as any).description));
}

// Team Type Guards
export function isTeam(value: unknown): value is {
  id: string;
  name: string;
  description?: string;
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    joinedAt: Date;
  }>;
  createdAt: Date;
} {
  return isPlainObject(value) &&
         'id' in value &&
         'name' in value &&
         'members' in value &&
         'createdAt' in value &&
         isString((value as any).id) &&
         isString((value as any).name) &&
         isArray((value as any).members) &&
         isDate((value as any).createdAt) &&
         (!('description' in value) || isString((value as any).description)) &&
         (value as any).members.every((member: unknown) =>
           isPlainObject(member) &&
           'id' in member &&
           'name' in member &&
           'email' in member &&
           'role' in member &&
           'joinedAt' in member &&
           isString((member as any).id) &&
           isString((member as any).name) &&
           isString((member as any).email) &&
           isString((member as any).role) &&
           isDate((member as any).joinedAt)
         );
}

// File Type Guards
export function isFile(value: unknown): value is File {
  return value instanceof File;
}

export function isBlob(value: unknown): value is Blob {
  return value instanceof Blob;
}

export function isFileUploadResponse(value: unknown): value is {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
} {
  return isPlainObject(value) &&
         'id' in value &&
         'filename' in value &&
         'url' in value &&
         'size' in value &&
         'type' in value &&
         isString((value as any).id) &&
         isString((value as any).filename) &&
         isString((value as any).url) &&
         isNumber((value as any).size) &&
         isString((value as any).type);
}

// Validation Type Guards
export function isValidEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function isValidUrl(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isValidUuid(value: unknown): value is string {
  if (!isString(value)) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function isValidDateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

export function isValidJsonString(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

// Utility Type Guards
export function isOneOf<T extends readonly unknown[]>(
  value: unknown,
  options: T
): value is T[number] {
  return options.includes(value as T[number]);
}

export function isEnum<T extends Record<string, string | number>>(
  value: unknown,
  enumObject: T
): value is T[keyof T] {
  return Object.values(enumObject).includes(value as T[keyof T]);
}

export function hasProperty<K extends string>(
  value: unknown,
  key: K
): value is Record<K, unknown> {
  return isObject(value) && key in value;
}

export function hasProperties<K extends string>(
  value: unknown,
  keys: readonly K[]
): value is Record<K, unknown> {
  return isObject(value) && keys.every(key => key in value);
}

export function isInstanceOf<T>(
  value: unknown,
  constructor: new (...args: any[]) => T
): value is T {
  return value instanceof constructor;
}

// Type-safe assertion functions
export function assertIsString(value: unknown, message?: string): asserts value is string {
  if (!isString(value)) {
    throw new Error(message || `Expected string, got ${typeof value}`);
  }
}

export function assertIsNumber(value: unknown, message?: string): asserts value is number {
  if (!isNumber(value)) {
    throw new Error(message || `Expected number, got ${typeof value}`);
  }
}

export function assertIsBoolean(value: unknown, message?: string): asserts value is boolean {
  if (!isBoolean(value)) {
    throw new Error(message || `Expected boolean, got ${typeof value}`);
  }
}

export function assertIsArray<T = unknown>(value: unknown, message?: string): asserts value is T[] {
  if (!isArray(value)) {
    throw new Error(message || `Expected array, got ${typeof value}`);
  }
}

export function assertIsObject(value: unknown, message?: string): asserts value is object {
  if (!isObject(value)) {
    throw new Error(message || `Expected object, got ${typeof value}`);
  }
}

export function assertIsPlainObject(value: unknown, message?: string): asserts value is Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new Error(message || `Expected plain object, got ${typeof value}`);
  }
}

export function assertIsUser(value: unknown, message?: string): asserts value is {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
} {
  if (!isUser(value)) {
    throw new Error(message || `Expected user object, got ${typeof value}`);
  }
}

export function assertIsProject(value: unknown, message?: string): asserts value is {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
} {
  if (!isProject(value)) {
    throw new Error(message || `Expected project object, got ${typeof value}`);
  }
}

// Type narrowing utilities
export function narrowTo<T>(
  value: unknown,
  guard: (val: unknown) => val is T,
  fallback: T
): T {
  return guard(value) ? value : fallback;
}

export function narrowToOrThrow<T>(
  value: unknown,
  guard: (val: unknown) => val is T,
  message?: string
): T {
  if (guard(value)) {
    return value;
  }
  throw new Error(message || `Value does not match expected type`);
}

// Type-safe object access
export function getProperty<T, K extends keyof T>(
  obj: T,
  key: K
): T[K] | undefined {
  return obj[key];
}

export function getPropertyOr<T, K extends keyof T>(
  obj: T,
  key: K,
  fallback: T[K]
): T[K] {
  return obj[key] ?? fallback;
}

export function getNestedProperty<T>(
  obj: unknown,
  path: string,
  fallback?: T
): T | undefined {
  if (!isPlainObject(obj)) return fallback;

  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (!isPlainObject(current) || !(key in current)) {
      return fallback;
    }
    current = (current as any)[key];
  }

  return current as T;
}

// Type-safe array operations
export function filterByType<T>(
  array: unknown[],
  guard: (value: unknown) => value is T
): T[] {
  return array.filter(guard);
}

export function mapToType<T, U>(
  array: T[],
  mapper: (value: T) => U,
  guard?: (value: unknown) => value is U
): U[] {
  const mapped = array.map(mapper);
  return guard ? mapped.filter(guard) : mapped;
}

// Type-safe JSON parsing
export function parseJson<T>(
  json: string,
  guard: (value: unknown) => value is T
): T {
  const parsed = JSON.parse(json);
  if (!guard(parsed)) {
    throw new Error('Parsed JSON does not match expected type');
  }
  return parsed;
}

export function safeParseJson<T>(
  json: string,
  guard: (value: unknown) => value is T,
  fallback: T
): T {
  try {
    return parseJson(json, guard);
  } catch {
    return fallback;
  }
}

// Type-safe form data
export function isFormData(value: unknown): value is FormData {
  return value instanceof FormData;
}

export function isFormDataEntry(value: unknown): value is {
  name: string;
  value: string | File;
} {
  return isPlainObject(value) &&
         'name' in value &&
         'value' in value &&
         isString((value as any).name) &&
         (isString((value as any).value) || isFile((value as any).value));
}

// Type-safe URL search params
export function isURLSearchParams(value: unknown): value is URLSearchParams {
  return value instanceof URLSearchParams;
}

export function isSearchParams(value: unknown): value is Record<string, string> {
  return isStringRecord(value);
}

// Export all type guards as a namespace
export const TypeGuards = {
  // Basic
  isString,
  isNumber,
  isBoolean,
  isNull,
  isUndefined,
  isNullish,
  isFunction,
  isObject,
  isArray,
  isDate,
  isRegExp,
  isError,
  isPromise,

  // Advanced
  isNonEmptyString,
  isPositiveNumber,
  isNonNegativeNumber,
  isInteger,
  isPositiveInteger,
  isNonEmptyArray,
  isPlainObject,
  isRecord,
  isStringRecord,
  isNumberRecord,
  isBooleanRecord,

  // API
  isApiResponse,
  isApiError,
  isPaginatedResponse,

  // Domain
  isUser,
  isUserProfile,
  isProject,
  isTeam,

  // Files
  isFile,
  isBlob,
  isFileUploadResponse,

  // Validation
  isValidEmail,
  isValidUrl,
  isValidUuid,
  isValidDateString,
  isValidJsonString,

  // Utilities
  isOneOf,
  isEnum,
  hasProperty,
  hasProperties,
  isInstanceOf,

  // Assertions
  assertIsString,
  assertIsNumber,
  assertIsBoolean,
  assertIsArray,
  assertIsObject,
  assertIsPlainObject,
  assertIsUser,
  assertIsProject,

  // Narrowing
  narrowTo,
  narrowToOrThrow,

  // Object access
  getProperty,
  getPropertyOr,
  getNestedProperty,

  // Array operations
  filterByType,
  mapToType,

  // JSON
  parseJson,
  safeParseJson,

  // Form data
  isFormData,
  isFormDataEntry,

  // URL params
  isURLSearchParams,
  isSearchParams
};
