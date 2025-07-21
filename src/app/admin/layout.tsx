
'use client';

import { useAuth } from "@/context/AuthContext";
import { notFound } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function AdminLayoutContent({ children }: { children: ReactNode }) {
    const { userProfile, isLoading: isAuthLoading } = useAuth();

    useEffect(() => {
        if (!isAuthLoading && userProfile?.role !== 'admin') {
            notFound();
        }
    }, [isAuthLoading, userProfile]);

    if (isAuthLoading || userProfile?.role !== 'admin') {
        return (
             <div className="flex h-screen w-full items-center justify-center">
                <p>Loading...</p>
             </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/40">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
                 <Button asChild variant="outline" size="sm">
                    <Link href="/admin/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Admin Dashboard
                    </Link>
                </Button>
                <h1 className="flex-1 text-lg font-semibold md:text-2xl">Admin Panel</h1>
            </header>
            <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
    );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
