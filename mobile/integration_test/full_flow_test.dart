import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:cityhub_mobile/main.dart';
import 'test_helper.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await setupTestUser();
    await setupTestProposal();
  });

  tearDownAll(() async {
    await cleanupTestData();
  });

  group('Full User Flow', () {
    testWidgets('1. Auth: Login with registered user', (tester) async {
      await tester.pumpWidget(const CityHubApp());
      await tester.pumpAndSettle();

      await tester.tap(find.text('Sign in to participate'));
      await tester.pumpAndSettle();

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Email'),
        uniqueEmail,
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Password'),
        testPassword,
      );
      await tester.tap(find.text('Sign In'));
      await tester.pumpAndSettle();

      expect(find.text('Submit a Proposal'), findsOneWidget);
    });

    testWidgets('2. Browse: View proposals list', (tester) async {
      await tester.pumpWidget(const CityHubApp());
      await tester.pumpAndSettle();

      await tester.tap(find.text('See all'));
      await tester.pumpAndSettle();

      expect(find.text('Proposals'), findsOneWidget);
      expect(find.text('Search proposals...'), findsOneWidget);
    });

    testWidgets('3. Detail: View proposal detail page', (tester) async {
      await tester.pumpWidget(const CityHubApp());
      await tester.pumpAndSettle();

      await tester.tap(find.text('See all'));
      await tester.pumpAndSettle();

      await tester.pumpUntilVisible(find.text(testProposalTitle));
      await tester.tap(find.text(testProposalTitle));
      await tester.pumpAndSettle();

      expect(find.text(testProposalTitle), findsOneWidget);
      expect(find.textContaining('Open for Voting'), findsOneWidget);
      expect(find.text('Environment'), findsOneWidget);
    });

    testWidgets('4. Vote: Cast vote on proposal', (tester) async {
      await tester.pumpWidget(const CityHubApp());
      await tester.pumpAndSettle();

      await tester.tap(find.text('See all'));
      await tester.pumpAndSettle();

      await tester.pumpUntilVisible(find.text(testProposalTitle));
      await tester.tap(find.text(testProposalTitle));
      await tester.pumpAndSettle();

      final voteButton = find.text('Vote');
      if (voteButton.evaluate().isNotEmpty) {
        await tester.tap(voteButton);
        await tester.pumpAndSettle();

        expect(find.textContaining('Remove Vote'), findsOneWidget);
      }
    });

    testWidgets('5. Comment: Add comment to proposal', (tester) async {
      await tester.pumpWidget(const CityHubApp());
      await tester.pumpAndSettle();

      await tester.tap(find.text('See all'));
      await tester.pumpAndSettle();

      await tester.pumpUntilVisible(find.text(testProposalTitle));
      await tester.tap(find.text(testProposalTitle));
      await tester.pumpAndSettle();

      await tester.enterText(
        find.widgetWithText(TextField, 'Add a comment...'),
        'Great proposal! This would really help the community.',
      );
      await tester.tap(find.text('Post Comment'));
      await tester.pumpAndSettle();

      expect(
        find.text('Great proposal! This would really help the community.'),
        findsOneWidget,
      );
    });

    testWidgets('6. Admin: View dashboard', (tester) async {
      await tester.pumpWidget(const CityHubApp());
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.person_outlined));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Admin Dashboard'));
      await tester.pumpAndSettle();

      expect(find.text('Admin Dashboard'), findsOneWidget);
      expect(find.text('Status Overview'), findsOneWidget);
    });

    testWidgets('7. Admin: View users', (tester) async {
      await tester.pumpWidget(const CityHubApp());
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.person_outlined));
      await tester.pumpAndSettle();

      await tester.scrollUntilVisible(
        find.text('Manage Users'),
        100,
        scrollable: find.byType(Scrollable).last,
      );
      await tester.tap(find.text('Manage Users'));
      await tester.pumpAndSettle();

      expect(find.text('Users'), findsOneWidget);
    });

    testWidgets('8. Admin: View audit log', (tester) async {
      await tester.pumpWidget(const CityHubApp());
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.person_outlined));
      await tester.pumpAndSettle();

      await tester.scrollUntilVisible(
        find.text('Audit Log'),
        100,
        scrollable: find.byType(Scrollable).last,
      );
      await tester.tap(find.text('Audit Log'));
      await tester.pumpAndSettle();

      expect(find.text('Audit Log'), findsOneWidget);
      expect(find.text('All'), findsOneWidget);
    });

    testWidgets('9. Roadmap: View roadmap page', (tester) async {
      await tester.pumpWidget(const CityHubApp());
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.map_outlined));
      await tester.pumpAndSettle();

      expect(find.text('Roadmap'), findsOneWidget);
      expect(find.text('Planned'), findsOneWidget);
      expect(find.text('Implemented'), findsOneWidget);
    });

    testWidgets('10. Auth: Logout', (tester) async {
      await tester.pumpWidget(const CityHubApp());
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.person_outlined));
      await tester.pumpAndSettle();

      await tester.scrollUntilVisible(
        find.text('Sign Out'),
        100,
        scrollable: find.byType(Scrollable).last,
      );
      await tester.tap(find.text('Sign Out'));
      await tester.pumpAndSettle();

      expect(find.text('Sign in to participate'), findsOneWidget);
    });
  });
}
