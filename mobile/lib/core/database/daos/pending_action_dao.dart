import 'package:drift/drift.dart';
import 'package:riverpod/riverpod.dart';
import 'package:cityhub_mobile/core/database/app_database.dart';

class PendingActionDao {
  final AppDatabase _db;
  PendingActionDao(this._db);

  Future<int> addAction(PendingActionsTableCompanion entry) =>
      _db.into(_db.pendingActionsTable).insert(entry);

  Future<List<PendingActionsTableData>> getAll() =>
      (_db.select(_db.pendingActionsTable)
        ..orderBy([(t) => OrderingTerm(expression: t.createdAt, mode: OrderingMode.asc)]))
      .get();

  Future<void> deleteAction(int id) =>
      (_db.delete(_db.pendingActionsTable)
        ..where((t) => t.id.equals(id)))
      .go();

  Future<void> incrementRetry(int id) async {
    final rows = await (_db.select(_db.pendingActionsTable)
      ..where((t) => t.id.equals(id)))
      .get();
    if (rows.isNotEmpty) {
      final action = rows.first;
      (_db.update(_db.pendingActionsTable)
        ..where((t) => t.id.equals(id)))
      .write(PendingActionsTableCompanion(
        retryCount: Value(action.retryCount + 1),
      ));
    }
  }

  Future<void> clearAll() => _db.delete(_db.pendingActionsTable).go();

  Future<int> count() async {
    final rows = await _db.select(_db.pendingActionsTable).get();
    return rows.length;
  }
}

final pendingActionDaoProvider = Provider<PendingActionDao>((ref) {
  final db = ref.watch(appDatabaseProvider);
  return PendingActionDao(db);
});
