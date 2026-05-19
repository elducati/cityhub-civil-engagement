import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:riverpod/riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:cityhub_mobile/core/constants/app_constants.dart';

enum SocketConnectionState { disconnected, connecting, connected, error }

class SocketService {
  io.Socket? _socket;
  SocketConnectionState _state = SocketConnectionState.disconnected;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  SocketConnectionState get state => _state;

  final _onProposalCreated = <void Function(Map<String, dynamic>)>[];
  final _onProposalUpdated = <void Function(Map<String, dynamic>)>[];
  final _onProposalDeleted = <void Function(Map<String, dynamic>)>[];
  final _onProposalStatusChanged = <void Function(Map<String, dynamic>)>[];
  final _onVoteCreated = <void Function(Map<String, dynamic>)>[];
  final _onVoteRemoved = <void Function(Map<String, dynamic>)>[];
  final _onVoteStats = <void Function(Map<String, dynamic>)>[];
  final _onCommentCreated = <void Function(Map<String, dynamic>)>[];
  final _onProposalListChanged = <void Function(Map<String, dynamic>)>[];

  void addProposalCreatedHandler(void Function(Map<String, dynamic>) h) => _onProposalCreated.add(h);
  void addProposalUpdatedHandler(void Function(Map<String, dynamic>) h) => _onProposalUpdated.add(h);
  void addProposalDeletedHandler(void Function(Map<String, dynamic>) h) => _onProposalDeleted.add(h);
  void addProposalStatusChangedHandler(void Function(Map<String, dynamic>) h) => _onProposalStatusChanged.add(h);
  void addVoteCreatedHandler(void Function(Map<String, dynamic>) h) => _onVoteCreated.add(h);
  void addVoteRemovedHandler(void Function(Map<String, dynamic>) h) => _onVoteRemoved.add(h);
  void addVoteStatsHandler(void Function(Map<String, dynamic>) h) => _onVoteStats.add(h);
  void addCommentCreatedHandler(void Function(Map<String, dynamic>) h) => _onCommentCreated.add(h);
  void addProposalListChangedHandler(void Function(Map<String, dynamic>) h) => _onProposalListChanged.add(h);

  Future<void> connect() async {
    if (_socket?.connected == true) return;

    _state = SocketConnectionState.connecting;
    String? token;
    try {
      token = await _storage.read(key: 'auth_token');
    } catch (_) {
      token = null;
    }

    _socket = io.io(
      AppConstants.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .enableForceNew()
          .build(),
    );

    _socket!.onConnect((_) {
      _state = SocketConnectionState.connected;
    });

    _socket!.onDisconnect((_) {
      _state = SocketConnectionState.disconnected;
    });

    _socket!.onConnectError((_) {
      _state = SocketConnectionState.error;
    });

    _socket!.on('proposal:created', (data) {
      for (final h in _onProposalCreated) { h(data as Map<String, dynamic>); }
    });

    _socket!.on('proposal:updated', (data) {
      for (final h in _onProposalUpdated) { h(data as Map<String, dynamic>); }
    });

    _socket!.on('proposal:deleted', (data) {
      for (final h in _onProposalDeleted) { h(data as Map<String, dynamic>); }
    });

    _socket!.on('proposal:statusChanged', (data) {
      for (final h in _onProposalStatusChanged) { h(data as Map<String, dynamic>); }
    });

    _socket!.on('vote:created', (data) {
      for (final h in _onVoteCreated) { h(data as Map<String, dynamic>); }
    });

    _socket!.on('vote:removed', (data) {
      for (final h in _onVoteRemoved) { h(data as Map<String, dynamic>); }
    });

    _socket!.on('vote:stats', (data) {
      for (final h in _onVoteStats) { h(data as Map<String, dynamic>); }
    });

    _socket!.on('comment:created', (data) {
      for (final h in _onCommentCreated) { h(data as Map<String, dynamic>); }
    });

    _socket!.on('proposal:listChanged', (data) {
      for (final h in _onProposalListChanged) { h(data as Map<String, dynamic>); }
    });

    _socket!.connect();
  }

  void joinProposal(String proposalId) {
    _socket?.emit('join:proposal', proposalId);
  }

  void leaveProposal(String proposalId) {
    _socket?.emit('leave:proposal', proposalId);
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
    _state = SocketConnectionState.disconnected;
  }

  void dispose() {
    disconnect();
    _onProposalCreated.clear();
    _onProposalUpdated.clear();
    _onProposalDeleted.clear();
    _onProposalStatusChanged.clear();
    _onVoteCreated.clear();
    _onVoteRemoved.clear();
    _onVoteStats.clear();
    _onCommentCreated.clear();
    _onProposalListChanged.clear();
  }
}

final socketServiceProvider = Provider<SocketService>((ref) {
  return SocketService();
});
