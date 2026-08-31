import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  final Dio _dio;
  final FlutterSecureStorage _storage;

  // Use 10.0.2.2 for Android Emulator, or your local network IP for physical device
  static const String _baseUrl = 'http://10.0.2.2:3000'; 

  ApiClient() 
      : _dio = Dio(BaseOptions(baseUrl: _baseUrl)),
        _storage = const FlutterSecureStorage() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Auto-inject JWT token into every request if it exists
          final token = await _storage.read(key: 'jwt_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          // Handle global errors here (e.g. logout on 401)
          return handler.next(e);
        }
      ),
    );
  }

  // --- Auth Endpoints ---

  Future<bool> login(String username, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'username': username,
        'password': password,
      });
      
      final token = response.data['access_token'];
      if (token != null) {
        await _storage.write(key: 'jwt_token', value: token);
        return true;
      }
      return false;
    } catch (e) {
      print('Login failed: $e');
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
  }

  // --- Expense Endpoints ---

  Future<bool> submitExpense({
    required String vendor,
    required double amount,
    required String billImagePath,
    required String paymentProofPath
  }) async {
    try {
      FormData formData = FormData.fromMap({
        'vendor': vendor,
        'amount': amount,
        'bill': await MultipartFile.fromFile(billImagePath, filename: 'bill.jpg'),
        'paymentProof': await MultipartFile.fromFile(paymentProofPath, filename: 'proof.jpg'),
      });

      // Using a mocked expenses endpoint
      final response = await _dio.post('/expenses', data: formData);
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Expense submission failed: $e');
      return false;
    }
  }

  Dio get rawDio => _dio; // Expose base Dio for SyncService usage
}
