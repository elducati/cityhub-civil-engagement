class AppConstants {
  AppConstants._();

  static const String appName = 'CityHub';
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000',
  );
  static const String socketUrl = String.fromEnvironment(
    'SOCKET_URL',
    defaultValue: 'http://10.0.2.2:3001',
  );
  static const Duration requestTimeout = Duration(seconds: 30);
  static const int maxRetries = 3;
  static const Duration syncInterval = Duration(seconds: 30);
  static const Duration cacheStaleTime = Duration(minutes: 5);
  static const int defaultPageSize = 20;

  static const List<String> proposalStatuses = [
    'OPEN',
    'UNDER_REVIEW',
    'FEASIBILITY',
    'PLANNED',
    'IMPLEMENTED',
    'REJECTED',
  ];

  static const Map<String, String> proposalStatusLabels = {
    'OPEN': 'Open for Voting',
    'UNDER_REVIEW': 'Under Review',
    'FEASIBILITY': 'Feasibility',
    'PLANNED': 'Planned',
    'IMPLEMENTED': 'Implemented',
    'REJECTED': 'Rejected',
  };

  static const Map<String, int> proposalStatusColors = {
    'OPEN': 0xFF22C55E,
    'UNDER_REVIEW': 0xFFEAB308,
    'FEASIBILITY': 0xFFF97316,
    'PLANNED': 0xFF3B82F6,
    'IMPLEMENTED': 0xFF8B5CF6,
    'REJECTED': 0xFFEF4444,
  };

  static const List<String> categories = [
    'Infrastructure',
    'Environment',
    'Education',
    'Health',
    'Culture',
    'Safety',
    'Transportation',
    'Housing',
    'Economy',
    'Other',
  ];
}
