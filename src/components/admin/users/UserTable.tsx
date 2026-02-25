
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocalization } from "@/context/LocalizationContext";
import type { User } from "@/modules/users/domain/entities/User";
import { UserTableRow } from "./UserTableRow";

interface UserTableProps {
  users: User[];
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
                {t('manageUsers.noUsersFound')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
