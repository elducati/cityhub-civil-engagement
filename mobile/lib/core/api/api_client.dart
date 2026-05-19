import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:riverpod/riverpod.dart';
import 'package:cityhub_mobile/core/constants/app_constants.dart';

class ApiClient {
  late final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  static const String _tokenKey = 'auth_token';

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.apiBaseUrl,
      connectTimeout: AppConstants.requestTimeout,
      receiveTimeout: AppConstants.requestTimeout,
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.add(AuthInterceptor(_storage));
  }

  Future<String?> getToken() => _storage.read(key: _tokenKey);
  Future<void> setToken(String token) => _storage.write(key: _tokenKey, value: token);
  Future<void> clearToken() => _storage.delete(key: _tokenKey);

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) =>
      _dio.get<T>(path, queryParameters: queryParameters);

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
  }) =>
      _dio.post<T>(path, data: data);

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
  }) =>
      _dio.put<T>(path, data: data);

  Future<Response<T>> delete<T>(String path) => _dio.delete<T>(path);
}

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});

class AuthInterceptor extends Interceptor {
  final FlutterSecureStorage _storage;

  AuthInterceptor(this._storage);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    } catch (_) {
      // Storage unavailable (e.g. test environment) — proceed without auth
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      await _storage.delete(key: 'auth_token');
    }
    handler.next(err);
  }
}


