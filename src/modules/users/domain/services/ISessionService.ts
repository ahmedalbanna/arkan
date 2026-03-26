export interface ISessionService {
    manageSession(user: { getIdToken: (forceRefresh: boolean) => Promise<string> } | null): Promise<void>;
}

export const ISessionServiceToken = Symbol("ISessionService");
