import 'package:drift/drift.dart';
import 'package:riverpod/riverpod.dart';
import 'package:cityhub_mobile/core/database/app_database.dart';

class UserDao {
  final AppDatabase _db;
  UserDao(this._db);

  Future<void> upsertUser(UsersTableCompanion entry) =>
      _db.into(_db.usersTable).insertOnConflictUpdate(entry);

  Future<UsersTableData?> getById(String id) async {
    final rows = await (_db.select(_db.usersTable)
      ..where((t) => t.id.equals(id)))
      .get();
    return rows.isEmpty ? null : rows.first;
  }

  Future<List<UsersTableData>> getAll() =>
      _db.select(_db.usersTable).get();

  Future<void> markSynced(String id) =>
      (_db.update(_db.usersTable)
        ..where((t) => t.id.equals(id)))
      .write(const UsersTableCompanion(synced: Value(true)));
}

final userDaoProvider = Provider<UserDao>((ref) {
  final db = ref.watch(appDatabaseProvider);
  return UserDao(db);
});
