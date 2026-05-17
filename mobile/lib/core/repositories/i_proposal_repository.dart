import 'package:cityhub_mobile/core/models/proposal.dart';

abstract class IProposalRepository {
  Future<PaginatedResponse> list({
    int page = 1,
    int limit = 20,
    String? status,
    String? category,
    String? sort,
    String? search,
  });
  Future<Proposal> getById(String id);
  Future<Proposal> create(CreateProposalRequest request);
  Future<Proposal> update(String id, UpdateProposalRequest request);
  Future<void> delete(String id);
  Future<VoteResponse> castVote(String id);
  Future<VoteResponse> removeVote(String id);
  Future<StatsResponse> getStats();
  Future<List<Proposal>> getTrending();
}
