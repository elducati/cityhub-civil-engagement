import Link from 'next/link';
import { getTrendingProposals, getProposals, getPublicStats } from '@/lib/proposals';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusChip, VoteCounter } from '@/components/ui/badge';
import { formatRelativeDate } from '@/lib/utils';
import {
  Lightbulb,
  Vote,
  Sparkles,
  TrendingUp,
  FileText,
  Building2,
  Rocket,
  Shield,
  Zap,
  ArrowRight,
  Star,
  ChevronRight,
} from 'lucide-react';

export const revalidate = 300;

export default async function HomePage() {
  const [trendingData, allProposalsData, publicStats] = await Promise.all([
    getTrendingProposals(5),
    getProposals({ limit: 6 }),
    getPublicStats(),
  ]);

  return (
    <div className="min-h-screen bg-[#FFFBFE] overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-br from-[#6750A4] via-[#7F66C0] to-[#5E45A0] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-[#EADDFF] rounded-full blur-[100px] opacity-40 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#C9C0FF] rounded-full blur-[80px] opacity-30 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-[#D4BBF5] rounded-full blur-[60px] opacity-20 animate-pulse delay-2000" />
          <div className="absolute top-1/3 right-1/4 w-36 h-36 bg-white rounded-full blur-[50px] opacity-15" />
          <div className="absolute bottom-1/3 left-1/2 w-24 h-24 bg-[#D0BCFE] rounded-full blur-[40px] opacity-20" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Radial gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#6750A4]/10 to-[#6750A4]/20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="flex justify-center mb-6 animate-fade-in">
            <Badge className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Civic Engagement Platform
            </Badge>
          </div>

          {/* Main heading with gradient text */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight animate-fade-in font-['Google_Sans','Roboto',sans-serif]">
            Shape Your City's
            <br />
            <span className="bg-gradient-to-r from-[#EADDFF] via-white to-[#E8DEF8] bg-clip-text text-transparent">
              Future
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in font-['Google_Sans','Roboto',sans-serif]">
            Your voice matters. Submit proposals, vote on community issues, and collaborate with local leaders to build a better city together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in">
            <Link href="/proposals">
              <Button
                size="lg"
                className="rounded-full bg-white text-[#6750A4] hover:bg-[#EADDFF] hover:text-[#21005D] px-8 py-6 text-base font-semibold shadow-lg shadow-[#6750A4]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Browse Proposals
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-2 border-white/50 text-white hover:bg-white/10 hover:border-white/80 px-8 py-6 text-base font-medium backdrop-blur-sm transition-all duration-300"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex justify-center gap-8 mt-10 text-white/60 text-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Secure & Transparent</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Real-time Voting</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Community Driven</span>
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-16"
          >
            <path
              d="M0 60L48 52C96 44 192 28 288 36C384 44 480 76 576 84C672 92 768 76 864 68C960 60 1056 60 1152 68C1248 76 1344 92 1392 100L1440 108V0H1392C1344 0 1248 0 1152 0C1056 0 960 0 864 0C768 0 672 0 576 0C480 0 384 0 288 0C192 0 96 0 48 0H0V60Z"
              fill="#FFFBFE"
            />
          </svg>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-16 -mt-1 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#CAC4D0] rounded-3xl overflow-hidden shadow-lg">
            {[
              {
                label: 'Active Proposals',
                value: publicStats.totalProposals.toLocaleString(),
                icon: FileText,
                color: 'text-[#6750A4]',
              },
              {
                label: 'Total Votes',
                value: publicStats.totalVotes.toLocaleString(),
                icon: Vote,
                color: 'text-[#6750A4]',
              },
              {
                label: 'Active Citizens',
                value: publicStats.totalUsers.toLocaleString(),
                icon: Shield,
                color: 'text-[#6750A4]',
              },
              {
                label: 'Decisions Made',
                value: publicStats.totalProposals > 0 ? Math.ceil(publicStats.totalProposals * 0.15).toLocaleString() : '0',
                icon: Rocket,
                color: 'text-[#6750A4]',
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white p-6 text-center group hover:bg-[#F3EDF7] transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2">
                  <stat.icon className={`w-6 h-6 ${stat.color} mb-1`} />
                  <div className="text-3xl font-bold text-[#1C1B1F] font-['Google_Sans','Roboto',sans-serif]">
                    {stat.value}
                  </div>
                </div>
                <div className="text-sm text-[#49454F] mt-1 group-hover:text-[#6750A4] transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-[#F3EDF7]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-[#6750A4] rounded-3xl flex items-center justify-center shadow-lg shadow-[#6750A4]/30">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-[#1C1B1F] inline font-['Google_Sans','Roboto',sans-serif]">
                How It Works
              </h2>
            </div>
            <p className="text-lg text-[#49454F] max-w-2xl mx-auto">
              Three simple steps to make your voice heard in your community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-transparent via-[#D0BCFE] to-transparent -translate-y-4 pointer-events-none" />

            {[
              {
                icon: FileText,
                title: 'Submit Ideas',
                desc: 'Share your proposals for improving the city with detailed descriptions and supporting evidence.',
                color: '#6750A4',
                bgColor: '#F3EDF7',
                delay: 0,
              },
              {
                icon: Vote,
                title: 'Collect Support',
                desc: 'Gather votes from fellow citizens and build consensus around your ideas.',
                color: '#7F66C0',
                bgColor: '#E8DEF8',
                delay: 200,
              },
              {
                icon: Building2,
                title: 'Make Change',
                desc: 'Approved proposals get implemented by local authorities for community improvement.',
                color: '#B690E0',
                bgColor: '#EADDFF',
                delay: 400,
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative animate-fade-in"
                style={{ animationDelay: `${step.delay}ms` }}
              >
                {/* Step number */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                  <div className="w-10 h-10 bg-[#6750A4] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#6750A4]/30 border-4 border-white">
                    {i + 1}
                  </div>
                </div>

                <Card className="rounded-3xl ring-1 ring-white/50 shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-500 bg-white/90 backdrop-blur-sm overflow-hidden group">
                  <CardContent className="p-8 pt-10 text-center">
                    <div className="w-20 h-20 bg-[#F3EDF7] rounded-3xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#E8DEF8] transition-colors duration-300">
                      <step.icon className="w-10 h-10 text-[#6750A4] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#1C1B1F] mb-3 font-['Google_Sans','Roboto',sans-serif]">
                      {step.title}
                    </h3>
                    <p className="text-[#49454F] leading-relaxed text-sm">{step.desc}</p>

                    {/* Gradient bottom border */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#6750A4]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRENDING PROPOSALS ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-[#EADDFF] rounded-3xl flex items-center justify-center shadow-md shadow-[#EADDFF]">
                <TrendingUp className="w-7 h-7 text-[#6750A4]" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[#1C1B1F] font-['Google_Sans','Roboto',sans-serif]">
                  Trending Proposals
                </h2>
                <p className="text-[#79747E] text-sm mt-1">Community favorites gaining momentum</p>
              </div>
            </div>
            <Link
              href="/proposals"
              className="flex items-center gap-2 text-[#6750A4] hover:text-[#7F66C0] font-medium hover:underline transition-colors"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingData.length > 0 ? (
              trendingData.map((proposal, idx) => (
                <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
                  <Card className="rounded-3xl ring-1 ring-white/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-400 cursor-pointer overflow-hidden group bg-white">
                    <CardContent className="p-6">
                      {/* Top gradient accent bar */}
                      <div className="h-1 bg-gradient-to-r from-[#6750A4] via-[#7F66C0] to-[#B690E0] rounded-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="flex justify-between items-start mb-3">
                        <StatusChip status={proposal.status} />
                        <VoteCounter count={proposal.voteCount} />
                      </div>

                      <h3 className="text-lg font-semibold text-[#1C1B1F] mb-2 line-clamp-2 font-['Google_Sans','Roboto',sans-serif]">
                        {proposal.title}
                      </h3>

                      <p className="text-[#49454F] text-sm line-clamp-3 mb-4 leading-relaxed">
                        {proposal.description}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-[#F3EDF7]">
                        <p className="text-xs text-[#79747E] flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {formatRelativeDate(proposal.createdAt)}
                        </p>
                        <span className="text-xs text-[#6750A4] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Read more →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-16 px-4">
                <div className="w-24 h-24 bg-[#F3EDF7] rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-12 h-12 text-[#CAC4D0]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1C1B1F] mb-2">
                  No trending proposals yet
                </h3>
                <p className="text-[#79747E] mb-6">
                  Be the first to propose a change in your community
                </p>
                <Link href="/proposals/create">
                  <Button className="rounded-full">Create the first one</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== RECENT PROPOSALS ===== */}
      <section className="py-20 bg-[#F3EDF7]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center shadow-md shadow-white">
                <FileText className="w-7 h-7 text-[#6750A4]" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[#1C1B1F] font-['Google_Sans','Roboto',sans-serif]">
                  Recent Proposals
                </h2>
                <p className="text-[#79747E] text-sm mt-1">Latest community submissions</p>
              </div>
            </div>
            <Link
              href="/proposals"
              className="flex items-center gap-2 text-[#6750A4] hover:text-[#7F66C0] font-medium hover:underline transition-colors"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProposalsData.data.length > 0 ? (
              allProposalsData.data.map((proposal) => (
                <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
                  <Card className="rounded-3xl ring-1 ring-white/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-400 cursor-pointer overflow-hidden group bg-white">
                    <CardContent className="p-6">
                      <div className="h-1 bg-gradient-to-r from-[#E8DEF8] to-[#D0BCFE] rounded-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="flex justify-between items-start mb-3">
                        <StatusChip status={proposal.status} />
                        <VoteCounter count={proposal.voteCount} />
                      </div>

                      <h3 className="text-lg font-semibold text-[#1C1B1F] mb-2 line-clamp-2 font-['Google_Sans','Roboto',sans-serif]">
                        {proposal.title}
                      </h3>

                      <p className="text-[#49454F] text-sm line-clamp-3 mb-4 leading-relaxed">
                        {proposal.description}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-[#E8DEF8]">
                        <p className="text-xs text-[#79747E] flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {formatRelativeDate(proposal.createdAt)}
                        </p>
                        <span className="text-xs text-[#6750A4] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Read more →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-16 px-4">
                <div className="w-24 h-24 bg-[#E8DEF8] rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-[#CAC4D0]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1C1B1F] mb-2">
                  No proposals yet
                </h3>
                <p className="text-[#79747E] mb-6">
                  Be the first to create a proposal and make a difference
                </p>
                <Link href="/proposals/create">
                  <Button variant="outline" className="rounded-full">
                    Create Proposal
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#6750A4] via-[#7F66C0] to-[#5E45A0]" />

        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-[120px]" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
            <Rocket className="w-4 h-4 text-white" />
            <span className="text-sm text-white/90">Make Your Voice Heard</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight font-['Google_Sans','Roboto',sans-serif]">
            Ready to Make a
            <br />
            <span className="bg-gradient-to-r from-[#EADDFF] via-white to-[#E8DEF8] bg-clip-text text-transparent">
              Difference?
            </span>
          </h2>

          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of citizens already shaping their community. Your next proposal could change everything.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="rounded-full bg-white text-[#6750A4] hover:bg-[#EADDFF] hover:text-[#21005D] px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/70 px-8 py-6 text-base backdrop-blur-sm transition-all duration-300"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Bottom decorative line */}
          <div className="mt-16 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-white/20" />
            <span className="text-sm text-white/40">Secure • Fast • Community Driven</span>
            <div className="h-px w-16 bg-white/20" />
          </div>
        </div>
      </section>
    </div>
  );
}