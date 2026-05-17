import 'package:riverpod/riverpod.dart';
import 'package:cityhub_mobile/core/models/user.dart';
import 'package:cityhub_mobile/core/repositories/i_auth_repository.dart';
import 'package:cityhub_mobile/core/repositories/auth_repository.dart';

enum AuthState { unauthenticated, authenticating, authenticated, error }

class AuthNotifier extends StateNotifier<AuthState> {
  final IAuthRepository _repository;

  User? _currentUser;
  User? get currentUser => _currentUser;
  String? _error;
  String? get error => _error;

  AuthNotifier(this._repository) : super(AuthState.unauthenticated);

  Future<void> login(String email, String password) async {
    state = AuthState.authenticating;
    try {
      final response = await _repository.login(email, password);
      _currentUser = response.user;
      _error = null;
      state = AuthState.authenticated;
    } catch (e) {
      _error = e.toString();
      state = AuthState.error;
    }
  }

  Future<void> register(String email, String password, {String? name}) async {
    state = AuthState.authenticating;
    try {
      final response = await _repository.register(email, password, name: name);
      _currentUser = response.user;
      _error = null;
      state = AuthState.authenticated;
    } catch (e) {
      _error = e.toString();
      state = AuthState.error;
    }
  }

  Future<void> loadProfile() async {
    try {
      final user = await _repository.getProfile();
      _currentUser = user;
      _error = null;
      state = AuthState.authenticated;
    } catch (_) {
      state = AuthState.unauthenticated;
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    _currentUser = null;
    _error = null;
    state = AuthState.unauthenticated;
  }

  Future<bool> isAuthenticated() => _repository.isAuthenticated();

  void clearError() {
    _error = null;
    state = AuthState.unauthenticated;
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return AuthNotifier(repository);
});

final currentUserProvider = Provider<User?>((ref) {
  final notifier = ref.watch(authProvider.notifier);
  return notifier.currentUser;
});

final authErrorProvider = Provider<String?>((ref) {
  final notifier = ref.watch(authProvider.notifier);
  return notifier.error;
});
