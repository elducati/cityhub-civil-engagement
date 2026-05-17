import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';
import 'package:cityhub_mobile/core/api/api_client.dart';
import 'package:cityhub_mobile/core/repositories/auth_repository.dart';

class MockApiClient extends Mock implements ApiClient {}

void main() {
  late AuthRepository repository;
  late MockApiClient mockClient;

  setUp(() {
    mockClient = MockApiClient();
    repository = AuthRepository(mockClient);
  });

  group('login', () {
    test('should return AuthResponse on successful login', () async {
      final responseData = {
        'data': {
          'token': 'test-token',
          'user': {
            'id': '1',
            'email': 'test@test.com',
            'role': 'USER',
          },
        },
      };

      when(() => mockClient.post(
        any(),
        data: any(named: 'data'),
      )).thenAnswer((_) async => Response(
        data: responseData,
        statusCode: 200,
        requestOptions: RequestOptions(path: ''),
      ));

      when(() => mockClient.setToken(any())).thenAnswer((_) async {});

      final result = await repository.login('test@test.com', 'password');

      expect(result.token, 'test-token');
      expect(result.user.email, 'test@test.com');
    });
  });

  group('register', () {
    test('should return AuthResponse on successful registration', () async {
      final responseData = {
        'data': {
          'token': 'test-token',
          'user': {
            'id': '1',
            'email': 'test@test.com',
            'role': 'USER',
          },
        },
      };

      when(() => mockClient.post(
        any(),
        data: any(named: 'data'),
      )).thenAnswer((_) async => Response(
        data: responseData,
        statusCode: 201,
        requestOptions: RequestOptions(path: ''),
      ));

      when(() => mockClient.setToken(any())).thenAnswer((_) async {});

      final result = await repository.register('test@test.com', 'password', name: 'Test');

      expect(result.token, 'test-token');
      expect(result.user.email, 'test@test.com');
    });
  });

  group('isAuthenticated', () {
    test('should return true when token exists', () async {
      when(() => mockClient.getToken()).thenAnswer((_) async => 'token');

      final result = await repository.isAuthenticated();

      expect(result, true);
    });

    test('should return false when no token', () async {
      when(() => mockClient.getToken()).thenAnswer((_) async => null);

      final result = await repository.isAuthenticated();

      expect(result, false);
    });
  });
}
