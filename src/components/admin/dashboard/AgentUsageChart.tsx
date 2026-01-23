'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AgentUsageData {
  name: string;
  count?: number;
  usage?: number;
}

interface AgentUsageChartProps {
  data: AgentUsageData[];
}

/**
 * AgentUsageChart Component
 * 
 * Displays a bar chart showing agent usage statistics.
 */
export function AgentUsageChart({ data }: AgentUsageChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Usage</CardTitle>
        <CardDescription>Number of requests per agent</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey={data[0]?.count !== undefined ? "count" : "usage"} fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
