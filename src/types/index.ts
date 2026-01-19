
import { type DecodedIdToken } from "firebase-admin/auth";
import { type NextRequest } from "next/server";

/**
 * Extends the standard NextRequest to include the authenticated user object.
 * This provides type safety for middleware-authenticated routes.
 */
export interface AppNextRequest extends NextRequest {
  user: DecodedIdToken;
}
