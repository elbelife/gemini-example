import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock timers for AI delay
vi.useFakeTimers();

describe('App Component', () => {
    it('renders game title and board', () => {
        render(<App />);
        expect(screen.getByText('Gomoku')).toBeInTheDocument();
        expect(screen.getByText('Five in a row to win')).toBeInTheDocument();
        // 15x15 = 225 cells
        const cells = document.querySelectorAll('.cell');
        expect(cells.length).toBe(225);
    });

    it('handles player moves in PvP', () => {
        render(<App />);
        const cells = document.querySelectorAll('.cell');

        // First move (Black)
        fireEvent.click(cells[112]); // Center-ish
        expect(screen.getByText("Player 2 (White)'s Turn")).toBeInTheDocument();
        expect(cells[112].querySelector('.stone.black')).toBeInTheDocument();

        // Second move (White)
        fireEvent.click(cells[113]);
        expect(screen.getByText("Player 1 (Black)'s Turn")).toBeInTheDocument();
        expect(cells[113].querySelector('.stone.white')).toBeInTheDocument();
    });

    it('prevents moving on occupied cell', () => {
        render(<App />);
        const cells = document.querySelectorAll('.cell');

        fireEvent.click(cells[0]); // Black
        fireEvent.click(cells[0]); // White tries same spot

        // Should still be White's turn
        expect(screen.getByText("Player 2 (White)'s Turn")).toBeInTheDocument();
        // Only one stone
        expect(cells[0].querySelectorAll('.stone').length).toBe(1);
    });

    it('resets the game', () => {
        render(<App />);
        const cells = document.querySelectorAll('.cell');
        fireEvent.click(cells[0]); // Place one

        const resetBtn = screen.getByText('New Game');
        fireEvent.click(resetBtn);

        // Board cleared
        expect(cells[0].querySelector('.stone')).not.toBeInTheDocument();
        expect(screen.getByText("Player 1 (Black)'s Turn")).toBeInTheDocument();
    });
});
