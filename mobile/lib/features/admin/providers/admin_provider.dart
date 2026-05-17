import 'package:riverpod/riverpod.dart';
import 'package:cityhub_mobile/core/models/audit_log.dart';
import 'package:cityhub_mobile/core/models/user.dart';
import 'package:cityhub_mobile/core/repositories/i_admin_repository.dart';
import 'package:cityhub_mobile/core/repositories/admin_repository.dart';

class AdminDashboardState {
  final Map<String, dynamic>? statusOverview;
  final Map<String, dynamic>? trend;
  final Map<String, dynamic>? categoryDistribution;
  final bool isLoading;
  final String? error;

  const AdminDashboardState({
    this.statusOverview,
    this.trend,
    this.categoryDistribution,
    this.isLoading = false,
    this.error,
  });

  AdminDashboardState copyWith({
    Map<String, dynamic>? statusOverview,
    Map<String, dynamic>? trend,
    Map<String, dynamic>? categoryDistribution,
    bool? isLoading,
    String? error,
  }) {
    return AdminDashboardState(
      statusOverview: statusOverview ?? this.statusOverview,
      trend: trend ?? this.trend,
      categoryDistribution: categoryDistribution ?? this.categoryDistribution,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class AdminDashboardNotifier extends StateNotifier<AdminDashboardState> {
  final IAdminRepository _repository;

  AdminDashboardNotifier(this._repository) : super(const AdminDashboardState());

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final results = await Future.wait([
        _repository.getStatusOverview(),
        _repository.getTrend('monthly'),
        _repository.getCategoryDistribution(),
      ]);

      state = AdminDashboardState(
        statusOverview: results[0],
        trend: results[1],
        categoryDistribution: results[2],
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

class AdminUsersState {
  final List<User> users;
  final bool isLoading;
  final String? error;

  const AdminUsersState({
    this.users = const [],
    this.isLoading = false,
    this.error,
  });

  AdminUsersState copyWith({List<User>? users, bool? isLoading, String? error}) {
    return AdminUsersState(
      users: users ?? this.users,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class AdminUsersNotifier extends StateNotifier<AdminUsersState> {
  final IAdminRepository _repository;

  AdminUsersNotifier(this._repository) : super(const AdminUsersState());

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final users = await _repository.getUsers(limit: 100);
      state = AdminUsersState(users: users);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

class AdminAuditState {
  final List<AuditLog> logs;
  final bool isLoading;
  final String? actionFilter;
  final String? error;

  const AdminAuditState({
    this.logs = const [],
    this.isLoading = false,
    this.actionFilter,
    this.error,
  });

  AdminAuditState copyWith({
    List<AuditLog>? logs,
    bool? isLoading,
    String? actionFilter,
    String? error,
  }) {
    return AdminAuditState(
      logs: logs ?? this.logs,
      isLoading: isLoading ?? this.isLoading,
      actionFilter: actionFilter ?? this.actionFilter,
      error: error ?? this.error,
    );
  }
}

class AdminAuditNotifier extends StateNotifier<AdminAuditState> {
  final IAdminRepository _repository;

  AdminAuditNotifier(this._repository) : super(const AdminAuditState());

  Future<void> load({String? action}) async {
    state = state.copyWith(isLoading: true, error: null, actionFilter: action);
    try {
      final logs = await _repository.getAuditLogs(
        limit: 100,
        action: action,
      );
      state = AdminAuditState(logs: logs, actionFilter: action);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final adminDashboardProvider =
    StateNotifierProvider<AdminDashboardNotifier, AdminDashboardState>((ref) {
  final repository = ref.watch(adminRepositoryProvider);
  return AdminDashboardNotifier(repository);
});

final adminUsersProvider =
    StateNotifierProvider<AdminUsersNotifier, AdminUsersState>((ref) {
  final repository = ref.watch(adminRepositoryProvider);
  return AdminUsersNotifier(repository);
});

final adminAuditProvider =
    StateNotifierProvider<AdminAuditNotifier, AdminAuditState>((ref) {
  final repository = ref.watch(adminRepositoryProvider);
  return AdminAuditNotifier(repository);
});
