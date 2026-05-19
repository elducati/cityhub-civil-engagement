import 'package:cityhub_mobile/core/api/api_client.dart';
import 'package:cityhub_mobile/core/api/api_endpoints.dart';
import 'package:cityhub_mobile/core/models/user.dart';
import 'package:cityhub_mobile/core/repositories/i_auth_repository.dart';
import 'package:riverpod/riverpod.dart';

class AuthRepository implements IAuthRepository {
  final ApiClient _client;

  AuthRepository(this._client);

  Map<String, dynamic> _unwrap(dynamic responseData) {
    final data = responseData as Map<String, dynamic>;
    final unwrapped = data['data'] as Map<String, dynamic>? ?? data;
    return unwrapped;
  }

  Map<String, dynamic> _mapAuthResponse(Map<String, dynamic> unwrapped) {
    return {
      'token': unwrapped['token'],
      'user': {
        'id': unwrapped['id'],
        'email': unwrapped['email'],
        'role': unwrapped['role'],
      },
    };
  }

  @override
  Future<AuthResponse> login(String email, String password) async {
    final response = await _client.post(
      ApiEndpoints.login,
      data: LoginRequest(email: email, password: password).toJson(),
    );
    final unwrapped = _unwrap(response.data);
    final authResponse = AuthResponse.fromJson(_mapAuthResponse(unwrapped));
    await _client.setToken(authResponse.token);
    return authResponse;
  }

  @override
  Future<AuthResponse> register(String email, String password, {String? name}) async {
    final response = await _client.post(
      ApiEndpoints.register,
      data: RegisterRequest(email: email, password: password, name: name).toJson(),
    );
    final unwrapped = _unwrap(response.data);
    final authResponse = AuthResponse.fromJson(_mapAuthResponse(unwrapped));
    await _client.setToken(authResponse.token);
    return authResponse;
  }

  @override
  Future<User> getProfile() async {
    final response = await _client.get(ApiEndpoints.profile);
    final unwrapped = _unwrap(response.data);
    return User.fromJson(unwrapped);
  }

  @override
  Future<void> logout() async {
    await _client.clearToken();
  }

  @override
  Future<bool> isAuthenticated() async {
    final token = await _client.getToken();
    return token != null;
  }

  @override
  Future<String?> getToken() => _client.getToken();
}

final authRepositoryProvider = Provider<IAuthRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return AuthRepository(client);
});
