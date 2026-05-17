import 'package:riverpod/riverpod.dart';
import 'package:cityhub_mobile/core/models/proposal.dart';
import 'package:cityhub_mobile/core/repositories/i_proposal_repository.dart';
import 'package:cityhub_mobile/core/repositories/proposal_repository.dart';

class ProposalListState {
  final List<Proposal> proposals;
  final bool isLoading;
  final bool hasMore;
  final int currentPage;
  final String? error;

  const ProposalListState({
    this.proposals = const [],
    this.isLoading = false,
    this.hasMore = true,
    this.currentPage = 1,
    this.error,
  });

  ProposalListState copyWith({
    List<Proposal>? proposals,
    bool? isLoading,
    bool? hasMore,
    int? currentPage,
    String? error,
  }) {
    return ProposalListState(
      proposals: proposals ?? this.proposals,
      isLoading: isLoading ?? this.isLoading,
      hasMore: hasMore ?? this.hasMore,
      currentPage: currentPage ?? this.currentPage,
      error: error ?? this.error,
    );
  }
}

class ProposalListNotifier extends StateNotifier<ProposalListState> {
  final IProposalRepository _repository;
  String? _statusFilter;
  String? _categoryFilter;
  String? _sort;
  String? _search;

  ProposalListNotifier(this._repository) : super(const ProposalListState());

  void setFilters({String? status, String? category, String? sort, String? search}) {
    _statusFilter = status;
    _categoryFilter = category;
    _sort = sort;
    _search = search;
    state = const ProposalListState();
    loadMore();
  }

  Future<void> loadMore() async {
    if (state.isLoading || !state.hasMore) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final result = await _repository.list(
        page: state.currentPage,
        status: _statusFilter,
        category: _categoryFilter,
        sort: _sort,
        search: _search,
      );

      state = state.copyWith(
        proposals: [...state.proposals, ...result.data],
        isLoading: false,
        hasMore: result.pagination.hasMore,
        currentPage: state.currentPage + 1,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> refresh() async {
    state = const ProposalListState();
    await loadMore();
  }
}

final proposalListProvider =
    StateNotifierProvider<ProposalListNotifier, ProposalListState>((ref) {
  final repository = ref.watch(proposalRepositoryProvider);
  return ProposalListNotifier(repository);
});

class ProposalDetailState {
  final Proposal? proposal;
  final bool isLoading;
  final String? error;

  const ProposalDetailState({this.proposal, this.isLoading = false, this.error});

  ProposalDetailState copyWith({Proposal? proposal, bool? isLoading, String? error}) {
    return ProposalDetailState(
      proposal: proposal ?? this.proposal,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class ProposalDetailNotifier extends StateNotifier<ProposalDetailState> {
  final IProposalRepository _repository;

  ProposalDetailNotifier(this._repository) : super(const ProposalDetailState());

  Future<void> load(String id) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final proposal = await _repository.getById(id);
      state = ProposalDetailState(proposal: proposal);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> castVote(String id) async {
    try {
      final result = await _repository.castVote(id);
      if (state.proposal != null) {
        state = state.copyWith(
          proposal: state.proposal!.copyWith(
            voteCount: result.voteCount,
            userHasVoted: true,
          ),
        );
      }
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> removeVote(String id) async {
    try {
      final result = await _repository.removeVote(id);
      if (state.proposal != null) {
        state = state.copyWith(
          proposal: state.proposal!.copyWith(
            voteCount: result.voteCount,
            userHasVoted: false,
          ),
        );
      }
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
}

final proposalDetailProvider = StateNotifierProvider.family<ProposalDetailNotifier, ProposalDetailState, String>((ref, id) {
  final repository = ref.watch(proposalRepositoryProvider);
  return ProposalDetailNotifier(repository);
});
