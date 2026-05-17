import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:cityhub_mobile/features/admin/providers/admin_provider.dart';

class AdminAuditScreen extends ConsumerStatefulWidget {
  const AdminAuditScreen({super.key});

  @override
  ConsumerState<AdminAuditScreen> createState() => _AdminAuditScreenState();
}

class _AdminAuditScreenState extends ConsumerState<AdminAuditScreen> {
  final _actionFilters = <String?>[null, 'CREATE', 'UPDATE', 'DELETE', 'VOTE', 'UNVOTE', 'LOGIN'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(adminAuditProvider.notifier).load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(adminAuditProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Audit Log')),
      body: Column(
        children: [
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              children: _actionFilters.map((action) {
                final isSelected = state.actionFilter == action;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(action ?? 'All'),
                    selected: isSelected,
                    onSelected: (_) {
                      ref.read(adminAuditProvider.notifier).load(action: action);
                    },
                  ),
                );
              }).toList(),
            ),
          ),
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: () => ref.read(adminAuditProvider.notifier).load(),
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: state.logs.length,
                      itemBuilder: (context, index) {
                        final log = state.logs[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              radius: 16,
                              backgroundColor: _getActionColor(log.action, theme).withValues(alpha: 0.2),
                              child: Text(
                                log.action[0],
                                style: TextStyle(color: _getActionColor(log.action, theme)),
                              ),
                            ),
                            title: Text(log.action, style: const TextStyle(fontWeight: FontWeight.w600)),
                            subtitle: Text(
                              '${log.userEmail ?? log.userId} - ${log.entityType}:${log.entityId.substring(0, 8)}...',
                            ),
                            trailing: Text(
                              DateFormat('MMM d, HH:mm').format(log.createdAt),
                              style: theme.textTheme.labelSmall,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Color _getActionColor(String action, ThemeData theme) {
    switch (action) {
      case 'CREATE':
        return Colors.green;
      case 'UPDATE':
        return Colors.blue;
      case 'DELETE':
        return Colors.red;
      case 'VOTE':
        return Colors.purple;
      case 'UNVOTE':
        return Colors.orange;
      case 'LOGIN':
        return Colors.teal;
      default:
        return theme.colorScheme.primary;
    }
  }
}
