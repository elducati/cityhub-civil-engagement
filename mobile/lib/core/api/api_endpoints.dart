class ApiEndpoints {
  ApiEndpoints._();

  static const String login = '/api/auth/login';
  static const String register = '/api/auth/register';
  static const String profile = '/api/auth/me';

  static const String proposals = '/api/proposals';
  static String proposalDetail(String id) => '/api/proposals/$id';
  static String proposalVote(String id) => '/api/proposals/$id/vote';
  static String proposalComments(String id) => '/api/proposals/$id/comments';
  static const String proposalsExport = '/api/proposals/export/csv';
  static const String proposalsTrending = '/api/proposals/trending';

  static const String stats = '/api/stats';

  static const String adminUsers = '/api/admin/users';
  static const String adminAuditLogs = '/api/admin/audit-logs';
  static const String adminAnalytics = '/api/analytics/status-overview';
  static const String adminAnalyticsTrend = '/api/analytics/trend';
  static const String adminAnalyticsCategories = '/api/analytics/category-distribution';
}
