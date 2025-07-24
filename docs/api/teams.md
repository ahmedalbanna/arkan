This document outlines the API endpoints for team management. All endpoints require user authentication.

### GET `/api/teams`

-   **Purpose**: Fetches all teams that the currently authenticated user is a member of.
-   **Logic**: It first gets the user's profile to find the list of `teamId`s they belong to. Then, for each team, it fetches the team's details and a list of its members.
-   **Usage**: Called by the `useTeams` hook to populate the `TeamManager` component.

### POST `/api/teams`

-   **Purpose**: Creates a new team.
-   **Payload**: `{ "name": "My New Team" }`
-   **Logic**:
    1.  Creates a new document in the `teams` collection, setting the requester as the `ownerId`.
    2.  Creates a corresponding member document for the owner in the `teams/[id]/members` subcollection.
    3.  Updates the user's own profile document to add the new `teamId` to their `teams` array.
    4.  All of these operations are performed in a single Firestore batch write to ensure atomicity.
-   **Usage**: Called by the `CreateTeamForm` component.

### POST `/api/teams/[id]/invitations`

-   **Purpose**: Invites a new user to an existing team.
-   **Access Control**: This endpoint verifies that the user making the request is the owner of the team.
-   **Payload**: `{ "email": "newmember@example.com" }`
-   **Logic**:
    1.  Finds the user to be invited by their email address.
    2.  Checks if the user is already a member of the team.
    3.  If not, it adds a new document to the `teams/[id]/members` subcollection for the new member.
    4.  It also updates the invited user's profile to add the `teamId` to their `teams` array.
-   **Usage**: Called by the `InviteMemberForm` component.