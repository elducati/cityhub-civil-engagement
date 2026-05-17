import 'package:json_annotation/json_annotation.dart';
import 'user.dart';

part 'proposal.g.dart';

@JsonSerializable()
class Proposal {
  final String id;
  final String title;
  final String description;
  @JsonKey(name: 'author_id')
  final String authorId;
  final String status;
  @JsonKey(name: 'vote_count')
  final int voteCount;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;
  @JsonKey(name: 'category')
  final String? category;
  final double? latitude;
  final double? longitude;
  @JsonKey(name: 'rejection_reason')
  final String? rejectionReason;
  final User? author;
  @JsonKey(name: 'user_voted')
  final bool? userVoted;
  @JsonKey(name: 'user_has_voted')
  final bool? userHasVoted;

  const Proposal({
    required this.id,
    required this.title,
    required this.description,
    required this.authorId,
    required this.status,
    required this.voteCount,
    required this.createdAt,
    this.updatedAt,
    this.category,
    this.latitude,
    this.longitude,
    this.rejectionReason,
    this.author,
    this.userVoted,
    this.userHasVoted,
  });

  factory Proposal.fromJson(Map<String, dynamic> json) =>
      _$ProposalFromJson(json);

  Map<String, dynamic> toJson() => _$ProposalToJson(this);

  bool get isOpenForVoting => status == 'OPEN';
  bool get isPlannedOrImplemented =>
      status == 'PLANNED' || status == 'IMPLEMENTED';
  bool get isTerminal => status == 'IMPLEMENTED' || status == 'REJECTED';

  Proposal copyWith({
    String? id,
    String? title,
    String? description,
    String? authorId,
    String? status,
    int? voteCount,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? category,
    double? latitude,
    double? longitude,
    String? rejectionReason,
    User? author,
    bool? userVoted,
    bool? userHasVoted,
  }) {
    return Proposal(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      authorId: authorId ?? this.authorId,
      status: status ?? this.status,
      voteCount: voteCount ?? this.voteCount,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      category: category ?? this.category,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      rejectionReason: rejectionReason ?? this.rejectionReason,
      author: author ?? this.author,
      userVoted: userVoted ?? this.userVoted,
      userHasVoted: userHasVoted ?? this.userHasVoted,
    );
  }
}

@JsonSerializable()
class PaginatedResponse {
  final List<Proposal> data;
  final PaginationInfo pagination;

  const PaginatedResponse({required this.data, required this.pagination});

  factory PaginatedResponse.fromJson(Map<String, dynamic> json) =>
      _$PaginatedResponseFromJson(json);
}

@JsonSerializable()
class PaginationInfo {
  final int page;
  final int limit;
  final int total;
  @JsonKey(name: 'total_pages')
  final int totalPages;

  const PaginationInfo({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory PaginationInfo.fromJson(Map<String, dynamic> json) =>
      _$PaginationInfoFromJson(json);

  bool get hasMore => page < totalPages;
}

@JsonSerializable()
class CreateProposalRequest {
  final String title;
  final String description;
  final String? category;
  final double? latitude;
  final double? longitude;

  const CreateProposalRequest({
    required this.title,
    required this.description,
    this.category,
    this.latitude,
    this.longitude,
  });

  Map<String, dynamic> toJson() => _$CreateProposalRequestToJson(this);
}

@JsonSerializable()
class UpdateProposalRequest {
  final String? title;
  final String? description;
  final String? status;

  const UpdateProposalRequest({this.title, this.description, this.status});

  Map<String, dynamic> toJson() => _$UpdateProposalRequestToJson(this);
}

@JsonSerializable()
class VoteResponse {
  @JsonKey(name: 'proposal_id')
  final String proposalId;
  @JsonKey(name: 'vote_count')
  final int voteCount;
  @JsonKey(name: 'user_voted')
  final bool userVoted;

  const VoteResponse({
    required this.proposalId,
    required this.voteCount,
    required this.userVoted,
  });

  factory VoteResponse.fromJson(Map<String, dynamic> json) =>
      _$VoteResponseFromJson(json);
}

@JsonSerializable()
class StatsResponse {
  @JsonKey(name: 'total_proposals')
  final int totalProposals;
  @JsonKey(name: 'total_votes')
  final int totalVotes;
  @JsonKey(name: 'total_users')
  final int totalUsers;

  const StatsResponse({
    required this.totalProposals,
    required this.totalVotes,
    required this.totalUsers,
  });

  factory StatsResponse.fromJson(Map<String, dynamic> json) =>
      _$StatsResponseFromJson(json);
}
