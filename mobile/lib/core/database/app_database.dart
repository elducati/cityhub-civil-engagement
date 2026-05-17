import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:riverpod/riverpod.dart';
import 'tables/proposals_table.dart';
import 'tables/comments_table.dart';
import 'tables/users_table.dart';
import 'tables/pending_actions_table.dart';

part 'app_database.g.dart';

@DriftDatabase(
  tables: [
    ProposalsTable,
    CommentsTable,
    UsersTable,
    PendingActionsTable,
  ],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  @override
  MigrationStrategy get migration => MigrationStrategy(
    onCreate: (Migrator m) async {
      await m.createAll();
    },
    onUpgrade: (Migrator m, int from, int to) async {},
  );

  static QueryExecutor _openConnection() {
    if (Platform.isAndroid) {
      return NativeDatabase.memory();
    }
    return LazyDatabase(() async {
      final dir = await getApplicationDocumentsDirectory();
      final file = File(p.join(dir.path, 'cityhub.db'));
      return NativeDatabase(file);
    });
  }

  Future<void> initialize() async {
    await customSelect('SELECT 1').get();
  }
}

final appDatabaseProvider = Provider<AppDatabase>((ref) {
  return AppDatabase();
});
