
'use client';

import AgentEditor from '@/components/AgentEditor';
import { useLocalization } from '@/context/LocalizationContext';
import { Pencil } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Assume this function fetches agent data
// Replace with your actual data fetching logic
async function fetchAgentData(agentId: string) {
  // Simulate fetching data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: agentId, name: 'Sample Agent', prompt: 'This is a sample prompt.' });
    }, 1000); // Simulate 1 second loading time
  });
}
export default function EditAgentPage({ params }: { params: { id: string } }) {
  const { t } = useLocalization();
  const [agentData, setAgentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAgentData = async () => {
      try {
        const data = await fetchAgentData(params.id);
        setAgentData(data);
      } catch (err) {
        setError(t('agentEditor.errorLoading')); // Use the localization key for error message
      } finally {
        setLoading(false);
      }
    };

    loadAgentData();
  }, [params.id, t]); // Add t as a dependency

  if (loading) {
    return <div className="text-center">Loading agent data...</div>; // Loading indicator
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>; // Error message
  }

  if (!agentData) {
    return <div className="text-center text-red-500">Agent data not found.</div>; // Handle case where data is null after loading
  }
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Pencil className="w-10 h-10" />
          {t('agentEditor.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('agentEditor.pageSubtitle')}
        </p>
      </div>
      <AgentEditor agentId={agentData.id} initialData={agentData} />
    </div>
  );
}
