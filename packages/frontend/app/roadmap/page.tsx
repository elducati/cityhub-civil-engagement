export const revalidate = 120;
export const metadata = {
  title: 'Public Roadmap',
  description: 'Track the progress of community proposals — from planning through implementation.',
};

import Link from 'next/link';
import { getProposals } from '@/lib/proposals';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Clock, CheckCircle2, Target, Lightbulb } from 'lucide-react';

const statusMeta: Record<string, { label: string; dotClass: string; barClass: string; badgeClass: string }> = {
  PLANNED: { label: 'Planned', dotClass: 'border-warning', barClass: 'bg-warning', badgeClass: 'bg-warning/10 text-warning' },
  IMPLEMENTED: { label: 'Implemented', dotClass: 'border-success', barClass: 'bg-success', badgeClass: 'bg-success/10 text-success' },
};

export default async function RoadmapPage() {
  const [planned, implemented] = await Promise.all([
    getProposals({ status: 'PLANNED', limit: 50, sort: 'createdAt' }),
    getProposals({ status: 'IMPLEMENTED', limit: 50, sort: 'createdAt' }),
  ]);

  const allProposals = [
    ...planned.data.map(p => ({ ...p, _section: 'Planned' as const })),
    ...implemented.data.map(p => ({ ...p, _section: 'Implemented' as const })),
  ];

  return (
    <div className="min-h-screen bg-surface-base py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-3xl bg-primary-container flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-on-surface mb-3">Public Roadmap</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Track the progress of community proposals — from citizen idea through planning to completion.
            This is where civic participation meets tangible action.
          </p>
        </div>

        {allProposals.length === 0 ? (
          <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1">
            <CardContent className="py-16 text-center">
              <Lightbulb className="w-16 h-16 mx-auto text-on-surface-variant mb-4" />
              <h2 className="text-xl font-semibold text-on-surface mb-2">No proposals on the roadmap yet</h2>
              <p className="text-on-surface-variant mb-6">Proposals that enter the planning or implementation phase will appear here.</p>
              <Link href="/proposals">
                <Button className="rounded-full">Browse Proposals</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-outline/50" />

            <div className="space-y-8">
              {allProposals.map((proposal, idx) => {
                const meta = statusMeta[proposal.status];
                const isFirstInSection = idx === 0 || allProposals[idx - 1]?._section !== proposal._section;

                return (
                  <div key={proposal.id} className="relative pl-16">
                    {/* Timeline dot */}
                    <div className={`absolute left-6 w-5 h-5 rounded-full border-2 bg-surface-base -translate-x-1/2 mt-6 ${meta?.dotClass || 'border-outline'}`} />

                    {/* Section header */}
                    {isFirstInSection && (
                      <div className="mb-4">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${meta?.badgeClass || 'bg-surface-container-high text-on-surface-variant'}`}>
                          {proposal._section === 'Planned' ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          {proposal._section}
                        </span>
                      </div>
                    )}

                    <Link href={`/proposals/${proposal.id}`}>
                      <Card className="bg-surface-container rounded-2xl border-none shadow-elevation-1 hover:shadow-elevation-2 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden">
                        <div className={`h-1 w-full ${meta?.barClass || 'bg-outline'}`} />
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-on-surface mb-1 line-clamp-1">{proposal.title}</h3>
                              <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">{proposal.description}</p>
                              <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                                <span>{formatDate(proposal.createdAt)}</span>
                                {proposal.category && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-outline" />
                                    <span className="capitalize">{proposal.category}</span>
                                  </>
                                )}
                                <span className="w-1 h-1 rounded-full bg-outline" />
                                <span>{proposal.voteCount} votes</span>
                              </div>
                              {proposal.tags && proposal.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {proposal.tags.map((tag) => (
                                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-surface-container-high text-on-surface-variant">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Badge className={`shrink-0 ${proposal._section === 'Planned' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                              {proposal._section === 'Planned' ? 'Planned' : 'Done'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold text-on-surface mb-3">Have an idea?</h2>
          <p className="text-on-surface-variant mb-6">Submit your own proposal and help shape the community.</p>
          <Link href="/proposals/create">
            <Button className="rounded-full">
              <Lightbulb className="w-4 h-4 mr-2" />
              Submit a Proposal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
