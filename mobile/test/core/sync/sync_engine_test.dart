import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';
import 'package:drift/drift.dart';
import 'package:cityhub_mobile/core/api/api_client.dart';
import 'package:cityhub_mobile/core/database/daos/pending_action_dao.dart';
import 'package:cityhub_mobile/core/database/app_database.dart';
import 'package:cityhub_mobile/core/sync/sync_engine.dart';

class MockPendingActionDao extends Mock implements PendingActionDao {}
class MockApiClient extends Mock implements ApiClient {}

void main() {
  late SyncEngine syncEngine;
  late MockPendingActionDao mockDao;
  late MockApiClient mockApiClient;

  setUpAll(() {
    registerFallbackValue(PendingActionsTableCompanion(
      actionType: const Value(''),
      endpoint: const Value(''),
      method: const Value(''),
      body: const Value(''),
      createdAt: Value(DateTime.now()),
    ));
  });

  setUp(() {
    mockDao = MockPendingActionDao();
    mockApiClient = MockApiClient();
    syncEngine = SyncEngine(
      pendingActionDao: mockDao,
      apiClient: mockApiClient,
    );
  });

  group('enqueueAction', () {
    test('should add pending action to dao', () async {
      when(() => mockDao.addAction(any())).thenAnswer((_) async => 1);

      await syncEngine.enqueueAction(
        actionType: 'vote',
        endpoint: '/api/proposals/1/vote',
        method: 'POST',
        body: '{}',
      );

      verify(() => mockDao.addAction(any())).called(1);
    });
  });

  group('syncPendingActions', () {
    test('should do nothing when no pending actions', () async {
      when(() => mockDao.getAll()).thenAnswer((_) async => []);

      await syncEngine.syncPendingActions();

      verify(() => mockDao.getAll()).called(1);
    });

    test('should execute and delete pending actions', () async {
      final pendingAction = PendingActionsTableData(
        id: 1,
        actionType: 'vote',
        endpoint: '/api/proposals/1/vote',
        method: 'POST',
        body: '{}',
        createdAt: DateTime.now(),
        retryCount: 0,
      );

      when(() => mockDao.getAll()).thenAnswer((_) async => [pendingAction]);
      when(() => mockApiClient.post(any(), data: any(named: 'data')))
          .thenAnswer((_) async => Response(
            data: {},
            statusCode: 200,
            requestOptions: RequestOptions(path: ''),
          ));
      when(() => mockDao.deleteAction(1)).thenAnswer((_) async {});

      await syncEngine.syncPendingActions();

      verify(() => mockDao.deleteAction(1)).called(1);
    });
  });
}
