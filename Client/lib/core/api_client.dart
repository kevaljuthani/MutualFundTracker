import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:9001';
    if (Platform.isAndroid) return 'http://10.0.2.2:9001';
    return 'http://localhost:9001';
  }

  final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiClient() : _dio = Dio(BaseOptions(baseUrl: baseUrl)) {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'auth_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) {
        // Handle global errors like 401 Unauthorized here
        return handler.next(e);
      },
    ));
  }

  Dio get client => _dio;
}
