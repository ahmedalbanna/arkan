
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { UploadManager } from "./UploadManager";

export default function FileManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>File & Context Manager</CardTitle>
        <CardDescription>
          Upload and manage all contextual files for your project here. These files can be used across all generation tools to provide the AI with relevant information, examples, or guidelines.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UploadManager />
      </CardContent>
    </Card>
  );
}
