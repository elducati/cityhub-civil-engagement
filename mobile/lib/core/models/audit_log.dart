import 'package:json_annotation/json_annotation.dart';

part 'audit_log.g.dart';

@JsonSerializable()
class AuditLog {
  final String id;
  @JsonKey(name: 'user_id')
  final String userId;
  @JsonKey(name: 'user_email')
  final String? userEmail;
  final String action;
  @JsonKey(name: 'entity_type')
  final String entityType;
  @JsonKey(name: 'entity_id')
  final String entityId;
  final Map<String, dynamic>? metadata;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  const AuditLog({
    required this.id,
    required this.userId,
    this.userEmail,
    required this.action,
    required this.entityType,
    required this.entityId,
    this.metadata,
    required this.createdAt,
  });

  factory AuditLog.fromJson(Map<String, dynamic> json) =>
      _$AuditLogFromJson(json);

  Map<String, dynamic> toJson() => _$AuditLogToJson(this);
}
