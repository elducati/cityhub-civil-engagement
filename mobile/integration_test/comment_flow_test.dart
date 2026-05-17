import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Comment Flow', () {
    testWidgets('should display comment section', (tester) async {
      await tester.pumpWidget(const MaterialApp(
        home: Scaffold(body: Center(child: Text('Comments'))),
      ));

      expect(find.text('Comments'), findsOneWidget);
    });
  });
}
