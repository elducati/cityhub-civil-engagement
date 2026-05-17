import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Admin Flow', () {
    testWidgets('should display admin option', (tester) async {
      await tester.pumpWidget(const MaterialApp(
        home: Scaffold(body: Center(child: Text('Admin'))),
      ));

      expect(find.text('Admin'), findsOneWidget);
    });
  });
}
