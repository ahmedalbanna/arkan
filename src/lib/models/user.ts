
import { format } from "date-fns";
import {
  UserValidationError,
  validateCredits,
  validateEmail,
  type UserRole
} from './user-validation';

/**
 * User Profile Interface
 *
 * Defines the complete structure of a user profile with all fields.
 */
export interface UserProfile {
  /** Unique user identifier (Firebase UID) */
  id: string;

  /** User's display name */
  name: string;

  /** User's email address */
  email: string;

  /** User's role (admin or user) */
  role: UserRole;

  /** Available credits for AI generation */
  credits?: number;

  /** ISO timestamp when user was created */
  createdAt: string;

  /** ISO timestamp when user was last updated */
  updatedAt: string;

  /** User biography/description */
  bio?: string;

  /** URL to user's profile picture */
  profilePictureUrl?: string;

  /** Whether user has completed onboarding */
  hasCompletedOnboarding?: boolean;

  /** API keys for external services */
  apiKeys?: Record<string, string>;

  /** Timestamp of last daily credit refresh */
  lastDailyCreditUpdate?: string;
}

/**
 * User Properties for creation/updates
 * Allows partial properties for flexible initialization
 */
export type UserProperties = Partial<UserProfile> & { id?: string };

/**
 * User Model
 *
 * Immutable class representing a user in the system with authentication,
 * profile information, and credit management.
 *
 * @example
 * ```typescript
 * // Create new user
 * const user = new User({
 *   id: 'user-123',
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   role: 'user'
 * });
 *
 * // Update user
 * const updated = user.with({ credits: 100 });
 *
 * // Add credits
 * const withCredits = user.addCredits(50);
 * ```
 */
export class User {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;
  public readonly role: UserRole;
  public readonly credits: number;
  public readonly createdAt: string;
  public readonly updatedAt: string;
  public readonly bio?: string;
  public readonly profilePictureUrl?: string;
  public readonly hasCompletedOnboarding: boolean;
  public readonly apiKeys?: Readonly<Record<string, string>>;
  public readonly lastDailyCreditUpdate?: string;

  /**
   * Creates a new User instance
   *
   * @param props - User properties
   * @throws {UserValidationError} If validation fails
   */
  constructor(props: UserProperties) {
    // Validate required fields
    if (!props.id || props.id.trim() === '') {
      throw new UserValidationError('User ID is required', 'id');
    }

    if (!props.name || props.name.trim() === '') {
      throw new UserValidationError('User name is required', 'name');
    }

    if (!props.email || props.email.trim() === '') {
      throw new UserValidationError('User email is required', 'email');
    }

    // Validate email format
    if (!validateEmail(props.email)) {
      throw new UserValidationError('Invalid email format', 'email');
    }

    // Validate credits if provided
    if (props.credits !== undefined) {
      validateCredits(props.credits);
    }

    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.role = props.role || 'user';
    this.credits = props.credits ?? 0;
    this.createdAt = props.createdAt || new Date().toISOString();
    this.updatedAt = props.updatedAt || new Date().toISOString();
    this.bio = props.bio;
    this.profilePictureUrl = props.profilePictureUrl;
    this.hasCompletedOnboarding = props.hasCompletedOnboarding ?? false;
    this.apiKeys = props.apiKeys ? { ...props.apiKeys } : undefined;
    this.lastDailyCreditUpdate = props.lastDailyCreditUpdate;
  }

