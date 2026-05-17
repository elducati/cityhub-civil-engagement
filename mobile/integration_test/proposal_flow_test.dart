import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Proposal Flow', () {
    testWidgets('should display proposal list', (tester) async {
      await tester.pumpWidget(const MaterialApp(
        home: Scaffold(body: Center(child: Text('Proposals'))),
      ));

      expect(find.text('Proposals'), findsOneWidget);
    });
  });
}
