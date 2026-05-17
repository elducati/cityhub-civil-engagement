import 'package:riverpod/riverpod.dart';
import 'package:cityhub_mobile/core/models/comment.dart';
import 'package:cityhub_mobile/core/repositories/i_comment_repository.dart';
import 'package:cityhub_mobile/core/repositories/comment_repository.dart';

class CommentListState {
  final List<Comment> comments;
  final bool isLoading;
  final String? error;

  const CommentListState({
    this.comments = const [],
    this.isLoading = false,
    this.error,
  });

  CommentListState copyWith({
    List<Comment>? comments,
    bool? isLoading,
    String? error,
  }) {
    return CommentListState(
      comments: comments ?? this.comments,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class CommentListNotifier extends StateNotifier<CommentListState> {
  final ICommentRepository _repository;
  final String proposalId;

  CommentListNotifier(this._repository, this.proposalId)
      : super(const CommentListState());

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final comments = await _repository.getByProposalId(proposalId);
      state = CommentListState(comments: comments);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> addComment(String body, {String? parentId}) async {
    try {
      await _repository.create(proposalId, body, parentId: parentId);
      await load();
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
}

final commentListProvider =
    StateNotifierProvider.family<CommentListNotifier, CommentListState, String>(
  (ref, proposalId) {
    final repository = ref.watch(commentRepositoryProvider);
    return CommentListNotifier(repository, proposalId);
  },
);
