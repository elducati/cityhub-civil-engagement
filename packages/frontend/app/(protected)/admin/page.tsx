'use client';

import { useAdminDashboard } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeDate } from '@/lib/utils';
import {
  Users,
  FileText,
  Vote,
  TrendingUp,
  Clock,
  Activity,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { BarChart, DonutChart, TrendChart } from '@/components/ui/charts';

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendLabel?: string;
  color: string;
}) {
  return (
    <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-on-surface-variant">{title}</p>
            <p className="text-3xl font-bold text-on-surface">{value}</p>
            {trend && trendLabel && (
              <div className="flex items-center gap-1 text-sm">
                {trend === 'up' ? (
                  <ArrowUp className="w-4 h-4 text-success" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-error" />
                )}
                <span className={trend === 'up' ? 'text-success' : 'text-error'}>{trendLabel}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error, refetch } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1 p-8 text-center">
          <Activity className="w-12 h-12 mx-auto text-error mb-4" />
          <h2 className="text-xl font-bold text-on-surface mb-2">Failed to load dashboard</h2>
          <p className="text-on-surface-variant mb-4">Unable to fetch admin statistics</p>
          <Button onClick={() => refetch()} className="rounded-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const proposalTrend = stats.thisMonthProposals > stats.lastMonthProposals ? 'up' : 'down';
  const proposalTrendLabel = `${stats.thisMonthProposals} this month (${stats.lastMonthProposals} last month)`;

  return (
    <div className="min-h-screen bg-surface-base p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Admin Dashboard</h1>
            <p className="text-on-surface-variant mt-1">Platform overview and engagement metrics</p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="bg-primary"
          />
          <StatCard
            title="Total Proposals"
            value={stats.totalProposals}
            icon={FileText}
            trend={proposalTrend}
            trendLabel={proposalTrendLabel}
            color="bg-secondary"
          />
          <StatCard
            title="Total Votes"
            value={stats.totalVotes}
            icon={Vote}
            color="bg-success"
          />
          <StatCard
            title="Engagement Rate"
            value={formatPercent(stats.engagementRate)}
            icon={TrendingUp}
            color="bg-warning"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-on-surface">Proposals by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={[
                  { label: 'Open', value: stats.proposalsByStatus.OPEN, color: 'bg-success' },
                  { label: 'Closed', value: stats.proposalsByStatus.CLOSED, color: 'bg-on-surface-variant' },
                  { label: 'Archived', value: stats.proposalsByStatus.ARCHIVED, color: 'bg-outline' },
                ]}
              />
            </CardContent>
          </Card>

          <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-on-surface">Users by Role</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <DonutChart
                data={[
                  { label: 'Users', value: stats.usersByRole.USER, color: 'bg-primary' },
                  { label: 'Moderators', value: stats.usersByRole.MODERATOR, color: 'bg-secondary' },
                  { label: 'Admins', value: stats.usersByRole.ADMIN, color: 'bg-warning' },
                ]}
              />
              <div className="flex gap-4 mt-4">
                {[
                  { label: 'Users', count: stats.usersByRole.USER, color: 'bg-primary' },
                  { label: 'Moderators', count: stats.usersByRole.MODERATOR, color: 'bg-secondary' },
                  { label: 'Admins', count: stats.usersByRole.ADMIN, color: 'bg-warning' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 text-sm">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-on-surface-variant">{item.label}</span>
                    <span className="font-semibold text-on-surface">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-on-surface flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Proposal Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <TrendChart current={stats.thisMonthProposals} previous={stats.lastMonthProposals} />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-surface-container rounded-3xl border-none shadow-elevation-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-on-surface flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-surface-base rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                        <Activity className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-on-surface">
                          {activity.action === 'CREATE' && `New ${activity.entityType} created`}
                          {activity.action === 'UPDATE' && `${activity.entityType} updated`}
                          {activity.action === 'DELETE' && `${activity.entityType} deleted`}
                          {activity.action === 'VOTE' && `Vote cast on ${activity.entityType}`}
                          {activity.action === 'UNVOTE' && `Vote removed from ${activity.entityType}`}
                          {activity.action === 'LOGIN' && 'User logged in'}
                          {!['CREATE', 'UPDATE', 'DELETE', 'VOTE', 'UNVOTE', 'LOGIN'].includes(activity.action) && activity.action}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {activity.entityType} · {formatRelativeDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.entityType}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-on-surface-variant py-8">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
