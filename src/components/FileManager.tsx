
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { UploadManager } from "./UploadManager";
import AnalystAgent from "./AnalystAgent"; // Assuming AnalystAgent is extracted

export default function FileManager() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        <div className="lg:col-span-5 xl:col-span-4 h-full">
            <UploadManager />
        </div>
        <div className="lg:col-span-7 xl:col-span-8 h-full">
            <AnalystAgent />
        </div>
    </div>
  );
}
