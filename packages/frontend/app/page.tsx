import Link from 'next/link';
import { getTrendingProposals, getProposals } from '@/lib/proposals';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusChip, VoteCounter } from '@/components/atoms/Badge';
import { formatRelativeDate } from '@/lib/utils';
import { Lightbulb, Vote, Building2, TrendingUp, FileText } from 'lucide-react';

export const revalidate = 300;

export default async function HomePage() {
  const trendingData = await getTrendingProposals(5);
  const allProposalsData = await getProposals({ limit: 6 });

  return (
    <div className="min-h-screen bg-[#FFFBFE]">
      {/* Hero Section */}
      <section className="relative bg-[#6750A4] py-20 px-4 overflow-hidden">
        {/* Decorative blurred blobs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#EADDFF] rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[#E8DEF8] rounded-full blur-3xl opacity-50" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-[#EADDFF] text-[#21005D] rounded-full font-medium">
            Civic Engagement Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight font-['Google_Sans','Roboto',sans-serif]">
            Shape Your City's Future
          </h1>
          <p className="text-xl md:text-2xl text-[#EADDFF] mb-10 max-w-3xl mx-auto leading-relaxed">
            Your voice matters. Submit proposals, vote on community issues, and collaborate with local leaders to build a better city together.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/proposals">
              <Button size="lg" className="rounded-full bg-[#EADDFF] text-[#21005D] hover:bg-[#E8DEF8] px-8 py-3 font-medium">
                Browse Proposals
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="ghost" className="rounded-full border-2 border-[#EADDFF] text-white hover:bg-[#EADDFF]/10 px-8 py-3">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-[#F3EDF7]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#CAC4D0] rounded-3xl overflow-hidden">
            {[
              { label: 'Active Proposals', value: '24' },
              { label: 'Total Votes', value: '1,234' },
              { label: 'Active Citizens', value: '567' },
              { label: 'Decisions Made', value: '12' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#F3EDF7] p-6 text-center">
                <div className="text-3xl font-bold text-[#1C1B1F] mb-1 font-['Google_Sans','Roboto',sans-serif]">{stat.value}</div>
                <div className="text-sm text-[#49454F]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-[#FFFBFE]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#1C1B1F] mb-12 flex items-center justify-center gap-3 font-['Google_Sans','Roboto',sans-serif]">
            <Lightbulb className="w-8 h-8 text-[#6750A4]" />
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Lightbulb, title: 'Submit Ideas', desc: 'Share your proposals for improving the city' },
              { icon: Vote, title: 'Collect Support', desc: 'Gather votes from fellow citizens' },
              { icon: Building2, title: 'Make Change', desc: 'Approved proposals get implemented' },
            ].map((step, i) => (
              <Card key={i} className="rounded-3xl ring-1 ring-[#E6E0E9] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#E8DEF8] rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-[#6750A4]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1C1B1F] mb-2 font-['Google_Sans','Roboto',sans-serif]">{step.title}</h3>
                  <p className="text-[#49454F]">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Proposals */}
      <section className="py-16 bg-[#F3EDF7]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-[#1C1B1F] flex items-center gap-3 font-['Google_Sans','Roboto',sans-serif]">
              <TrendingUp className="w-8 h-8 text-[#6750A4]" />
              Trending Proposals
            </h2>
            <Link href="/proposals" className="text-[#6750A4] hover:underline font-medium">
              View all →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingData.map((proposal) => (
              <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
                <Card className="rounded-3xl ring-1 ring-[#E6E0E9] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <StatusChip status={proposal.status} />
                      <VoteCounter count={proposal.voteCount} />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1C1B1F] mb-2 line-clamp-2 font-['Google_Sans','Roboto',sans-serif]">{proposal.title}</h3>
                    <p className="text-[#49454F] text-sm line-clamp-3 mb-4">{proposal.description}</p>
                    <p className="text-xs text-[#79747E]">{formatRelativeDate(proposal.createdAt)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {trendingData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#49454F] text-lg">No trending proposals yet.</p>
              <Link href="/proposals/create">
                <Button className="mt-4 rounded-full">Create the first one</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Recent Proposals */}
      <section className="py-16 bg-[#FFFBFE]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-[#1C1B1F] flex items-center gap-3 font-['Google_Sans','Roboto',sans-serif]">
              <FileText className="w-8 h-8 text-[#6750A4]" />
              Recent Proposals
            </h2>
            <Link href="/proposals" className="text-[#6750A4] hover:underline font-medium">
              View all →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProposalsData.data.map((proposal) => (
              <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
                <Card className="rounded-3xl ring-1 ring-[#E6E0E9] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <StatusChip status={proposal.status} />
                      <VoteCounter count={proposal.voteCount} />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1C1B1F] mb-2 line-clamp-2 font-['Google_Sans','Roboto',sans-serif]">{proposal.title}</h3>
                    <p className="text-[#49454F] text-sm line-clamp-3 mb-4">{proposal.description}</p>
                    <p className="text-xs text-[#79747E]">{formatRelativeDate(proposal.createdAt)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {allProposalsData.data.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#49454F] text-lg mb-4">No proposals yet. Be the first to create one!</p>
              <Link href="/proposals/create">
                <Button className="rounded-full">Create Proposal</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#6750A4]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white font-['Google_Sans','Roboto',sans-serif]">Ready to Make a Difference?</h2>
          <p className="text-xl text-[#EADDFF] mb-8">Join thousands of citizens already shaping their community</p>
          <Link href="/register">
            <Button size="lg" className="rounded-full bg-[#EADDFF] text-[#21005D] hover:bg-white px-8 py-3 font-medium">
              Create Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}