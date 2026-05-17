import 'package:drift/drift.dart';
import 'package:riverpod/riverpod.dart';
import 'package:cityhub_mobile/core/database/app_database.dart';

class ProposalDao {
  final AppDatabase _db;
  ProposalDao(this._db);

  Future<void> upsertProposal(ProposalsTableCompanion entry) =>
      _db.into(_db.proposalsTable).insertOnConflictUpdate(entry);

  Future<void> upsertProposals(List<ProposalsTableCompanion> entries) async {
    await _db.batch((batch) {
      for (final entry in entries) {
        batch.insert(_db.proposalsTable, entry, mode: InsertMode.insertOrReplace);
      }
    });
  }

  Future<ProposalsTableData?> getById(String id) async {
    final rows = await (_db.select(_db.proposalsTable)
      ..where((t) => t.id.equals(id)))
      .get();
    return rows.isEmpty ? null : rows.first;
  }

  Future<List<ProposalsTableData>> getAll({String? status}) {
    final query = _db.select(_db.proposalsTable)
      ..orderBy([(t) => OrderingTerm(expression: t.createdAt, mode: OrderingMode.desc)]);
    if (status != null) {
      query.where((t) => t.status.equals(status));
    }
    return query.get();
  }

  Future<List<ProposalsTableData>> getByStatus(String status) =>
      (_db.select(_db.proposalsTable)
        ..where((t) => t.status.equals(status)))
      .get();

  Future<void> markSynced(String id) =>
      (_db.update(_db.proposalsTable)
        ..where((t) => t.id.equals(id)))
      .write(const ProposalsTableCompanion(synced: Value(true)));

  Future<void> deleteById(String id) =>
      (_db.delete(_db.proposalsTable)
        ..where((t) => t.id.equals(id)))
      .go();

  Future<void> clearAll() => _db.delete(_db.proposalsTable).go();
}

final proposalDaoProvider = Provider<ProposalDao>((ref) {
  final db = ref.watch(appDatabaseProvider);
  return ProposalDao(db);
});
