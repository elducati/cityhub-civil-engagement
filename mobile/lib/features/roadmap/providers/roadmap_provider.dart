import 'package:riverpod/riverpod.dart';
import 'package:cityhub_mobile/core/models/proposal.dart';
import 'package:cityhub_mobile/core/repositories/i_proposal_repository.dart';
import 'package:cityhub_mobile/core/repositories/proposal_repository.dart';

class RoadmapState {
  final List<Proposal> plannedProposals;
  final List<Proposal> implementedProposals;
  final bool isLoading;
  final String? error;

  const RoadmapState({
    this.plannedProposals = const [],
    this.implementedProposals = const [],
    this.isLoading = false,
    this.error,
  });

  RoadmapState copyWith({
    List<Proposal>? plannedProposals,
    List<Proposal>? implementedProposals,
    bool? isLoading,
    String? error,
  }) {
    return RoadmapState(
      plannedProposals: plannedProposals ?? this.plannedProposals,
      implementedProposals: implementedProposals ?? this.implementedProposals,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class RoadmapNotifier extends StateNotifier<RoadmapState> {
  final IProposalRepository _repository;

  RoadmapNotifier(this._repository) : super(const RoadmapState());

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final results = await Future.wait([
        _repository.list(status: 'PLANNED', limit: 50),
        _repository.list(status: 'IMPLEMENTED', limit: 50),
      ]);

      state = RoadmapState(
        plannedProposals: results[0].data,
        implementedProposals: results[1].data,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final roadmapProvider = StateNotifierProvider<RoadmapNotifier, RoadmapState>((ref) {
  final repository = ref.watch(proposalRepositoryProvider);
  return RoadmapNotifier(repository);
});
