
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocalization } from '@/context/LocalizationContext';

const USERS_PER_PAGE = 10;

export function UserTableSkeleton() {
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
                        {Array.from({ length: 5 }).map((_, i) => (
                            <AnimatedContainer key={i} animation="fade-in-up" delay={100 + (i * 100)}>
                                <TableRow>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-16 inline-block" /></TableCell>
                                </TableRow>
                            </AnimatedContainer>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AnimatedContainer>
    );
}
