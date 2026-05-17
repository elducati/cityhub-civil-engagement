// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'proposal.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Proposal _$ProposalFromJson(Map<String, dynamic> json) => Proposal(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      authorId: json['author_id'] as String,
      status: json['status'] as String,
      voteCount: (json['vote_count'] as num).toInt(),
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
      category: json['category'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      rejectionReason: json['rejection_reason'] as String?,
      author: json['author'] == null
          ? null
          : User.fromJson(json['author'] as Map<String, dynamic>),
      userVoted: json['user_voted'] as bool?,
      userHasVoted: json['user_has_voted'] as bool?,
    );

Map<String, dynamic> _$ProposalToJson(Proposal instance) => <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'description': instance.description,
      'author_id': instance.authorId,
      'status': instance.status,
      'vote_count': instance.voteCount,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
      'category': instance.category,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'rejection_reason': instance.rejectionReason,
      'author': instance.author,
      'user_voted': instance.userVoted,
      'user_has_voted': instance.userHasVoted,
    };

PaginatedResponse _$PaginatedResponseFromJson(Map<String, dynamic> json) =>
    PaginatedResponse(
      data: (json['data'] as List<dynamic>)
          .map((e) => Proposal.fromJson(e as Map<String, dynamic>))
          .toList(),
      pagination:
          PaginationInfo.fromJson(json['pagination'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$PaginatedResponseToJson(PaginatedResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
      'pagination': instance.pagination,
    };

PaginationInfo _$PaginationInfoFromJson(Map<String, dynamic> json) =>
    PaginationInfo(
      page: (json['page'] as num).toInt(),
      limit: (json['limit'] as num).toInt(),
      total: (json['total'] as num).toInt(),
      totalPages: (json['total_pages'] as num).toInt(),
    );

Map<String, dynamic> _$PaginationInfoToJson(PaginationInfo instance) =>
    <String, dynamic>{
      'page': instance.page,
      'limit': instance.limit,
      'total': instance.total,
      'total_pages': instance.totalPages,
    };

CreateProposalRequest _$CreateProposalRequestFromJson(
        Map<String, dynamic> json) =>
    CreateProposalRequest(
      title: json['title'] as String,
      description: json['description'] as String,
      category: json['category'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$CreateProposalRequestToJson(
        CreateProposalRequest instance) =>
    <String, dynamic>{
      'title': instance.title,
      'description': instance.description,
      'category': instance.category,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
    };

UpdateProposalRequest _$UpdateProposalRequestFromJson(
        Map<String, dynamic> json) =>
    UpdateProposalRequest(
      title: json['title'] as String?,
      description: json['description'] as String?,
      status: json['status'] as String?,
    );

Map<String, dynamic> _$UpdateProposalRequestToJson(
        UpdateProposalRequest instance) =>
    <String, dynamic>{
      'title': instance.title,
      'description': instance.description,
      'status': instance.status,
    };

VoteResponse _$VoteResponseFromJson(Map<String, dynamic> json) => VoteResponse(
      proposalId: json['proposal_id'] as String,
      voteCount: (json['vote_count'] as num).toInt(),
      userVoted: json['user_voted'] as bool,
    );

Map<String, dynamic> _$VoteResponseToJson(VoteResponse instance) =>
    <String, dynamic>{
      'proposal_id': instance.proposalId,
      'vote_count': instance.voteCount,
      'user_voted': instance.userVoted,
    };

StatsResponse _$StatsResponseFromJson(Map<String, dynamic> json) =>
    StatsResponse(
      totalProposals: (json['total_proposals'] as num).toInt(),
      totalVotes: (json['total_votes'] as num).toInt(),
      totalUsers: (json['total_users'] as num).toInt(),
    );

Map<String, dynamic> _$StatsResponseToJson(StatsResponse instance) =>
    <String, dynamic>{
      'total_proposals': instance.totalProposals,
      'total_votes': instance.totalVotes,
      'total_users': instance.totalUsers,
    };
