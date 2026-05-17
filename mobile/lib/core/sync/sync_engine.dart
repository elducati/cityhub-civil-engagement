import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:drift/drift.dart';
import 'package:riverpod/riverpod.dart';
import 'package:cityhub_mobile/core/api/api_client.dart';
import 'package:cityhub_mobile/core/constants/app_constants.dart';
import 'package:cityhub_mobile/core/database/daos/pending_action_dao.dart';
import 'package:cityhub_mobile/core/database/app_database.dart';

enum SyncState { idle, syncing, error }

class SyncEngine {
  final PendingActionDao _pendingActionDao;
  final ApiClient _apiClient;
  final Connectivity _connectivity;

  SyncState _state = SyncState.idle;
  SyncState get state => _state;

  StreamSubscription? _connectivitySub;
  Timer? _syncTimer;

  final _onSyncStateChanged = <void Function(SyncState)>[];

  void addStateListener(void Function(SyncState) listener) =>
      _onSyncStateChanged.add(listener);

  SyncEngine({
    required PendingActionDao pendingActionDao,
    required ApiClient apiClient,
    Connectivity? connectivity,
  }) : _pendingActionDao = pendingActionDao,
       _apiClient = apiClient,
       _connectivity = connectivity ?? Connectivity();

  Future<void> initialize() async {
    _connectivitySub = _connectivity.onConnectivityChanged.listen((results) {
      if (results.any((r) => r != ConnectivityResult.none)) {
        syncPendingActions();
      }
    });

    _syncTimer = Timer.periodic(AppConstants.syncInterval, (_) {
      syncPendingActions();
    });
  }

  Future<void> enqueueAction({
    required String actionType,
    required String endpoint,
    required String method,
    String? body,
  }) async {
    await _pendingActionDao.addAction(
      PendingActionsTableCompanion(
        actionType: Value(actionType),
        endpoint: Value(endpoint),
        method: Value(method),
        body: Value(body ?? ''),
        createdAt: Value(DateTime.now()),
      ),
    );
  }

  Future<void> syncPendingActions() async {
    final pending = await _pendingActionDao.getAll();
    if (pending.isEmpty) return;

    _state = SyncState.syncing;
    _notifyListeners();

    for (final action in pending) {
      try {
        await _executeAction(action);
        await _pendingActionDao.deleteAction(action.id);
      } catch (e) {
        await _pendingActionDao.incrementRetry(action.id);
        if (action.retryCount >= AppConstants.maxRetries - 1) {
          await _pendingActionDao.deleteAction(action.id);
        }
      }
    }

    _state = SyncState.idle;
    _notifyListeners();
  }

  Future<void> _executeAction(PendingActionsTableData action) async {
    final method = action.method.toUpperCase();
    final body = action.body.isNotEmpty ? action.body : null;

    try {
      switch (method) {
        case 'POST':
          await _apiClient.post(action.endpoint, data: body);
        case 'PUT':
          await _apiClient.put(action.endpoint, data: body);
        case 'DELETE':
          await _apiClient.delete(action.endpoint);
        default:
          await _apiClient.post(action.endpoint, data: body);
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 409 || e.response?.statusCode == 404) {
        return;
      }
      rethrow;
    }
  }

  void _notifyListeners() {
    for (final listener in _onSyncStateChanged) {
      listener(_state);
    }
  }

  Future<int> pendingCount() => _pendingActionDao.count();

  void dispose() {
    _connectivitySub?.cancel();
    _syncTimer?.cancel();
    _onSyncStateChanged.clear();
  }
}

final syncEngineProvider = Provider<SyncEngine>((ref) {
  final pendingDao = ref.watch(pendingActionDaoProvider);
  final apiClient = ref.watch(apiClientProvider);
  return SyncEngine(pendingActionDao: pendingDao, apiClient: apiClient);
});
