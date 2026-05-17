import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:cityhub_mobile/core/models/comment.dart';
import 'package:cityhub_mobile/features/comments/providers/comment_provider.dart';

class CommentList extends ConsumerStatefulWidget {
  final String proposalId;
  const CommentList({super.key, required this.proposalId});

  @override
  ConsumerState<CommentList> createState() => _CommentListState();
}

class _CommentListState extends ConsumerState<CommentList> {
  final _commentController = TextEditingController();
  String? _replyToId;
  String? _replyToEmail;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submitComment() async {
    if (_commentController.text.trim().isEmpty) return;
    await ref.read(commentListProvider(widget.proposalId).notifier).addComment(
      _commentController.text.trim(),
      parentId: _replyToId,
    );
    _commentController.clear();
    setState(() {
      _replyToId = null;
      _replyToEmail = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(commentListProvider(widget.proposalId));
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_replyToEmail != null)
          Container(
            padding: const EdgeInsets.all(8),
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              color: theme.colorScheme.primaryContainer,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(Icons.reply, size: 16, color: theme.colorScheme.onPrimaryContainer),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Replying to $_replyToEmail',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onPrimaryContainer,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 16),
                  onPressed: () => setState(() {
                    _replyToId = null;
                    _replyToEmail = null;
                  }),
                ),
              ],
            ),
          ),
        TextField(
          controller: _commentController,
          maxLines: 3,
          decoration: const InputDecoration(
            hintText: 'Add a comment...',
            alignLabelWithHint: true,
          ),
        ),
        const SizedBox(height: 8),
        Align(
          alignment: Alignment.centerRight,
          child: ElevatedButton(
            onPressed: state.isLoading ? null : _submitComment,
            child: state.isLoading
                ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Post Comment'),
          ),
        ),
        const SizedBox(height: 16),
        if (state.isLoading && state.comments.isEmpty)
          const Center(child: CircularProgressIndicator())
        else if (state.comments.isEmpty)
          Center(
            child: Text(
              'No comments yet',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          )
        else
          ...state.comments.map((c) => _buildComment(c, 0)),
      ],
    );
  }

  Widget _buildComment(Comment comment, int depth) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.only(left: depth * 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerLow,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      comment.authorEmail,
                      style: theme.textTheme.labelMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      DateFormat('MMM d, yyyy').format(comment.createdAt),
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(comment.body, style: theme.textTheme.bodyMedium),
                const SizedBox(height: 4),
                GestureDetector(
                  onTap: () => setState(() {
                    _replyToId = comment.id;
                    _replyToEmail = comment.authorEmail;
                  }),
                  child: Text(
                    'Reply',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (comment.replies != null)
            ...comment.replies!.map((r) => _buildComment(r, depth + 1)),
        ],
      ),
    );
  }
}
