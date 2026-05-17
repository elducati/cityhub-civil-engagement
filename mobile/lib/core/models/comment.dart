import 'package:json_annotation/json_annotation.dart';

part 'comment.g.dart';

@JsonSerializable()
class Comment {
  final String id;
  @JsonKey(name: 'proposal_id')
  final String proposalId;
  @JsonKey(name: 'parent_id')
  final String? parentId;
  @JsonKey(name: 'author_id')
  final String authorId;
  @JsonKey(name: 'author_email')
  final String authorEmail;
  final String body;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  final List<Comment>? replies;

  const Comment({
    required this.id,
    required this.proposalId,
    this.parentId,
    required this.authorId,
    required this.authorEmail,
    required this.body,
    required this.createdAt,
    this.replies,
  });

  factory Comment.fromJson(Map<String, dynamic> json) =>
      _$CommentFromJson(json);

  Map<String, dynamic> toJson() => _$CommentToJson(this);
}

@JsonSerializable()
class CreateCommentRequest {
  final String body;
  @JsonKey(name: 'parent_id')
  final String? parentId;

  const CreateCommentRequest({required this.body, this.parentId});

  Map<String, dynamic> toJson() => _$CreateCommentRequestToJson(this);
}
