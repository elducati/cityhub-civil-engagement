import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:dio/dio.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Dio debug: test direct API call', (tester) async {
    final dio = Dio(BaseOptions(
      baseUrl: 'http://localhost:3100',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));

    // Test list API
    try {
      final listResponse = await dio.get('/api/proposals');
      final listData = listResponse.data as Map<String, dynamic>;
      print('LIST API SUCCESS: ${listData.keys}');
    } catch (e) {
      print('LIST API FAILED: $e');
    }

    // Test detail API with known proposal ID
    try {
      final detailResponse = await dio.get('/api/proposals/692b8d05-bec6-4870-bd3d-b4337470828f');
      final detailData = detailResponse.data as Map<String, dynamic>;
      print('DETAIL API SUCCESS: ${detailData.keys}');
    } catch (e) {
      print('DETAIL API FAILED: $e');
    }

    // Test sequential calls
    for (int i = 0; i < 5; i++) {
      try {
        final response = await dio.get('/api/proposals');
        print('SEQUENTIAL $i SUCCESS');
      } catch (e) {
        print('SEQUENTIAL $i FAILED: $e');
      }
    }

    expect(true, isTrue);
  });
}
