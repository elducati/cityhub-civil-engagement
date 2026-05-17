// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'comment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Comment _$CommentFromJson(Map<String, dynamic> json) => Comment(
      id: json['id'] as String,
      proposalId: json['proposal_id'] as String,
      parentId: json['parent_id'] as String?,
      authorId: json['author_id'] as String,
      authorEmail: json['author_email'] as String,
      body: json['body'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      replies: (json['replies'] as List<dynamic>?)
          ?.map((e) => Comment.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$CommentToJson(Comment instance) => <String, dynamic>{
      'id': instance.id,
      'proposal_id': instance.proposalId,
      'parent_id': instance.parentId,
      'author_id': instance.authorId,
      'author_email': instance.authorEmail,
      'body': instance.body,
      'created_at': instance.createdAt.toIso8601String(),
      'replies': instance.replies,
    };

CreateCommentRequest _$CreateCommentRequestFromJson(
        Map<String, dynamic> json) =>
    CreateCommentRequest(
      body: json['body'] as String,
      parentId: json['parent_id'] as String?,
    );

Map<String, dynamic> _$CreateCommentRequestToJson(
        CreateCommentRequest instance) =>
    <String, dynamic>{
      'body': instance.body,
      'parent_id': instance.parentId,
    };
