import 'package:cityhub_mobile/core/api/api_client.dart';
import 'package:cityhub_mobile/core/api/api_endpoints.dart';
import 'package:cityhub_mobile/core/models/comment.dart';
import 'package:cityhub_mobile/core/repositories/i_comment_repository.dart';
import 'package:riverpod/riverpod.dart';

class CommentRepository implements ICommentRepository {
  final ApiClient _client;

  CommentRepository(this._client);

  @override
  Future<List<Comment>> getByProposalId(String proposalId) async {
    final response = await _client.get(
      ApiEndpoints.proposalComments(proposalId),
    );
    final data = response.data as Map<String, dynamic>;
    final unwrapped = data['data'] as List<dynamic>? ?? data as List<dynamic>;
    return unwrapped
        .map((e) => Comment.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<Comment> create(String proposalId, String body, {String? parentId}) async {
    final response = await _client.post(
      ApiEndpoints.proposalComments(proposalId),
      data: CreateCommentRequest(body: body, parentId: parentId).toJson(),
    );
    final data = response.data as Map<String, dynamic>;
    final unwrapped = data['data'] as Map<String, dynamic>? ?? data;
    return Comment.fromJson(unwrapped);
  }
}

final commentRepositoryProvider = Provider<ICommentRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return CommentRepository(client);
});
