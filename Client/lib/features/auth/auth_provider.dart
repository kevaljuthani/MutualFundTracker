import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/api_client.dart';

class AuthProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  bool _isAuthenticated = false;
  bool get isAuthenticated => _isAuthenticated;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _currentUser;
  String? get currentUser => _currentUser;

  Future<void> checkAuth() async {
    final token = await _storage.read(key: 'auth_token');
    if (token != null) {
      // Ideally verify token with /auth/me endpoint
      try {
        final res = await _apiClient.client.get('/auth/me');
        _currentUser = res.data['user']['name'];
        _isAuthenticated = true;
      } catch (e) {
        // Token invalid
        await logout();
      }
    }
    notifyListeners();
  }

  Future<String?> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiClient.client.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      final token = response.data['token'];
      final user = response.data['user'];

      await _storage.write(key: 'auth_token', value: token);
      _isAuthenticated = true;
      _currentUser = user['name'];

      return null; // No error
    } on DioException catch (e) {
      final errorMessage = e.response?.data['error'] ?? 'Login failed';

      return errorMessage;
    } catch (e) {
      return 'An unexpected error occurred';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<String?> signup(String name, String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiClient.client.post('/auth/signup', data: {
        'name': name,
        'email': email,
        'password': password,
      });
      final token = response.data['token'];
      final user = response.data['user'];

      await _storage.write(key: 'auth_token', value: token);
      _isAuthenticated = true;
      _currentUser = user['name'];
      return null;
    } on DioException catch (e) {
      return e.response?.data['error'] ?? 'Signup failed';
    } catch (e) {
      return 'An unexpected error occurred';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'auth_token');
    _isAuthenticated = false;
    _currentUser = null;
    notifyListeners();
  }
}
