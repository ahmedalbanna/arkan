# Get Current User Token - Complete Guide

## Overview
The `apiService` in `src/services/api/apiService.ts` automatically handles getting the current user's authentication token. You can either let it handle it automatically or pass it explicitly.

## Quick Start

### Option 1: Automatic Token (Recommended)
```typescript
import { apiService } from '@/services/api/apiService';
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { firebaseUser } = useAuth();

  async function loadProjects() {
    try {
      const projects = await apiService({
        endpoint: '/api/projects',
        method: 'GET',
        firebaseUser: firebaseUser, // Pass Firebase user
        // Token is automatically extracted!
      });
      console.log(projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }

  return <button onClick={loadProjects}>Load Projects</button>;
}
```

### Option 2: Get Token Manually
```typescript
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { firebaseUser } = useAuth();

  async function getToken() {
    try {
      const token = await getAuthenticatedToken(firebaseUser);
      console.log('Token:', token);
      return token;
    } catch (error) {
      console.error('Failed to get token:', error);
    }
  }

  return <button onClick={getToken}>Get Token</button>;
}
```

### Option 3: Pass Token Directly
```typescript
import { apiService } from '@/services/api/apiService';
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { firebaseUser } = useAuth();

  async function loadProjects() {
    try {
      const token = await getAuthenticatedToken(firebaseUser);
      
      const projects = await apiService({
        endpoint: '/api/projects',
        method: 'GET',
        token: token, // Pass token explicitly
      });
      console.log(projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }

  return <button onClick={loadProjects}>Load Projects</button>;
}
```

## How apiService Gets Token

### Automatic Flow
```typescript
export async function apiService<TRequest, TResponse>({
  endpoint,
  method = 'GET',
  data,
  token,
  firebaseUser,
  ...
}: ApiServiceOptions<TRequest>): Promise<TResponse> {
  let authToken = token;

  // If token not provided, get from firebaseUser
  if (!authToken && firebaseUser) {
    authToken = await getAuthenticatedToken(firebaseUser);
  }

  // Add to request headers
  config.headers['Authorization'] = `Bearer ${authToken}`;

  // Make request
  const response = await fetch(endpoint, config);
  // ...
}
```

## Step-by-Step: Get Current User Token

### Step 1: Get Firebase User from Auth Context
```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { firebaseUser } = useAuth();
  console.log('Firebase User:', firebaseUser);
  // {
  //   uid: 'user123',
  //   email: 'user@example.com',
  //   displayName: 'John Doe',
  //   getIdToken: [Function],
  //   ...
  // }
}
```

### Step 2: Get Token from Firebase User
```typescript
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { useAuth } from '@/context/AuthContext';

async function getToken() {
  const { firebaseUser } = useAuth();
  
  try {
    const token = await getAuthenticatedToken(firebaseUser);
    console.log('Token:', token);
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    return token;
  } catch (error) {
    console.error('Token error:', error.message);
    // "User not authenticated"
  }
}
```

### Step 3: Use Token in API Requests
```typescript
async function makeAuthenticatedRequest(token: string) {
  const response = await fetch('/api/projects', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}
```

## Complete Example

