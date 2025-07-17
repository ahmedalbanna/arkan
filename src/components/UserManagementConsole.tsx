
'use client';

import { useState } from 'react';
import type { AllUsers } from '@/lib/db/queries';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Pencil, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { userKeys } from '@/lib/query-keys';


const USERS_PER_PAGE = 10;

// This query function now uses the page number to fetch a specific "page" of users.
async function fetchUsers(page: number): Promise<AllUsers> {
    // The API route needs to be updated to handle these query parameters.
    const response = await fetch(`/api/users?page=${page}&limit=${USERS_PER_PAGE}`);
    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }
    return response.json();
}

function UserTableSkeleton() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function UserManagementConsole() {
  const [page, setPage] = useState(1);

  // The query key now uses the factory and includes the page number.
  const { data: users, isLoading, isError, isFetching } = useQuery({
      queryKey: userKeys.list(page),
      queryFn: () => fetchUsers(page),
      placeholderData: (previousData) => previousData, // Keep showing old data while fetching new page
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
            <span>All Users</span>
            {isFetching && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          {isLoading ? (
            <UserTableSkeleton />
          ) : isError ? (
            <div className="p-8 text-center text-destructive">Failed to load users.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.credits}</TableCell>
                    <TableCell>{format(new Date(user.createdAt), 'd MMM yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/manage-users/${user.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit User</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1 || isFetching}
            >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
            </Button>
            <span className="text-sm font-medium">Page {page}</span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!users || users.length < USERS_PER_PAGE || isFetching}
            >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
