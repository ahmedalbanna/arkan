
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { InviteMemberForm } from './InviteMemberForm';
import { useLocalization } from '@/context/LocalizationContext';
import type { Team } from '@/lib/models/team';

interface TeamCardProps {
    team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
    const { firebaseUser } = useAuth();
    const { t } = useLocalization();

    const isOwner = useMemo(() => team.ownerId === firebaseUser?.uid, [team, firebaseUser]);
    const members = useMemo(() => team.members.sort((a, b) => a.name.localeCompare(b.name)), [team.members]);

    return (
        <AccordionItem value={team.id} className="border rounded-lg bg-card">
            <AccordionTrigger className="p-4 hover:no-underline">
                <div className="flex flex-col items-start">
                    <CardTitle className="font-headline text-xl">{team.name}</CardTitle>
                    <CardDescription>{t('team.memberCount').replace('{count}', team.members.length.toString())}</CardDescription>
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold mb-2">{t('team.members')}</h4>
                        <div className="space-y-4">
                            {members.map(member => (
                                <div key={member.id} className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={member.profilePictureUrl} />
                                        <AvatarFallback>{member.getInitials()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <p className="font-medium">{member.name}</p>
                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                    </div>
                                    <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                                        {t(`team.roles.${member.role}`)}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    {isOwner && (
                        <div className="pt-6 border-t">
                            <h4 className="font-semibold mb-2">{t('team.inviteNewMember')}</h4>
                            <InviteMemberForm teamId={team.id} />
                        </div>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
