import 'package:cityhub_mobile/core/api/api_client.dart';
import 'package:cityhub_mobile/core/api/api_endpoints.dart';
import 'package:cityhub_mobile/core/models/audit_log.dart';
import 'package:cityhub_mobile/core/models/user.dart';
import 'package:cityhub_mobile/core/repositories/i_admin_repository.dart';
import 'package:riverpod/riverpod.dart';

class AdminRepository implements IAdminRepository {
  final ApiClient _client;

  AdminRepository(this._client);

  @override
  Future<List<User>> getUsers({int page = 1, int limit = 20}) async {
    final response = await _client.get(
      ApiEndpoints.adminUsers,
      queryParameters: {'page': page, 'limit': limit},
    );
    final data = response.data as Map<String, dynamic>;
    final unwrapped = data['data'] as Map<String, dynamic>? ?? data;
    final list = unwrapped['data'] as List<dynamic>? ?? unwrapped as List<dynamic>;
    return list.map((e) => User.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<Map<String, dynamic>> getStatusOverview() async {
    final response = await _client.get(ApiEndpoints.adminAnalytics);
    final data = response.data as Map<String, dynamic>;
    return (data['data'] as Map<String, dynamic>?) ?? data;
  }

  @override
  Future<Map<String, dynamic>> getTrend(String period) async {
    final response = await _client.get(
      ApiEndpoints.adminAnalyticsTrend,
      queryParameters: {'period': period},
    );
    final data = response.data as Map<String, dynamic>;
    return (data['data'] as Map<String, dynamic>?) ?? data;
  }

  @override
  Future<Map<String, dynamic>> getCategoryDistribution() async {
    final response = await _client.get(ApiEndpoints.adminAnalyticsCategories);
    final data = response.data as Map<String, dynamic>;
    return (data['data'] as Map<String, dynamic>?) ?? data;
  }

  @override
  Future<List<AuditLog>> getAuditLogs({
    int page = 1,
    int limit = 50,
    String? action,
  }) async {
    final params = <String, dynamic>{'page': page, 'limit': limit};
    if (action != null) params['action'] = action;

    final response = await _client.get(
      ApiEndpoints.adminAuditLogs,
      queryParameters: params,
    );
    final data = response.data as Map<String, dynamic>;
    final unwrapped = data['data'] as Map<String, dynamic>? ?? data;
    final list = unwrapped['data'] as List<dynamic>? ?? unwrapped as List<dynamic>;
    return list.map((e) => AuditLog.fromJson(e as Map<String, dynamic>)).toList();
  }
}

final adminRepositoryProvider = Provider<IAdminRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return AdminRepository(client);
});