### Full Component
```typescript
'use client';

import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api/apiService';
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { useState } from 'react';

export default function ProjectsPage() {
  const { firebaseUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Method 1: Using apiService with firebaseUser
  async function loadProjectsWithApiService() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService({
        endpoint: '/api/projects',
        method: 'GET',
        firebaseUser: firebaseUser,
      });
      setProjects(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Method 2: Get token manually
  async function loadProjectsWithToken() {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthenticatedToken(firebaseUser);
      
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!firebaseUser) {
    return <div>Please log in first</div>;
  }

  return (
    <div>
      <h1>My Projects</h1>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading && <div>Loading...</div>}

      <button onClick={loadProjectsWithApiService}>
        Load Projects (Method 1)
      </button>
      
      <button onClick={loadProjectsWithToken}>
        Load Projects (Method 2)
      </button>

      <ul>
        {projects.map(project => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Function Reference

### `getAuthenticatedToken(firebaseUser)`

**Parameters**:
- `firebaseUser: FirebaseUser | null` - The current Firebase user object

**Returns**: 
- `Promise<string>` - The user's ID token

**Throws**:
- `Error("User not authenticated")` if firebaseUser is null
- `Error("Unable to get auth token")` if getIdToken fails

**Example**:
```typescript
try {
  const token = await getAuthenticatedToken(firebaseUser);
  console.log('Token:', token);
} catch (error) {
  console.error('Error:', error.message);
  // "User not authenticated"
}
```

### `apiService(options)`

**Parameters**:
```typescript
interface ApiServiceOptions {
  endpoint: string;           // API route path
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; // Default: GET
  data?: any;                 // Request body
  token?: string;             // Authorization token (optional)
  firebaseUser?: FirebaseUser; // Or pass Firebase user (optional)
  headers?: Record<string, string>; // Custom headers
  isFormData?: boolean;       // Use FormData for body
}
```

**Returns**: 
- `Promise<TResponse>` - API response

**Example**:
```typescript
const response = await apiService({
  endpoint: '/api/projects',
  method: 'GET',
  firebaseUser: firebaseUser,
});
```

## Common Patterns

### Pattern 1: Load Data on Component Mount
```typescript
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api/apiService';

export function ProjectsList() {
  const { firebaseUser } = useAuth();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!firebaseUser) return;

    apiService({
      endpoint: '/api/projects',
      firebaseUser: firebaseUser,
    })
    .then(setProjects)
    .catch(console.error);
  }, [firebaseUser]);

  return (
    <ul>
      {projects.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

### Pattern 2: Create Project with Token
```typescript
async function createProject(projectName: string) {
  const { firebaseUser } = useAuth();
  
  try {
    const newProject = await apiService({
      endpoint: '/api/projects',
      method: 'POST',
      data: { name: projectName },
      firebaseUser: firebaseUser,
    });
    console.log('Created:', newProject);
  } catch (error) {
    console.error('Failed to create project:', error);
  }
}
```

### Pattern 3: Manual Token Refresh
```typescript
async function refreshAndMakeRequest() {
  const { firebaseUser } = useAuth();
  
  // Force refresh the token
  const token = await getAuthenticatedToken(firebaseUser);
  
  // Use fresh token
  const response = await fetch('/api/projects', {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  
  return response.json();
}
```

## Troubleshooting

### Issue: "User not authenticated"
**Cause**: `firebaseUser` is null
**Solution**: 
```typescript
// Check if user is logged in
if (!firebaseUser) {
  console.log('Please log in first');
  return;
}

// Then get token
const token = await getAuthenticatedToken(firebaseUser);
```

### Issue: "Unable to get auth token"
**Cause**: Firebase user object doesn't have getIdToken method
**Solution**:
```typescript
// Ensure you're using the right user object
const { firebaseUser } = useAuth(); // ✅ Correct

// Not from DOM or other sources
const user = document.querySelector('[data-user]'); // ❌ Wrong
```

### Issue: Token is Expired
**Solution**: getAuthenticatedToken automatically refreshes:
```typescript
// Always use forceRefresh: true
const token = await getAuthenticatedToken(firebaseUser);
// Internally calls: firebaseUser.getIdToken(true)
```

### Issue: API Returns 401 Unauthorized
**Cause**: Token not included in request
**Solution**:
```typescript
// ✅ Correct - includes token
await apiService({
  endpoint: '/api/projects',
  firebaseUser: firebaseUser, // Pass user or token
});

// ❌ Wrong - no token
await fetch('/api/projects'); // Missing Authorization header
```

## Summary

✅ **Automatic**: Let `apiService` get token for you
✅ **Manual**: Use `getAuthenticatedToken()` to get token
✅ **Direct**: Pass token explicitly to `apiService`
✅ **Fresh**: Token is automatically refreshed when needed
✅ **Secure**: Token included in Authorization header

**Best Practice**: Use Option 1 (Automatic) for most cases - it's cleanest and handles everything for you.

---

**Function Location**: `src/lib/utils/authUtils.ts`
**Service Location**: `src/services/api/apiService.ts`
**Context Location**: `src/context/AuthContext.tsx`
