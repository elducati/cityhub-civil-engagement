import 'package:drift/drift.dart';

class CommentsTable extends Table {
  TextColumn get id => text()();
  TextColumn get proposalId => text()();
  TextColumn? get parentId => text().nullable()();
  TextColumn get authorId => text()();
  TextColumn get authorEmail => text()();
  TextColumn get body => text()();
  DateTimeColumn get createdAt => dateTime()();
  BoolColumn get synced => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}
