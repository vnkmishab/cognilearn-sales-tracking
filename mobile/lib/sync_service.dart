import 'package:dio/dio.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'database/database.dart';

class SyncService {
  final AppDatabase db;
  final Dio dio;
  
  SyncService({required this.db, required this.dio});

  Future<void> attemptSync() async {
    // 1. Check connectivity
    final connectivityResult = await (Connectivity().checkConnectivity());
    if (connectivityResult.contains(ConnectivityResult.none)) {
      print('No internet connection. Skipping sync.');
      return;
    }

    // 2. Fetch pending punches
    final pendingPunches = await db.getPendingPunches();
    if (pendingPunches.isEmpty) {
      print('No pending punches to sync.');
      return;
    }

    print('Attempting to sync ${pendingPunches.length} offline punches...');

    // 3. Format payload for NestJS backend
    final payload = {
      'punches': pendingPunches.map((p) => {
        'clientPunchId': p.clientPunchId,
        'employeeId': p.employeeId,
        'siteId': p.siteId,
        'punchType': p.punchType,
        'latitude': p.latitude,
        'longitude': p.longitude,
        'gpsAccuracy': p.gpsAccuracy,
      }).toList(),
    };

    try {
      // 4. Send to backend
      // Assuming baseUrl is configured in Dio instance: e.g. http://localhost:3000
      final response = await dio.post('/site-punches/sync', data: payload);
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        // 5. Mark as synced in local SQLite
        final syncedIds = pendingPunches.map((p) => p.clientPunchId).toList();
        await db.markAsSynced(syncedIds);
        print('Successfully synced ${syncedIds.length} punches!');
      }
    } catch (e) {
      // 6. Failed to sync, keep them as PENDING_SYNC for retry
      print('Failed to sync. Will retry on next network connection. Error: $e');
    }
  }
}
