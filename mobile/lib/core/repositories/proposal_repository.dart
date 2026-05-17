import 'package:cityhub_mobile/core/api/api_client.dart';
import 'package:cityhub_mobile/core/api/api_endpoints.dart';
import 'package:cityhub_mobile/core/models/proposal.dart';
import 'package:cityhub_mobile/core/repositories/i_proposal_repository.dart';
import 'package:riverpod/riverpod.dart';

class ProposalRepository implements IProposalRepository {
  final ApiClient _client;

  ProposalRepository(this._client);

  @override
  Future<PaginatedResponse> list({
    int page = 1,
    int limit = 20,
    String? status,
    String? category,
    String? sort,
    String? search,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
    };
    if (status != null) params['status'] = status;
    if (category != null) params['category'] = category;
    if (sort != null) params['sort'] = sort;
    if (search != null) params['search'] = search;

    final response = await _client.get(
      ApiEndpoints.proposals,
      queryParameters: params,
    );
    final data = response.data as Map<String, dynamic>;
    final unwrapped = data['data'] as Map<String, dynamic>? ?? data;
    return PaginatedResponse.fromJson(unwrapped);
  }

  @override
  Future<Proposal> getById(String id) async {
    final response = await _client.get(ApiEndpoints.proposalDetail(id));
    final data = response.data as Map<String, dynamic>;
    final unwrapped = data['data'] as Map<String, dynamic>? ?? data;
    return Proposal.fromJson(unwrapped);
  }

  @override
  Future<Proposal> create(CreateProposalRequest request) async {
    final response = await _client.post(
      ApiEndpoints.proposals,
      data: request.toJson(),
    );
    final data = response.data as Map<String, dynamic>;
    final unwrapped = data['data'] as Map<String, dynamic>? ?? data;
    return Proposal.fromJson(unwrapped);
  }

  @override
  Future<Proposal> update(String id, UpdateProposalRequest request) async {
    final response = await _client.put(
      ApiEndpoints.proposalDetail(id),
      data: request.toJson(),
    );
    final data = response.data as Map<String, dynamic>;
    final unwrapped = data['data'] as Map<String, dynamic>? ?? data;
    return Proposal.fromJson(unwrapped);
  }

  @override
  Future<void> delete(String id) async {
    await _client.delete(ApiEndpoints.proposalDetail(id));
  }

  @override
  Future<VoteResponse> castVote(String id) async {
    final response = await _client.post(ApiEndpoints.proposalVote(id));
    final data = response.data as Map<String, dynamic>;
    final unwrapped = data['data'] as Map<String, dynamic>? ?? data;
    return VoteResponse.fromJson(unwrapped);
  }

  @override
  Future<VoteResponse> removeVote(String id) async {
    final response = await _client.delete(ApiEndpoints.proposalVote(id));
    final data = response.data as Map<String, dynamic>;
    final unwrapped = data['data'] as Map<String, dynamic>? ?? data;
    return VoteResponse.fromJson(unwrapped);
  }

  @override
  Future<StatsResponse> getStats() async {
    final response = await _client.get(ApiEndpoints.stats);
    final data = response.data as Map<String, dynamic>;
    return StatsResponse.fromJson(data);
  }

  @override
  Future<List<Proposal>> getTrending() async {
    final response = await _client.get(ApiEndpoints.proposalsTrending);
    final data = response.data as Map<String, dynamic>;
    final unwrapped = data['data'] as List<dynamic>? ?? data as List<dynamic>;
    return unwrapped.map((e) => Proposal.fromJson(e as Map<String, dynamic>)).toList();
  }
}

final proposalRepositoryProvider = Provider<IProposalRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return ProposalRepository(client);
});
