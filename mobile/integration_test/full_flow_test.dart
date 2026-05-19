import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'test_helper.dart';

Future<void> login(WidgetTester tester) async {
  final signInButton = find.text('Sign in to participate');
  await tester.ensureVisible(signInButton);
  await tester.pumpAndSettle();
  await tester.tap(signInButton);
  await tester.pumpAndSettle();

  final emailField = find.widgetWithText(TextFormField, 'Email');
  await tester.ensureVisible(emailField);
  await tester.pumpAndSettle();
  await tester.enterText(emailField, adminEmail);
  await tester.pump();

  final passwordField = find.widgetWithText(TextFormField, 'Password');
  await tester.ensureVisible(passwordField);
  await tester.pumpAndSettle();
  await tester.enterText(passwordField, testPassword);
  await tester.pump();

  final signInButton2 = find.text('Sign In');
  await tester.ensureVisible(signInButton2);
  await tester.pumpAndSettle();
  await tester.tap(signInButton2);
  await tester.pumpAndSettle();
}



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
    testWidgets('1. Auth: Login as admin user', (tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle();

      await login(tester);

      expect(find.text('Submit a Proposal'), findsOneWidget);
    });

    testWidgets('2. Browse: View proposals list', (tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle();

      await tester.tap(find.text('See all'));
      await tester.pumpAndSettle();

      expect(find.text('Proposals'), findsOneWidget);
      expect(find.text('Search proposals...'), findsOneWidget);
    });

    testWidgets('3. Detail: View proposal detail page', (tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle();

      // Navigate to proposals list
      await tester.tap(find.text('See all'));

      // Wait for list data with real async
      bool found = false;
      for (int i = 0; i < 60; i++) {
        await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 500)));
        await tester.pump();
        if (find.text(testProposalTitle).evaluate().isNotEmpty) {
          found = true;
          break;
        }
      }
      expect(found, isTrue, reason: 'Proposal not found on list page');

      // Tap proposal to navigate to detail
      await tester.tap(find.text(testProposalTitle).last);
      await tester.pump();

      // Wait for detail page data with real async
      found = false;
      for (int i = 0; i < 60; i++) {
        await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 500)));
        await tester.pump();
        if (find.text(testProposalTitle).evaluate().isNotEmpty) {
          found = true;
          break;
        }
      }
      expect(found, isTrue, reason: 'Proposal not found on detail page');
      await tester.pumpAndSettle();

      expect(find.text(testProposalTitle), findsOneWidget);
      expect(find.textContaining('Open for Voting'), findsOneWidget);
      expect(find.text('Environment'), findsOneWidget);
    });

    testWidgets('4. Vote: Cast vote on proposal', (tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle();

      await login(tester);

      await tester.tap(find.text('See all'));

      // Wait for list data with real async
      bool found = false;
      for (int i = 0; i < 60; i++) {
        await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 500)));
        await tester.pump();
        if (find.text(testProposalTitle).evaluate().isNotEmpty) {
          found = true;
          break;
        }
      }
      expect(found, isTrue, reason: 'Proposal not found on list page');

      await tester.tap(find.text(testProposalTitle).last);
      await tester.pump();

      // Wait for detail page data with real async
      found = false;
      for (int i = 0; i < 60; i++) {
        await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 500)));
        await tester.pump();
        if (find.text(testProposalTitle).evaluate().isNotEmpty) {
          found = true;
          break;
        }
      }
      expect(found, isTrue, reason: 'Proposal not found on detail page');
      await tester.pumpAndSettle();

      final voteButton = find.text('Vote');
      if (voteButton.evaluate().isNotEmpty) {
        await tester.tap(voteButton);
        await tester.pumpAndSettle();

        expect(find.textContaining('Remove Vote'), findsOneWidget);
      }
    });

    testWidgets('5. Comment: Add comment to proposal', (tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle();

      await login(tester);

      await tester.tap(find.text('See all'));

      // Wait for list data with real async
      bool found = false;
      for (int i = 0; i < 60; i++) {
        await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 500)));
        await tester.pump();
        if (find.text(testProposalTitle).evaluate().isNotEmpty) {
          found = true;
          break;
        }
      }
      expect(found, isTrue, reason: 'Proposal not found on list page');

      await tester.tap(find.text(testProposalTitle).last);
      await tester.pump();

      // Wait for detail page data with real async
      found = false;
      for (int i = 0; i < 60; i++) {
        await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 500)));
        await tester.pump();
        if (find.text('Add a comment...').evaluate().isNotEmpty) {
          found = true;
          break;
        }
      }
      expect(found, isTrue, reason: 'Detail page not loaded');
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
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle();

      await login(tester);

      await tester.tap(find.byIcon(Icons.person_outlined));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Admin Dashboard'));
      await tester.pumpAndSettle();

      expect(find.text('Admin Dashboard'), findsOneWidget);
      expect(find.text('Status Overview'), findsOneWidget);
    });

    testWidgets('7. Admin: View users', (tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle();

      await login(tester);

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
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle();

      await login(tester);

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
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.map_outlined));
      await tester.pumpAndSettle();

      expect(find.text('Roadmap'), findsOneWidget);
      expect(find.text('Planned'), findsOneWidget);
      expect(find.text('Implemented'), findsOneWidget);
    });

    testWidgets('10. Auth: Logout', (tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle();

      await login(tester);

      await tester.tap(find.byIcon(Icons.person_outlined));
      await tester.pumpAndSettle();

      await tester.scrollUntilVisible(
        find.text('Sign Out'),
        100,
        scrollable: find.byType(Scrollable).last,
      );
      await tester.tap(find.text('Sign Out'));
      await tester.pumpAndSettle();

      expect(find.text('Sign in to your account'), findsOneWidget);
    });
  });
}
