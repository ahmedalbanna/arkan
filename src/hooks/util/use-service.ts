'use client';

import { container, InjectionToken } from 'tsyringe';
import { useMemo } from 'react';

/**
 * A hook to resolve dependencies from the DI container within React components.
 * 
 * @param token The injection token to resolve.
 * @returns The resolved service instance.
 */
export function useService<T>(token: InjectionToken<T>): T {
  const service = useMemo(() => container.resolve(token), [token]);
  return service;
}
