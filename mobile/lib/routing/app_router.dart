import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cityhub_mobile/features/auth/screens/login_screen.dart';
import 'package:cityhub_mobile/features/auth/screens/register_screen.dart';
import 'package:cityhub_mobile/features/proposals/screens/proposal_list_screen.dart';
import 'package:cityhub_mobile/features/proposals/screens/proposal_detail_screen.dart';
import 'package:cityhub_mobile/features/proposals/screens/create_proposal_screen.dart';
import 'package:cityhub_mobile/features/roadmap/screens/roadmap_screen.dart';
import 'package:cityhub_mobile/features/admin/screens/admin_dashboard_screen.dart';
import 'package:cityhub_mobile/features/admin/screens/admin_users_screen.dart';
import 'package:cityhub_mobile/features/admin/screens/admin_audit_screen.dart';
import 'package:cityhub_mobile/features/profile/screens/profile_screen.dart';
import 'package:cityhub_mobile/features/home/screens/home_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/proposals',
        builder: (context, state) => const ProposalListScreen(),
      ),
      GoRoute(
        path: '/proposals/create',
        builder: (context, state) => const CreateProposalScreen(),
      ),
      GoRoute(
        path: '/proposals/:id',
        builder: (context, state) => ProposalDetailScreen(
          proposalId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/roadmap',
        builder: (context, state) => const RoadmapScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      GoRoute(
        path: '/admin/users',
        builder: (context, state) => const AdminUsersScreen(),
      ),
      GoRoute(
        path: '/admin/audit',
        builder: (context, state) => const AdminAuditScreen(),
      ),
    ],
  );
});
