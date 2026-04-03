export interface ISessionService {
    manageSession(user: any | null): Promise<void>;
}

export const ISessionServiceToken = Symbol("ISessionService");
