import 'package:cityhub_mobile/core/models/user.dart';
import 'package:cityhub_mobile/core/models/audit_log.dart';

abstract class IAdminRepository {
  Future<List<User>> getUsers({int page = 1, int limit = 20});
  Future<Map<String, dynamic>> getStatusOverview();
  Future<Map<String, dynamic>> getTrend(String period);
  Future<Map<String, dynamic>> getCategoryDistribution();
  Future<List<AuditLog>> getAuditLogs({
    int page = 1,
    int limit = 50,
    String? action,
  });
}
