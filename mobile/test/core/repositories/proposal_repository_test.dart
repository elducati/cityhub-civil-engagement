import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';
import 'package:cityhub_mobile/core/api/api_client.dart';
import 'package:cityhub_mobile/core/repositories/proposal_repository.dart';

class MockApiClient extends Mock implements ApiClient {}

void main() {
  late ProposalRepository repository;
  late MockApiClient mockClient;

  setUp(() {
    mockClient = MockApiClient();
    repository = ProposalRepository(mockClient);
  });

  group('list', () {
    test('should return paginated response', () async {
      final responseData = {
        'data': {
          'data': [
            {
              'id': '1',
              'title': 'Test Proposal',
              'description': 'Description',
              'author_id': 'user1',
              'status': 'OPEN',
              'vote_count': 5,
              'created_at': '2024-01-01T00:00:00.000Z',
            },
          ],
          'pagination': {
            'page': 1,
            'limit': 20,
            'total': 1,
            'total_pages': 1,
          },
        },
      };

      when(() => mockClient.get(
        any(),
        queryParameters: any(named: 'queryParameters'),
      )).thenAnswer((_) async => Response(
        data: responseData,
        statusCode: 200,
        requestOptions: RequestOptions(path: ''),
      ));

      final result = await repository.list();

      expect(result.data.length, 1);
      expect(result.data[0].title, 'Test Proposal');
      expect(result.pagination.total, 1);
    });
  });

  group('getById', () {
    test('should return single proposal', () async {
      final responseData = {
        'data': {
          'id': '1',
          'title': 'Test Proposal',
          'description': 'Description',
          'author_id': 'user1',
          'status': 'OPEN',
          'vote_count': 5,
          'created_at': '2024-01-01T00:00:00.000Z',
        },
      };

      when(() => mockClient.get(any())).thenAnswer((_) async => Response(
        data: responseData,
        statusCode: 200,
        requestOptions: RequestOptions(path: ''),
      ));

      final result = await repository.getById('1');

      expect(result.title, 'Test Proposal');
      expect(result.status, 'OPEN');
    });
  });

  group('castVote', () {
    test('should return vote response', () async {
      final responseData = {
        'data': {
          'proposal_id': '1',
          'vote_count': 6,
          'user_voted': true,
        },
      };

      when(() => mockClient.post(any())).thenAnswer((_) async => Response(
        data: responseData,
        statusCode: 200,
        requestOptions: RequestOptions(path: ''),
      ));

      final result = await repository.castVote('1');

      expect(result.proposalId, '1');
      expect(result.voteCount, 6);
      expect(result.userVoted, true);
    });
  });
}
