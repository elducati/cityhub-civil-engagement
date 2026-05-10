'use client';

import { useRouter } from 'next/navigation';
import { ProposalForm } from '@/components/molecules/ProposalForm';
import { createProposal } from '@/lib/proposals';

export default function CreateProposalPage() {
  const router = useRouter();

  const handleSubmit = async (data: { title: string; description: string; category: string; tags: string[] }) => {
    try {
      await createProposal({
        title: data.title,
        description: data.description,
      });
      router.push('/proposals');
    } catch (error) {
      console.error('Failed to create proposal:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Proposal</h1>
      <div className="bg-white rounded-lg border p-6">
        <ProposalForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}