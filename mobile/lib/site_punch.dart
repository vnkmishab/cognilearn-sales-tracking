import 'package:flutter/material.dart';
import 'package:drift/drift.dart' as drift;
import 'database/database.dart';

class SitePunchScreen extends StatefulWidget {
  const SitePunchScreen({super.key});

  @override
  State<SitePunchScreen> createState() => _SitePunchScreenState();
}

class _SitePunchScreenState extends State<SitePunchScreen> {
  bool _isOffline = true;
  bool _isInsideGeofence = true;
  String _selectedSite = 'Site A - Trivandrum Project';

  // Inject database (Normally via Provider/Riverpod, using singleton for phase 3 MVP demo)
  late AppDatabase _db;
  
  @override
  void initState() {
    super.initState();
    _db = AppDatabase();
  }

  void _handlePunch(String type) async {
    final clientPunchId = 'punch-${DateTime.now().millisecondsSinceEpoch}'; // Using timestamp for MVP uniqueness
    
    await _db.addPunch(SitePunchesCompanion.insert(
      clientPunchId: clientPunchId,
      employeeId: 'emp-1', // Mocked user session
      siteId: _selectedSite,
      punchType: type,
      latitude: const drift.Value(8.5241),
      longitude: const drift.Value(76.9366),
      gpsAccuracy: const drift.Value(10.5),
    ));

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Punch $type saved locally!'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Site Punch')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Network Status Indicator
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _isOffline ? Colors.orange.shade100 : Colors.green.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(
                    _isOffline ? Icons.wifi_off : Icons.wifi,
                    color: _isOffline ? Colors.orange.shade800 : Colors.green.shade800,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    _isOffline ? 'OFFLINE - Punches will be saved locally' : 'ONLINE',
                    style: TextStyle(
                      color: _isOffline ? Colors.orange.shade800 : Colors.green.shade800,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Site Selection
            DropdownButtonFormField<String>(
              value: _selectedSite,
              decoration: const InputDecoration(
                labelText: 'Assigned Site',
                border: OutlineInputBorder(),
              ),
              items: ['Site A - Trivandrum Project', 'Site B - Kochi Project']
                  .map((site) => DropdownMenuItem(value: site, child: Text(site)))
                  .toList(),
              onChanged: (val) {
                if (val != null) setState(() => _selectedSite = val);
              },
            ),
            const SizedBox(height: 24),

            // Geofence Indicator
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  _isInsideGeofence ? Icons.location_on : Icons.location_off,
                  color: _isInsideGeofence ? Colors.green : Colors.red,
                ),
                const SizedBox(width: 8),
                Text(
                  _isInsideGeofence ? 'INSIDE SITE RADIUS' : 'OUTSIDE SITE',
                  style: TextStyle(
                    color: _isInsideGeofence ? Colors.green : Colors.red,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 48),

            // Punch Buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
                    textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  onPressed: _isInsideGeofence ? () => _handlePunch('IN') : null,
                  child: const Text('PUNCH IN'),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
                    textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  onPressed: _isInsideGeofence ? () => _handlePunch('OUT') : null,
                  child: const Text('PUNCH OUT'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
