'use client';

import TeamManager from '@/components/team/TeamManager';
import { AnimatedContainer } from '@/components/ui/animation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/LocalizationContext';
import { Settings, Shield, UserPlus, Users } from 'lucide-react';

export default function ManageTeamPage() {
  const { t } = useLocalization();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedContainer animation="fade-in-down" delay={200}>
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-glow">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold bg-gradient-to-r from-purple-500 via-primary to-pink-500 bg-clip-text text-transparent">
              {t('team.manageTeams')}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              {t('team.manageTeamsSubtitle')}
            </p>
          </AnimatedContainer>
        </div>

        {/* Team Management Card */}
        <AnimatedContainer animation="fade-in-up" delay={400}>
          <Card variant="glass" className="backdrop-blur-md shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">Team Management</CardTitle>
                  <CardDescription>Manage your team members and permissions</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-sm">
                    <UserPlus className="h-3 w-3" />
                    <span>Add Members</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-sm">
                    <Shield className="h-3 w-3" />
                    <span>Permissions</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TeamManager />
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}
