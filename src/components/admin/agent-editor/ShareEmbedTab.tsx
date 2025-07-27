
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Globe, LayoutTemplate, Copy, EyeOff, Timer, KeyRound, Palette, Image as ImageIcon, Link2, Code, Upload } from 'lucide-react';

const SettingRow = ({ icon: Icon, title, description, control }: { icon: React.ElementType, title: string, description: string, control: React.ReactNode }) => (
    <div className="flex items-start justify-between rounded-lg border p-4">
        <div className="flex items-start gap-4">
            <Icon className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
                <Label className="font-semibold">{title}</Label>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
        {control}
    </div>
)

export default function ShareEmbedTab() {
    return (
        <div className="space-y-6">
            <CardTitle>Share & Embed</CardTitle>
            <p className="text-sm text-muted-foreground">
                Share and deploy your AI Agent beyond your workspace! Use a public link to embed your agent on websites, dashboards, or share it directly. Your agent will update in real-time, so it's always ready to interact, learn, and act using the tools and knowledge you've equipped it with. <a href="#" className="text-primary underline">Learn more.</a>
            </p>

            <div className="space-y-4">
                <SettingRow
                    icon={Globe}
                    title="Public access"
                    description="Allow public access to your agent."
                    control={<Switch defaultChecked />}
                />
                <SettingRow
                    icon={LayoutTemplate}
                    title="Mode"
                    description="Choose 'Chat Only' for a chatbot experience or 'Chat & Template' to share your agent prompts, tools and knowledge with others."
                    control={
                        <Select defaultValue="chat-only">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="chat-only">Chat Only</SelectItem>
                                <SelectItem value="chat-template">Chat & Template</SelectItem>
                            </SelectContent>
                        </Select>
                    }
                />
                <SettingRow
                    icon={Copy}
                    title="Copy Knowledge"
                    description="Allow others to copy your agent's knowledge when cloning."
                    control={<Switch />}
                />
                 <SettingRow
                    icon={EyeOff}
                    title="Hide Branding"
                    description='Remove "Powered by Taskade" in the footer.'
                    control={<Switch />}
                />
                 <SettingRow
                    icon={Timer}
                    title="Chat Timeout"
                    description='End the conversation after 5 minutes of inactivity. This must be turned on for the "Public Agent Chat Ended Trigger" to work.'
                    control={<Switch />}
                />
                <SettingRow
                    icon={KeyRound}
                    title="Require password"
                    description="Add a password to your public agent."
                    control={<Switch />}
                />
                 <SettingRow
                    icon={Palette}
                    title="Theme"
                    description="Select a light, dark, or automatic theme to follow system preferences."
                    control={
                        <Select defaultValue="light">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light theme</SelectItem>
                                <SelectItem value="dark">Dark theme</SelectItem>
                                <SelectItem value="system">System default</SelectItem>
                            </SelectContent>
                        </Select>
                    }
                />
                <SettingRow
                    icon={ImageIcon}
                    title="Background"
                    description="Select or upload a custom background."
                    control={
                         <Button variant="outline">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                        </Button>
                    }
                />
            </div>
            
            <div className="space-y-6 pt-6 border-t">
                 <div className="space-y-2">
                    <Label className="font-semibold">Agent Share Link</Label>
                    <p className="text-sm text-muted-foreground">Share this link with anyone to let them interact with your agent, even if they're not part of your team.</p>
                    <div className="flex gap-2">
                        <Input readOnly defaultValue="www.taskade.com" className="w-[180px]" />
                        <Input readOnly defaultValue="/a/01K15FXE319BZWGNSZPBCDHC8A?via=albanna" className="flex-grow" />
                        <Button variant="outline"><Link2 className="mr-2 h-4 w-4" /> Copy link</Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="font-semibold">Embed Code</Label>
                    <p className="text-sm text-muted-foreground">Embed your agent anywhere! Copy this code snippet and add it to your website to display your public agent.</p>
                    <Textarea 
                        readOnly
                        rows={4}
                        className="font-mono text-xs"
                        value='<iframe allow="clipboard-read; clipboard-write" src="https://www.taskade.com/a/01K15FXE319BZWGNSZPBCDHC8A?via=albanna" width="600" height="400" frameborder="0" allowfullscreen></iframe>'
                    />
                     <Button variant="outline"><Code className="mr-2 h-4 w-4" /> Copy code</Button>
                </div>
            </div>

        </div>
    );
}
