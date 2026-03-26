'use client';

import { container } from '@/infrastructure/di/container';
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { Result } from '@/lib/utils/result';
import type { User as FirebaseUser } from 'firebase/auth';

type ClientConstructor<TClient> = new (...args: unknown[]) => TClient;

const getAuthenticationError = (): Error => new Error('User not authenticated');

export const runAuthenticatedClientCall = async <TClient, TResult>(
  firebaseUser: FirebaseUser | null | undefined,
  clientClass: ClientConstructor<TClient>,
  callback: (client: TClient, token: string) => Promise<TResult>,
): Promise<TResult> => {
  if (!firebaseUser) {
    throw getAuthenticationError();
  }

  const token = await getAuthenticatedToken(firebaseUser);
  const client = container.resolve(clientClass);

  return callback(client, token);
};

export const unwrapResult = <TValue, TError>(result: Result<TValue, TError>): TValue => {
  if (result.isFailure) {
    if (result.error instanceof Error) {
      throw result.error;
    }

    throw new Error('API client call failed');
  }

  return result.getValue();
};

export const runAuthenticatedResultCall = async <TClient, TValue, TError>(
  firebaseUser: FirebaseUser | null | undefined,
  clientClass: ClientConstructor<TClient>,
  callback: (client: TClient, token: string) => Promise<Result<TValue, TError>>,
): Promise<TValue> => {
  const result = await runAuthenticatedClientCall(firebaseUser, clientClass, callback);
  return unwrapResult(result);
};
