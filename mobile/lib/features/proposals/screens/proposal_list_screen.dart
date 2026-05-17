import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cityhub_mobile/core/constants/app_constants.dart';
import 'package:cityhub_mobile/features/proposals/providers/proposal_provider.dart';
import 'package:cityhub_mobile/features/proposals/widgets/proposal_card.dart';

class ProposalListScreen extends ConsumerStatefulWidget {
  final String? initialStatus;
  const ProposalListScreen({super.key, this.initialStatus});

  @override
  ConsumerState<ProposalListScreen> createState() => _ProposalListScreenState();
}

class _ProposalListScreenState extends ConsumerState<ProposalListScreen> {
  final _scrollController = ScrollController();
  final _searchController = TextEditingController();
  String? _selectedStatus;
  String? _selectedCategory;
  String _selectedSort = 'createdAt';

  @override
  void initState() {
    super.initState();
    _selectedStatus = widget.initialStatus;
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(proposalListProvider.notifier).setFilters(
        status: _selectedStatus,
      );
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(proposalListProvider.notifier).loadMore();
    }
  }

  void _applyFilters() {
    ref.read(proposalListProvider.notifier).setFilters(
      status: _selectedStatus,
      category: _selectedCategory,
      sort: _selectedSort,
      search: _searchController.text.trim().isEmpty
          ? null
          : _searchController.text.trim(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(proposalListProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Proposals'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterSheet,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/proposals/create'),
        child: const Icon(Icons.add),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search proposals...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _applyFilters();
                        },
                      )
                    : null,
              ),
              onSubmitted: (_) => _applyFilters(),
            ),
          ),
          if (_selectedStatus != null)
            Chip(
              label: Text(AppConstants.proposalStatusLabels[_selectedStatus] ?? _selectedStatus!),
              onDeleted: () {
                setState(() => _selectedStatus = null);
                _applyFilters();
              },
            ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => ref.read(proposalListProvider.notifier).refresh(),
              child: state.isLoading && state.proposals.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : state.proposals.isEmpty
                      ? Center(
                          child: Text(
                            'No proposals found',
                            style: theme.textTheme.bodyLarge?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        )
                      : ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(16),
                          itemCount: state.proposals.length + (state.hasMore ? 1 : 0),
                          itemBuilder: (context, index) {
                            if (index >= state.proposals.length) {
                              return const Center(
                                child: Padding(
                                  padding: EdgeInsets.all(16),
                                  child: CircularProgressIndicator(),
                                ),
                              );
                            }
                            return ProposalCard(
                              proposal: state.proposals[index],
                              onTap: () => context.go('/proposals/${state.proposals[index].id}'),
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Filters', style: Theme.of(ctx).textTheme.titleLarge),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                initialValue: _selectedStatus,
                decoration: const InputDecoration(labelText: 'Status'),
                items: [const DropdownMenuItem(value: null, child: Text('All')), ...AppConstants.proposalStatuses.map((s) => DropdownMenuItem(value: s, child: Text(AppConstants.proposalStatusLabels[s] ?? s)))],
                onChanged: (v) => setSheetState(() => _selectedStatus = v),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                initialValue: _selectedCategory,
                decoration: const InputDecoration(labelText: 'Category'),
                items: [const DropdownMenuItem(value: null, child: Text('All')), ...AppConstants.categories.map((c) => DropdownMenuItem(value: c, child: Text(c)))],
                onChanged: (v) => setSheetState(() => _selectedCategory = v),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                initialValue: _selectedSort,
                decoration: const InputDecoration(labelText: 'Sort by'),
                items: const [
                  DropdownMenuItem(value: 'createdAt', child: Text('Newest')),
                  DropdownMenuItem(value: 'voteCount', child: Text('Most Votes')),
                ],
                onChanged: (v) => setSheetState(() => _selectedSort = v!),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  _applyFilters();
                  Navigator.pop(ctx);
                },
                child: const Text('Apply Filters'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
