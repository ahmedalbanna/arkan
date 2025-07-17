
import { getUserProfile } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Gem, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default async function ProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getUserProfile(params.id);

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
              <AvatarImage src={user.avatarUrl ?? ''} alt={user.name} />
              <AvatarFallback className="text-3xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          <CardTitle className="text-3xl font-headline">{user.name}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="mt-4 space-y-6">
           <div className="p-4 rounded-lg bg-muted border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Gem className="h-5 w-5 text-primary" />
                    <span className="font-semibold">AI Credits</span>
                </div>
                <Badge variant="secondary" className="text-lg">{user.credits}</Badge>
           </div>
          
           <div className="space-y-4">
             <div className="flex items-start gap-3">
               <Calendar className="h-5 w-5 mt-1 text-muted-foreground" />
               <div>
                 <h4 className="font-semibold">Joined</h4>
                 <p className="text-muted-foreground">{format(new Date(user.createdAt), 'MMMM d, yyyy')}</p>
               </div>
             </div>
             
             {user.bio && (
                 <div className="flex items-start gap-3">
                   <Mail className="h-5 w-5 mt-1 text-muted-foreground" />
                   <div>
                     <h4 className="font-semibold">Bio</h4>
                     <p className="text-muted-foreground">{user.bio}</p>
                   </div>
                 </div>
             )}
           </div>

        </CardContent>
      </Card>
    </div>
  );
}
