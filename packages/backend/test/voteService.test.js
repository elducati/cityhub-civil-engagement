"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const voteService = __importStar(require("../src/services/voteService"));
jest.mock('../src/config/database', () => ({
    getDatabase: jest.fn(),
}));
jest.mock('../src/services/auditService', () => ({
    createAuditLog: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../src/services/cacheService', () => ({
    checkUserVoted: jest.fn(),
    setUserVoted: jest.fn(),
    removeUserVote: jest.fn(),
    incrementVoteBuffer: jest.fn(),
    deleteCachePattern: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../src/services/queueService', () => ({
    publishVoteMessage: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../src/services/auditService', () => ({
    createAuditLog: jest.fn().mockResolvedValue(undefined),
}));
const { getDatabase } = require('../src/config/database');
const { checkUserVoted, setUserVoted, removeUserVote, incrementVoteBuffer, deleteCachePattern } = require('../src/services/cacheService');
const { publishVoteMessage } = require('../src/services/queueService');
const { createAuditLog } = require('../src/services/auditService');
describe('voteService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('castVote', () => {
        it('should cast a vote successfully', async () => {
            checkUserVoted.mockResolvedValue(false);
            setUserVoted.mockResolvedValue(undefined);
            incrementVoteBuffer.mockResolvedValue(undefined);
            publishVoteMessage.mockResolvedValue(undefined);
            deleteCachePattern.mockResolvedValue(undefined);
            createAuditLog.mockResolvedValue(undefined);
            const mockDb = jest.fn().mockReturnValue({
                where: jest.fn().mockReturnThis(),
                first: jest.fn()
                    .mockResolvedValueOnce({
                    id: 'proposal-1',
                    author_id: 'author-1',
                    status: 'OPEN',
                    vote_count: 5,
                })
                    .mockResolvedValueOnce(undefined)
                    .mockResolvedValueOnce({ vote_count: 6 }),
                insert: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue([{ id: 'vote-1' }]),
                increment: jest.fn().mockReturnThis(),
                del: jest.fn().mockResolvedValue(1),
            });
            getDatabase.mockReturnValue(mockDb);
            const result = await voteService.castVote('proposal-1', 'voter-1');
            expect(result.proposalId).toBe('proposal-1');
            expect(result.userVoted).toBe(true);
            expect(setUserVoted).toHaveBeenCalledWith('voter-1', 'proposal-1');
        });
        it('should throw error if proposal not found', async () => {
            checkUserVoted.mockResolvedValue(false);
            const mockDb = jest.fn().mockReturnValue({
                where: jest.fn().mockReturnThis(),
                first: jest.fn().mockResolvedValue(undefined),
            });
            getDatabase.mockReturnValue(mockDb);
            await expect(voteService.castVote('non-existent', 'voter-1')).rejects.toThrow('Proposal not found');
        });
        it('should throw error if proposal is not open', async () => {
            checkUserVoted.mockResolvedValue(false);
            const mockDb = jest.fn().mockReturnValue({
                where: jest.fn().mockReturnThis(),
                first: jest.fn().mockResolvedValue({
                    id: 'proposal-1',
                    author_id: 'author-1',
                    status: 'CLOSED',
                }),
            });
            getDatabase.mockReturnValue(mockDb);
            await expect(voteService.castVote('proposal-1', 'voter-1')).rejects.toThrow('Proposal is not open for voting');
        });
        it('should throw error if user is the author', async () => {
            checkUserVoted.mockResolvedValue(false);
            const mockDb = jest.fn().mockReturnValue({
                where: jest.fn().mockReturnThis(),
                first: jest.fn().mockResolvedValue({
                    id: 'proposal-1',
                    author_id: 'author-1',
                    status: 'OPEN',
                }),
            });
            getDatabase.mockReturnValue(mockDb);
            await expect(voteService.castVote('proposal-1', 'author-1')).rejects.toThrow('Cannot vote on your own proposal');
        });
        it('should throw error if already voted (cached)', async () => {
            checkUserVoted.mockResolvedValue(true);
            await expect(voteService.castVote('proposal-1', 'voter-1')).rejects.toThrow('Already voted on this proposal');
        });
        it('should throw error if already voted (database)', async () => {
            checkUserVoted.mockResolvedValue(false);
            const mockDb = jest.fn().mockReturnValue({
                where: jest.fn().mockReturnThis(),
                first: jest.fn()
                    .mockResolvedValueOnce({
                    id: 'proposal-1',
                    author_id: 'author-1',
                    status: 'OPEN',
                })
                    .mockResolvedValueOnce({ id: 'existing-vote' }),
            });
            getDatabase.mockReturnValue(mockDb);
            await expect(voteService.castVote('proposal-1', 'voter-1')).rejects.toThrow('Already voted on this proposal');
        });
    });
    describe('removeVote', () => {
        it('should remove vote successfully', async () => {
            removeUserVote.mockResolvedValue(undefined);
            publishVoteMessage.mockResolvedValue(undefined);
            deleteCachePattern.mockResolvedValue(undefined);
            createAuditLog.mockResolvedValue(undefined);
            const mockDb = jest.fn().mockReturnValue({
                where: jest.fn().mockReturnThis(),
                first: jest.fn()
                    .mockResolvedValueOnce({
                    id: 'proposal-1',
                    vote_count: 5,
                })
                    .mockResolvedValueOnce({
                    id: 'vote-1',
                    proposal_id: 'proposal-1',
                    user_id: 'voter-1',
                })
                    .mockResolvedValueOnce({ vote_count: 4 }),
                del: jest.fn().mockReturnThis(),
                decrement: jest.fn().mockReturnThis(),
            });
            getDatabase.mockReturnValue(mockDb);
            const result = await voteService.removeVote('proposal-1', 'voter-1');
            expect(result.proposalId).toBe('proposal-1');
            expect(result.userVoted).toBe(false);
            expect(result.voteCount).toBe(4);
            expect(removeUserVote).toHaveBeenCalledWith('voter-1', 'proposal-1');
        });
        it('should throw error if proposal not found', async () => {
            const mockDb = jest.fn().mockReturnValue({
                where: jest.fn().mockReturnThis(),
                first: jest.fn().mockResolvedValue(undefined),
            });
            getDatabase.mockReturnValue(mockDb);
            await expect(voteService.removeVote('non-existent', 'voter-1')).rejects.toThrow('Proposal not found');
        });
        it('should throw error if vote not found', async () => {
            const mockDb = jest.fn().mockReturnValue({
                where: jest.fn().mockReturnThis(),
                first: jest.fn()
                    .mockResolvedValueOnce({
                    id: 'proposal-1',
                    vote_count: 5,
                })
                    .mockResolvedValueOnce(undefined),
            });
            getDatabase.mockReturnValue(mockDb);
            await expect(voteService.removeVote('proposal-1', 'voter-1')).rejects.toThrow('Vote not found');
        });
    });
    describe('hasUserVoted', () => {
        it('should return true if user has voted (cached)', async () => {
            checkUserVoted.mockResolvedValue(true);
            const result = await voteService.hasUserVoted('voter-1', 'proposal-1');
            expect(result).toBe(true);
        });
        it('should return true if user has voted (database)', async () => {
            checkUserVoted.mockResolvedValue(false);
            setUserVoted.mockResolvedValue(undefined);
            const mockDb = jest.fn().mockReturnValue({
                where: jest.fn().mockReturnThis(),
                first: jest.fn().mockResolvedValue({ id: 'vote-1' }),
            });
            getDatabase.mockReturnValue(mockDb);
            const result = await voteService.hasUserVoted('voter-1', 'proposal-1');
            expect(result).toBe(true);
            expect(setUserVoted).toHaveBeenCalledWith('voter-1', 'proposal-1');
        });
        it('should return false if user has not voted', async () => {
            checkUserVoted.mockResolvedValue(false);
            const mockDb = jest.fn().mockReturnValue({
                where: jest.fn().mockReturnThis(),
                first: jest.fn().mockResolvedValue(undefined),
            });
            getDatabase.mockReturnValue(mockDb);
            const result = await voteService.hasUserVoted('voter-1', 'proposal-1');
            expect(result).toBe(false);
        });
    });
});
//# sourceMappingURL=voteService.test.js.map