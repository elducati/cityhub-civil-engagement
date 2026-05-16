'use client';

import { useRouter } from 'next/navigation';
import { ProposalForm } from '@/components/molecules/ProposalForm';
import { createProposal } from '@/lib/proposals';
import { Card, CardContent } from '@/components/ui/card';

export default function CreateProposalPage() {
  const router = useRouter();

  const handleSubmit = async (data: { title: string; description: string; category: string; latitude?: number | string; longitude?: number | string }) => {
    try {
      await createProposal({
        title: data.title,
        description: data.description,
        category: data.category,
        latitude: data.latitude ? Number(data.latitude) : undefined,
        longitude: data.longitude ? Number(data.longitude) : undefined,
      });
      router.push('/proposals');
    } catch (error) {
      console.error('Failed to create proposal:', error);
    }
  };

  return (
    <div className="min-h-screen bg-surface-base py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-on-surface mb-6">Create New Proposal</h1>
        <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-2">
          <CardContent className="p-6">
            <ProposalForm onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}