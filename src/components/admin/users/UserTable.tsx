
'use client';

import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useLocalization } from "@/context/LocalizationContext";
import type { UserProfile } from "@/lib/types";
import { UserTableRow } from "./UserTableRow";

interface UserTableProps {
  users: UserProfile[];
}

export function UserTable({ users }: UserTableProps) {
  const { t } = useLocalization();

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('manageUsers.tableHeadName')}</TableHead>
            <TableHead>{t('manageUsers.tableHeadEmail')}</TableHead>
            <TableHead>{t('manageUsers.tableHeadRole')}</TableHead>
            <TableHead>{t('manageUsers.tableHeadCredits')}</TableHead>
            <TableHead>{t('manageUsers.tableHeadJoined')}</TableHead>
            <TableHead className="text-right">{t('manageUsers.tableHeadActions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.length > 0 ? (
            users.map((user) => <UserTableRow key={user.id} user={user} />)
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
