import 'package:drift/drift.dart';
import 'package:riverpod/riverpod.dart';
import 'package:cityhub_mobile/core/database/app_database.dart';

class CommentDao {
  final AppDatabase _db;
  CommentDao(this._db);

  Future<void> upsertComment(CommentsTableCompanion entry) =>
      _db.into(_db.commentsTable).insertOnConflictUpdate(entry);

  Future<void> upsertComments(List<CommentsTableCompanion> entries) async {
    await _db.batch((batch) {
      for (final entry in entries) {
        batch.insert(_db.commentsTable, entry, mode: InsertMode.insertOrReplace);
      }
    });
  }

  Future<List<CommentsTableData>> getByProposalId(String proposalId) =>
      (_db.select(_db.commentsTable)
        ..where((t) => t.proposalId.equals(proposalId))
        ..orderBy([(t) => OrderingTerm(expression: t.createdAt, mode: OrderingMode.asc)]))
      .get();

  Future<void> markSynced(String id) =>
      (_db.update(_db.commentsTable)
        ..where((t) => t.id.equals(id)))
      .write(const CommentsTableCompanion(synced: Value(true)));

  Future<void> clearByProposalId(String proposalId) =>
      (_db.delete(_db.commentsTable)
        ..where((t) => t.proposalId.equals(proposalId)))
      .go();
}

final commentDaoProvider = Provider<CommentDao>((ref) {
  final db = ref.watch(appDatabaseProvider);
  return CommentDao(db);
});
