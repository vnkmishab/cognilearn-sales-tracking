import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

part 'database.g.dart'; // Drift generated code

// Definition of the SitePunches table
class SitePunches extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get clientPunchId => text().unique()();
  TextColumn get employeeId => text()();
  TextColumn get siteId => text()();
  TextColumn get punchType => text()(); // 'IN' or 'OUT'
  RealColumn get latitude => real().nullable()();
  RealColumn get longitude => real().nullable()();
  RealColumn get gpsAccuracy => real().nullable()();
  TextColumn get syncStatus => text().withDefault(const Constant('PENDING_SYNC'))();
  DateTimeColumn get localCreatedAt => dateTime().withDefault(currentDateAndTime)();
}

@DriftDatabase(tables: [SitePunches])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  // Insert a new offline punch
  Future<int> addPunch(SitePunchesCompanion entry) {
    return into(sitePunches).insert(entry);
  }

  // Get all pending punches to sync
  Future<List<SitePunch>> getPendingPunches() {
    return (select(sitePunches)..where((t) => t.syncStatus.equals('PENDING_SYNC'))).get();
  }

  // Mark punches as synced
  Future<void> markAsSynced(List<String> clientPunchIds) async {
    await (update(sitePunches)..where((t) => t.clientPunchId.isIn(clientPunchIds)))
        .write(const SitePunchesCompanion(syncStatus: Value('SYNCED')));
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'fieldops.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}
