import Link from 'next/link';
import { getTrendingProposals, getProposals } from '@/lib/proposals';
import { Button } from '@/components/atoms/Button';
import { StatusChip, VoteCounter } from '@/components/atoms/Badge';

export const revalidate = 300; // ISR: 5 minutes

export default async function HomePage() {
  const trendingData = await getTrendingProposals(5);
  const allProposalsData = await getProposals({ limit: 10 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Civic Engagement Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect with your local government, submit proposals, and shape the future of your community.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/proposals">
            <Button size="lg">Browse Proposals</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">Get Started</Button>
          </Link>
        </div>
      </section>

      {/* Trending Proposals */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🔥 Trending Proposals</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trendingData.map((proposal) => (
            <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <StatusChip status={proposal.status} />
                  <VoteCounter count={proposal.voteCount} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{proposal.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{proposal.description}</p>
              </div>
            </Link>
          ))}
        </div>
        {trendingData.length === 0 && (
          <p className="text-gray-500 text-center py-8">No trending proposals yet.</p>
        )}
      </section>

      {/* Recent Proposals */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Recent Proposals</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allProposalsData.data.map((proposal) => (
            <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <StatusChip status={proposal.status} />
                  <VoteCounter count={proposal.voteCount} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{proposal.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{proposal.description}</p>
                <p className="text-gray-400 text-xs mt-4">
                  {new Date(proposal.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
        {allProposalsData.data.length === 0 && (
          <p className="text-gray-500 text-center py-8">No proposals yet. Be the first to create one!</p>
        )}
        <div className="text-center mt-8">
          <Link href="/proposals">
            <Button variant="outline">View All Proposals</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}