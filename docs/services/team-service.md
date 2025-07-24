This code defines the service layer for managing team data, including fetching teams, creating new teams, and inviting members.

**1. Purpose**

- The `team-service.ts` file is responsible for all raw `fetch` calls related to the `/api/teams/*` backend endpoints. It handles the direct network communication for team management.

**2. Key Concepts**

-   **Service Layer**: As part of the service layer, this file contains only the API interaction logic. It makes the `fetch` requests and returns the resulting JSON data or throws an error if the request fails.
-   **Authentication**: All functions require a user's authentication token, which is passed in the `Authorization` header. This ensures that only authenticated users can perform team actions and that the backend can identify the user making the request (e.g., to verify team ownership when inviting members).
-   **Hook Integration**: These service functions are consumed by the custom hooks in `src/hooks/use-teams.ts` (which is not explicitly shown but is the intended pattern). The `useTeams` and `useInviteMember` (or similar) hooks would use these services to power their `useQuery` and `useMutation` logic.

**3. Key Functions**

-   **`fetchUserTeams(token)`**: Makes a `GET` request to `/api/teams` to get all teams the authenticated user is a member of.
-   **`createTeam({ name, token })`**: Makes a `POST` request to `/api/teams` to create a new team with the given name.
-   **`inviteMember({ teamId, email, token })`**: Makes a `POST` request to `/api/teams/[id]/invitations` to invite a new user to a specific team.

**In summary:**

The `team-service.ts` file provides a clean API for all team-related backend operations. It encapsulates the `fetch` logic, allowing React hooks to handle the complexities of state management, caching, and user feedback.