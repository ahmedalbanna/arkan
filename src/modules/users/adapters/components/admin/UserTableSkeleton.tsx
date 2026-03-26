
'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocalization } from '@/context/LocalizationContext';

const USERS_PER_PAGE = 10;

export function UserTableSkeleton() {
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
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-16 inline-block" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
