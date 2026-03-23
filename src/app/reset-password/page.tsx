import { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset Password | Arkan",
  description: "Reset your Arkan account password",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="flex justify-center p-8"><span className="animate-pulse">Loading...</span></div>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
