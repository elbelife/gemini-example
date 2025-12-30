import { describe, it, expect } from 'vitest';
import { createEmptyBoard, checkWin, getComputerMove, BOARD_SIZE } from './gameLogic';

describe('Game Logic', () => {
    describe('createEmptyBoard', () => {
        it('should create a 15x15 board filled with null', () => {
            const board = createEmptyBoard();
            expect(board.length).toBe(BOARD_SIZE);
            expect(board[0].length).toBe(BOARD_SIZE);
            expect(board[0][0]).toBe(null);
        });
    });

    describe('checkWin', () => {
        it('should detect horizontal win', () => {
            const board = createEmptyBoard();
            // Place 5 black stones horizontally
            for (let i = 0; i < 5; i++) board[0][i] = 'black';

            const result = checkWin(board, 4, 0, 'black');
            expect(result).toBeTruthy();
            expect(result.length).toBeGreaterThanOrEqual(5);
        });

        it('should detect vertical win', () => {
            const board = createEmptyBoard();
            for (let i = 0; i < 5; i++) board[i][0] = 'white';

            const result = checkWin(board, 0, 4, 'white');
            expect(result).toBeTruthy();
        });

        it('should detect diagonal win', () => {
            const board = createEmptyBoard();
            for (let i = 0; i < 5; i++) board[i][i] = 'black';

            const result = checkWin(board, 4, 4, 'black');
            expect(result).toBeTruthy();
        });

        it('should return null if no win', () => {
            const board = createEmptyBoard();
            board[0][0] = 'black';
            expect(checkWin(board, 0, 0, 'black')).toBeNull();
        });
    });

    describe('AI Logic', () => {
        it('should block opponent win (Medium/Hard)', () => {
            const board = createEmptyBoard();
            // Opponent (black) has 4 in a row: (0,0) to (3,0)
            for (let i = 0; i < 4; i++) board[0][i] = 'black';

            const move = getComputerMove(board, 'medium');
            // AI should play (4,0) to block
            expect(move).toEqual({ x: 4, y: 0 });
        });

        it('should take winning move', () => {
            const board = createEmptyBoard();
            // AI (white) has 4 in a row
            for (let i = 0; i < 4; i++) board[1][i] = 'white';

            const move = getComputerMove(board, 'medium');
            expect(move).toEqual({ x: 4, y: 1 });
        });
    });
});
