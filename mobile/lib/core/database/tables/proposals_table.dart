import 'package:drift/drift.dart';

class ProposalsTable extends Table {
  TextColumn get id => text()();
  TextColumn get title => text()();
  TextColumn get description => text()();
  TextColumn get authorId => text()();
  TextColumn get status => text()();
  IntColumn get voteCount => integer()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn? get updatedAt => dateTime().nullable()();
  TextColumn? get category => text().nullable()();
  RealColumn? get latitude => real().nullable()();
  RealColumn? get longitude => real().nullable()();
  TextColumn? get rejectionReason => text().nullable()();
  BoolColumn get synced => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}
