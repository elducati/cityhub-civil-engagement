import 'package:cityhub_mobile/core/models/comment.dart';

abstract class ICommentRepository {
  Future<List<Comment>> getByProposalId(String proposalId);
  Future<Comment> create(String proposalId, String body, {String? parentId});
}
