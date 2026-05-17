import 'package:cityhub_mobile/core/models/user.dart';

abstract class IAuthRepository {
  Future<AuthResponse> login(String email, String password);
  Future<AuthResponse> register(String email, String password, {String? name});
  Future<User> getProfile();
  Future<void> logout();
  Future<bool> isAuthenticated();
  Future<String?> getToken();
}
