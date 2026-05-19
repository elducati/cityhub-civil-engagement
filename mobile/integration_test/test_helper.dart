import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:cityhub_mobile/core/api/api_client.dart';
import 'package:cityhub_mobile/core/models/proposal.dart';
import 'package:cityhub_mobile/core/models/comment.dart';
import 'package:cityhub_mobile/core/repositories/i_proposal_repository.dart';
import 'package:cityhub_mobile/core/repositories/proposal_repository.dart';
import 'package:cityhub_mobile/core/repositories/i_comment_repository.dart';
import 'package:cityhub_mobile/core/repositories/comment_repository.dart';
import 'package:cityhub_mobile/core/constants/app_constants.dart';
import 'package:cityhub_mobile/main.dart';

const String testBaseUrl = String.fromEnvironment(
  'TEST_API_URL',
  defaultValue: 'http://10.0.2.2:3000',
);

Future<Map<String, dynamic>> apiPost(
  String path,
  Map<String, dynamic> body, {
  String? token,
}) async {
  final client = HttpClient();
  client.connectionTimeout = const Duration(seconds: 10);
  try {
    final uri = Uri.parse('$testBaseUrl$path');
    final request = await client.postUrl(uri);
    request.headers.set('Content-Type', 'application/json');
    if (token != null) {
      request.headers.set('Authorization', 'Bearer $token');
    }
    request.add(utf8.encode(jsonEncode(body)));
    final response = await request.close();
    final content = await response.transform(utf8.decoder).join();
    return jsonDecode(content) as Map<String, dynamic>;
  } finally {
    client.close();
  }
}

Future<Map<String, dynamic>> apiGet(String path, {String? token}) async {
  final client = HttpClient();
  client.connectionTimeout = const Duration(seconds: 10);
  try {
    final uri = Uri.parse('$testBaseUrl$path');
    final request = await client.getUrl(uri);
    if (token != null) {
      request.headers.set('Authorization', 'Bearer $token');
    }
    final response = await request.close();
    final content = await response.transform(utf8.decoder).join();
    return jsonDecode(content) as Map<String, dynamic>;
  } finally {
    client.close();
  }
}

Future<Map<String, dynamic>> apiDelete(String path, {String? token}) async {
  final client = HttpClient();
  client.connectionTimeout = const Duration(seconds: 10);
  try {
    final uri = Uri.parse('$testBaseUrl$path');
    final request = await client.deleteUrl(uri);
    if (token != null) {
      request.headers.set('Authorization', 'Bearer $token');
    }
    final response = await request.close();
    final content = await response.transform(utf8.decoder).join();
    return jsonDecode(content) as Map<String, dynamic>;
  } finally {
    client.close();
  }
}

const String adminEmail = 'admin@e2e.test.com';
const String testPassword = 'TestPass123!';
const String testProposalTitle =
    'E2E Test: Community Garden Initiative';
const String testProposalDescription =
    'A comprehensive proposal to create community gardens in urban areas to promote local food production and green spaces.';

String authToken = '';
String userId = '';
String proposalId = '';

Future<void> setupTestUser() async {
  final response = await apiPost('/api/auth/login', {
    'email': adminEmail,
    'password': testPassword,
  });
  final data = response['data'] as Map<String, dynamic>? ?? response;
  authToken = data['token'] as String;
  userId = data['id'] as String;
}

Future<void> setupTestProposal() async {
  final response = await apiPost('/api/proposals', {
    'title': testProposalTitle,
    'description': testProposalDescription,
    'category': 'Environment',
  }, token: authToken);
  final data = response['data'] as Map<String, dynamic>? ?? response;
  proposalId = data['id'] as String;
}

Future<void> cleanupTestData() async {
  try {
    if (proposalId.isNotEmpty) {
      await apiDelete('/api/proposals/$proposalId', token: authToken);
    }
  } catch (_) {}
}

/// A proposal repository that uses dart:io HttpClient (via apiGet/apiPost)
/// instead of Dio, to avoid the second-request hang on Windows test runner.
class TestProposalRepository implements IProposalRepository {
  @override
  Future<PaginatedResponse> list({
    int page = 1,
    int limit = 20,
    String? status,
    String? category,
    String? sort,
    String? search,
  }) async {
    final params = <String, String>{'page': page.toString(), 'limit': limit.toString()};
    if (status != null) params['status'] = status;
    if (category != null) params['category'] = category;
    if (sort != null) params['sort'] = sort;
    if (search != null) params['search'] = search;
    final query = params.entries.map((e) => '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value)}').join('&');
    final response = await apiGet('/api/proposals?$query', token: authToken);
    final data = response['data'] as Map<String, dynamic>? ?? response;
    return PaginatedResponse.fromJson(data);
  }

