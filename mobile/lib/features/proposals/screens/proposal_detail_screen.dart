import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cityhub_mobile/core/constants/app_constants.dart';
import 'package:cityhub_mobile/features/comments/providers/comment_provider.dart';
import 'package:cityhub_mobile/features/comments/widgets/comment_list.dart';
import 'package:cityhub_mobile/features/proposals/providers/proposal_provider.dart';

class ProposalDetailScreen extends ConsumerStatefulWidget {
  final String proposalId;
  const ProposalDetailScreen({super.key, required this.proposalId});

  @override
  ConsumerState<ProposalDetailScreen> createState() => _ProposalDetailScreenState();
}

class _ProposalDetailScreenState extends ConsumerState<ProposalDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(proposalDetailProvider(widget.proposalId).notifier).load(widget.proposalId);
      ref.read(commentListProvider(widget.proposalId).notifier).load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final detailState = ref.watch(proposalDetailProvider(widget.proposalId));
    final commentListState = ref.watch(commentListProvider(widget.proposalId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(detailState.proposal?.title ?? 'Proposal'),
      ),
      body: detailState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : detailState.error != null
              ? Center(child: Text('Error: ${detailState.error}'))
              : detailState.proposal == null
                  ? const Center(child: Text('Proposal not found'))
                  : RefreshIndicator(
                      onRefresh: () async {
                        await ref.read(proposalDetailProvider(widget.proposalId).notifier).load(widget.proposalId);
                        await ref.read(commentListProvider(widget.proposalId).notifier).load();
                      },
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              detailState.proposal!.title,
                              style: theme.textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                _buildStatusBadge(detailState.proposal!.status),
                                const SizedBox(width: 8),
                                if (detailState.proposal!.category != null)
                                  _buildCategoryBadge(detailState.proposal!.category!),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                Icon(Icons.person_outline, size: 16, color: theme.colorScheme.onSurfaceVariant),
                                const SizedBox(width: 4),
                                Text(
                                  detailState.proposal!.author?.email ?? 'Unknown',
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: theme.colorScheme.onSurfaceVariant,
                                  ),
                                ),
                                const Spacer(),
                                Icon(Icons.access_time, size: 16, color: theme.colorScheme.onSurfaceVariant),
                                const SizedBox(width: 4),
                                Text(
                                  _formatDate(detailState.proposal!.createdAt),
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: theme.colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                            if (detailState.proposal!.latitude != null &&
                                detailState.proposal!.longitude != null) ...[
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.location_on, size: 16, color: theme.colorScheme.onSurfaceVariant),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${detailState.proposal!.latitude!.toStringAsFixed(4)}, ${detailState.proposal!.longitude!.toStringAsFixed(4)}',
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color: theme.colorScheme.onSurfaceVariant,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                            const SizedBox(height: 24),
                            Text(
                              detailState.proposal!.description,
                              style: theme.textTheme.bodyLarge,
                            ),
                            const SizedBox(height: 24),
                            _buildVoteSection(detailState, theme),
                            const SizedBox(height: 32),
                            Text(
                              'Comments (${commentListState.comments.length})',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 12),
                            CommentList(proposalId: widget.proposalId),
                          ],
                        ),
                      ),
                    ),
    );
  }

  Widget _buildStatusBadge(String status) {
    final color = Color(AppConstants.proposalStatusColors[status] ?? 0xFF6B7280);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        AppConstants.proposalStatusLabels[status] ?? status,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildCategoryBadge(String category) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.secondaryContainer,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        category,
        style: TextStyle(
          color: Theme.of(context).colorScheme.onSecondaryContainer,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildVoteSection(detailState, ThemeData theme) {
    final proposal = detailState.proposal!;
    final userHasVoted = proposal.userHasVoted ?? proposal.userVoted ?? false;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(
              Icons.arrow_upward,
              color: userHasVoted ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant,
            ),
            const SizedBox(width: 8),
            Text(
              '${proposal.voteCount}',
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: userHasVoted ? theme.colorScheme.primary : null,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              'votes',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const Spacer(),
            ElevatedButton.icon(
              onPressed: () {
                final notifier = ref.read(proposalDetailProvider(widget.proposalId).notifier);
                if (userHasVoted) {
                  notifier.removeVote(widget.proposalId);
                } else {
                  notifier.castVote(widget.proposalId);
                }
              },
              icon: Icon(userHasVoted ? Icons.thumb_down : Icons.thumb_up),
              label: Text(userHasVoted ? 'Remove Vote' : 'Vote'),
              style: ElevatedButton.styleFrom(
                backgroundColor: userHasVoted ? theme.colorScheme.error : theme.colorScheme.primary,
                foregroundColor: theme.colorScheme.onPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }
}
