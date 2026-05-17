import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';

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

final String uniqueEmail =
    'e2e_${DateTime.now().millisecondsSinceEpoch}@test.com';
const String testPassword = 'TestPass123!';
const String testProposalTitle =
    'E2E Test: Community Garden Initiative';
const String testProposalDescription =
    'A comprehensive proposal to create community gardens in urban areas to promote local food production and green spaces.';

String authToken = '';
String userId = '';
String proposalId = '';

Future<void> setupTestUser() async {
  final response = await apiPost('/api/auth/register', {
    'email': uniqueEmail,
    'password': testPassword,
    'name': 'E2E Test User',
  });
  final data = response['data'] as Map<String, dynamic>? ?? response;
  authToken = data['token'] as String;
  final user = data['user'] as Map<String, dynamic>;
  userId = user['id'] as String;
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
