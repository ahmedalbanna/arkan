'use client';

import { container } from '@/infrastructure/di/container';
import { getAuthenticatedToken } from '@/modules/users/domain/utils/authUtils';
import { Result } from '@/infrastructure/utils/result';

type ClientConstructor<TClient> = new (...args: unknown[]) => TClient;

const getAuthenticationError = (): Error => new Error('User not authenticated');

export const runAuthenticatedClientCall = async <TClient, TResult>(
  user: { uid: string; getIdToken: (force: boolean) => Promise<string> } | null | undefined,
  clientClass: ClientConstructor<TClient>,
  callback: (client: TClient, token: string) => Promise<TResult>,
): Promise<TResult> => {
  if (!user) {
    throw getAuthenticationError();
  }

  const token = await getAuthenticatedToken(user);
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
  user: { uid: string; getIdToken: (force: boolean) => Promise<string> } | null | undefined,
  clientClass: ClientConstructor<TClient>,
  callback: (client: TClient, token: string) => Promise<Result<TValue, TError>>,
): Promise<TValue> => {
  const result = await runAuthenticatedClientCall(user, clientClass, callback);
  return unwrapResult(result);
};
