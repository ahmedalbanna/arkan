
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocalization } from "@/context/LocalizationContext";
import type { User } from "@/lib/models/user";
import { UserTableRow } from "./UserTableRow";

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  const { t } = useLocalization();

  return (
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-primary/5 to-blue-500/5">
              <TableHead className="font-headline">{t('manageUsers.tableHeadName')}</TableHead>
              <TableHead className="font-headline">{t('manageUsers.tableHeadEmail')}</TableHead>
              <TableHead className="font-headline">{t('manageUsers.tableHeadRole')}</TableHead>
              <TableHead className="font-headline">{t('manageUsers.tableHeadCredits')}</TableHead>
              <TableHead className="font-headline">{t('manageUsers.tableHeadJoined')}</TableHead>
              <TableHead className="text-right font-headline">{t('manageUsers.tableHeadActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.length > 0 ? (
              users.map((user, index) => (
                <AnimatedContainer key={user.id} animation="fade-in-up" delay={100 + (index * 100)}>
                  <UserTableRow user={user} />
                </AnimatedContainer>
              ))
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
    </AnimatedContainer>
  );
}
