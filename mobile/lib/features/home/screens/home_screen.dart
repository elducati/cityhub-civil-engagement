import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cityhub_mobile/features/auth/providers/auth_provider.dart';
import 'package:cityhub_mobile/core/repositories/proposal_repository.dart';
import 'package:cityhub_mobile/core/models/proposal.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  StatsResponse? _stats;
  List<Proposal>? _trending;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final repo = ref.read(proposalRepositoryProvider);
      final stats = await repo.getStats();
      final trending = await repo.getTrending();
      setState(() {
        _stats = stats;
        _trending = trending;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'CityHub',
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.map_outlined),
                        onPressed: () => context.go('/roadmap'),
                        tooltip: 'Roadmap',
                      ),
                      IconButton(
                        icon: const Icon(Icons.person_outlined),
                        onPressed: () => context.go('/profile'),
                        tooltip: 'Profile',
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),
              if (_isLoading)
                const Center(child: CircularProgressIndicator())
              else ...[
                if (_stats != null)
                  Row(
                    children: [
                      _buildStatCard('Proposals', '${_stats!.totalProposals}', theme),
                      const SizedBox(width: 8),
                      _buildStatCard('Votes', '${_stats!.totalVotes}', theme),
                      const SizedBox(width: 8),
                      _buildStatCard('Users', '${_stats!.totalUsers}', theme),
                    ],
                  ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Trending Proposals',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextButton(
                      onPressed: () => context.go('/proposals'),
                      child: const Text('See all'),
                    ),
                  ],
                ),
                if (_trending != null) ...[
                  ..._trending!.map((p) => Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      title: Text(p.title, maxLines: 1, overflow: TextOverflow.ellipsis),
                      subtitle: Text('${p.voteCount} votes'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => context.go('/proposals/${p.id}'),
                    ),
                  )),
                ],
              ],
              const SizedBox(height: 24),
              authState != AuthState.authenticated
                  ? ElevatedButton(
                      onPressed: () => context.go('/login'),
                      child: const Text('Sign in to participate'),
                    )
                  : ElevatedButton(
                      onPressed: () => context.go('/proposals/create'),
                      child: const Text('Submit a Proposal'),
                    ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, ThemeData theme) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
          child: Column(
            children: [
              Text(
                value,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.primary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