  @override
  Future<Proposal> getById(String id) async {
    final response = await apiGet('/api/proposals/$id', token: authToken);
    final data = response['data'] as Map<String, dynamic>? ?? response;
    return Proposal.fromJson(data);
  }

  @override
  Future<Proposal> create(CreateProposalRequest request) async {
    final response = await apiPost('/api/proposals', request.toJson(), token: authToken);
    final data = response['data'] as Map<String, dynamic>? ?? response;
    return Proposal.fromJson(data);
  }

  @override
  Future<Proposal> update(String id, UpdateProposalRequest request) async {
    throw UnsupportedError('update not used in E2E test');
  }

  @override
  Future<void> delete(String id) async {
    await apiDelete('/api/proposals/$id', token: authToken);
  }

  @override
  Future<VoteResponse> castVote(String id) async {
    final response = await apiPost('/api/proposals/$id/vote', {}, token: authToken);
    final data = response['data'] as Map<String, dynamic>? ?? response;
    return VoteResponse.fromJson(data);
  }

  @override
  Future<VoteResponse> removeVote(String id) async {
    final response = await apiDelete('/api/proposals/$id/vote', token: authToken);
    final data = response['data'] as Map<String, dynamic>? ?? response;
    return VoteResponse.fromJson(data);
  }

  @override
  Future<StatsResponse> getStats() async {
    final response = await apiGet('/api/stats', token: authToken);
    final data = response['data'] as Map<String, dynamic>? ?? response;
    return StatsResponse.fromJson(data);
  }

  @override
  Future<List<Proposal>> getTrending() async {
    final response = await apiGet('/api/proposals/trending', token: authToken);
    final data = response['data'] as Map<String, dynamic>? ?? response;
    final items = data['data'] as List<dynamic>;
    return items.map((e) => Proposal.fromJson(e as Map<String, dynamic>)).toList();
  }
}

final testProposalRepositoryProvider = Provider<IProposalRepository>((ref) => TestProposalRepository());

/// A comment repository that uses dart:io HttpClient (via apiGet/apiPost)
/// instead of Dio, to match the proposal repository override.
class TestCommentRepository implements ICommentRepository {
  @override
  Future<List<Comment>> getByProposalId(String proposalId) async {
    final response = await apiGet('/api/proposals/$proposalId/comments', token: authToken);
    final raw = response['data'];
    final data = raw is List<dynamic> ? raw : <dynamic>[];
    return data.map((e) => Comment.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<Comment> create(String proposalId, String body, {String? parentId}) async {
    final payload = <String, dynamic>{'body': body};
    if (parentId != null) payload['parent_id'] = parentId;
    final response = await apiPost('/api/proposals/$proposalId/comments', payload, token: authToken);
    final data = response['data'] as Map<String, dynamic>? ?? response;
    return Comment.fromJson(data);
  }
}

final testCommentRepositoryProvider = Provider<ICommentRepository>((ref) => TestCommentRepository());

/// An ApiClient that creates a fresh Dio for each request to avoid
/// connection pooling issues on Windows test runner.
class TestApiClient extends ApiClient {
  TestApiClient() : super();

  @override
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) {
    final dio = _createFreshDio();
    return dio.get<T>(path, queryParameters: queryParameters);
  }

  @override
  Future<Response<T>> post<T>(String path, {dynamic data}) {
    final dio = _createFreshDio();
    return dio.post<T>(path, data: data);
  }

  @override
  Future<Response<T>> put<T>(String path, {dynamic data}) {
    final dio = _createFreshDio();
    return dio.put<T>(path, data: data);
  }

  @override
  Future<Response<T>> delete<T>(String path) {
    final dio = _createFreshDio();
    return dio.delete<T>(path);
  }

  Dio _createFreshDio() {
    final dio = Dio(BaseOptions(
      baseUrl: AppConstants.apiBaseUrl,
      connectTimeout: AppConstants.requestTimeout,
      receiveTimeout: AppConstants.requestTimeout,
      headers: {'Content-Type': 'application/json'},
    ));
    return dio;
  }
}

final testApiClientProvider = Provider<ApiClient>((ref) => TestApiClient());

/// Creates a ProviderScope with test overrides.
ProviderScope createTestApp() => ProviderScope(
  overrides: [
    apiClientProvider.overrideWithProvider(testApiClientProvider),
  ],
  child: const CityHubApp(),
);

extension PumpUntilVisible on WidgetTester {
  Future<void> pumpUntilVisible(
    Finder finder, {
    Duration timeout = const Duration(seconds: 15),
  }) async {
    final end = DateTime.now().add(timeout);
    while (DateTime.now().isBefore(end)) {
      await pump(const Duration(milliseconds: 500));
      if (finder.evaluate().isNotEmpty) return;
    }
  }
}