  /**
   * Creates a new User instance with updated properties (immutable update)
   *
   * @param props - Partial properties to update
   * @returns New User instance with merged properties
   * @throws {UserValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const updated = user.with({
   *   name: 'New Name',
   *   credits: 150
   * });
   * ```
   */
  public with(props: Partial<UserProperties>): User {
    return new User({
      ...this.toStateObject(),
      ...props,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Returns the user's initials for avatar display
   *
   * @returns User initials (e.g., "JD" for "John Doe")
   *
   * @example
   * ```typescript
   * const initials = user.getInitials(); // "JD"
   * ```
   */
  public getInitials(): string {
    if (!this.name) return '?';
    return this.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2); // Max 2 characters
  }

  /**
   * Returns formatted creation date
   *
   * @returns Formatted date string (e.g., "23 Jan 2026")
   */
  public getFormattedDate(): string {
    if (!this.createdAt) return 'N/A';
    try {
      return format(new Date(this.createdAt), 'd MMM yyyy');
    } catch {
      return 'Invalid Date';
    }
  }

  /**
   * Returns formatted updated date
   *
   * @returns Formatted date string
   */
  public getFormattedUpdatedDate(): string {
    if (!this.updatedAt) return 'N/A';
    try {
      return format(new Date(this.updatedAt), 'd MMM yyyy');
    } catch {
      return 'Invalid Date';
    }
  }

  /**
   * Checks if user is an admin
   *
   * @returns True if user has admin role
   */
  public isAdmin(): boolean {
    return this.role === 'admin';
  }

  /**
   * Checks if user has completed onboarding
   *
   * @returns True if onboarding is complete
   */
  public isOnboarded(): boolean {
    return this.hasCompletedOnboarding;
  }

  /**
   * Checks if user has sufficient credits
   *
   * @param amount - Credits required
   * @returns True if user has enough credits
   */
  public hasEnoughCredits(amount: number): boolean {
    return this.credits >= amount;
  }

  /**
   * Adds credits to user account
   *
   * @param amount - Credits to add (must be positive)
   * @returns New User instance with updated credits
   * @throws {UserValidationError} If amount is invalid
   *
   * @example
   * ```typescript
   * const updated = user.addCredits(50);
   * console.log(updated.credits); // original + 50
   * ```
   */
  public addCredits(amount: number): User {
    if (amount < 0) {
      throw new UserValidationError('Cannot add negative credits', 'credits');
    }
    if (!Number.isInteger(amount)) {
      throw new UserValidationError('Credits must be an integer', 'credits');
    }
    return this.with({ credits: this.credits + amount });
  }

  /**
   * Deducts credits from user account
   *
   * @param amount - Credits to deduct (must be positive)
   * @returns New User instance with updated credits
   * @throws {UserValidationError} If amount is invalid or insufficient credits
   *
   * @example
   * ```typescript
   * const updated = user.deductCredits(10);
   * ```
   */
  public deductCredits(amount: number): User {
    if (amount < 0) {
      throw new UserValidationError('Cannot deduct negative credits', 'credits');
    }
    if (!Number.isInteger(amount)) {
      throw new UserValidationError('Credits must be an integer', 'credits');
    }
    if (this.credits < amount) {
      throw new UserValidationError(
        `Insufficient credits. Required: ${amount}, Available: ${this.credits}`,
        'credits'
      );
    }
    return this.with({ credits: this.credits - amount });
  }

  /**
   * Marks onboarding as complete
   *
   * @returns New User instance with onboarding completed
   */
  public completeOnboarding(): User {
    return this.with({ hasCompletedOnboarding: true });
  }

  /**
   * Updates user's API key for a service
   *
   * @param service - Service name (e.g., 'gemini', 'chatgpt')
   * @param apiKey - API key value
   * @returns New User instance with updated API keys
   */
  public setApiKey(service: string, apiKey: string): User {
    const newApiKeys = { ...(this.apiKeys || {}), [service]: apiKey };
    return this.with({ apiKeys: newApiKeys });
  }

  /**
   * Removes user's API key for a service
   *
   * @param service - Service name to remove
   * @returns New User instance without the API key
   */
  public removeApiKey(service: string): User {
    if (!this.apiKeys) return this;
    const { [service]: _, ...remainingKeys } = this.apiKeys;
    return this.with({ apiKeys: Object.keys(remainingKeys).length > 0 ? remainingKeys : undefined });
  }

  /**
   * Gets API key for a specific service
   *
   * @param service - Service name
   * @returns API key or undefined
   */
  public getApiKey(service: string): string | undefined {
    return this.apiKeys?.[service];
  }

  /**
   * Updates last daily credit refresh timestamp
   *
   * @returns New User instance with updated timestamp
   */
  public markDailyCreditUpdate(): User {
    return this.with({ lastDailyCreditUpdate: new Date().toISOString() });
  }

  /**
   * Converts User instance to plain object (for persistence/serialization)
   *
   * @returns Plain JavaScript object with all user data
   */
  public toStateObject(): UserProfile {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      credits: this.credits,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      bio: this.bio,
      profilePictureUrl: this.profilePictureUrl,
      hasCompletedOnboarding: this.hasCompletedOnboarding,
      apiKeys: this.apiKeys,
      lastDailyCreditUpdate: this.lastDailyCreditUpdate,
    };
  }

  /**
   * JSON serialization method (used by JSON.stringify)
   *
   * @returns Plain JavaScript object
   */
  public toJSON(): UserProfile {
    return this.toStateObject();
  }
}
