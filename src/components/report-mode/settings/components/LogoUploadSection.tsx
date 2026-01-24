'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';

interface LogoUploadSectionProps {
  logoPreview: string | null;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
}

/**
 * LogoUploadSection Component
 *
 * Handles project logo upload with preview and remove functionality.
 */
export function LogoUploadSection({
  logoPreview,
  isUploading,
  onFileChange,
  onRemoveLogo,
}: LogoUploadSectionProps) {
  return (
    <div className="space-y-2">
      <Label>Project Logo</Label>
      {logoPreview ? (
        <div className="relative inline-block">
          <Image
            src={logoPreview}
            alt="Project Logo"
            width={150}
            height={150}
            className="rounded-md border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={onRemoveLogo}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={isUploading} asChild>
            <label htmlFor="logo-upload" className="cursor-pointer">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Logo
                </>
              )}
            </label>
          </Button>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      )}
    </div>
  );
}
