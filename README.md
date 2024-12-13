# Game of Life

This project implements Conway's Game of Life using React and custom hooks. The Game of Life is a cellular automaton devised by mathematician John Conway, where cells on a grid evolve through generations based on a set of rules.

## Features

- **Custom Hook**: The `useGameOfLife` hook manages the game's grid, state, and history.
- **Grid Manipulation**: Toggle individual cells, reset the grid, or clean the grid entirely.
- **Simulation Controls**:
  - Play/Pause the simulation.
  - Step to the next generation manually.
- **State Persistence**:
  - Automatically save the current grid, generation count, and history to `localStorage`.
  - Load the saved state on initialization.
- **History Navigation**:
  - Navigate to previous or future generations using history.
- **Export Grid**: Export the current grid as a JSON file.
- **Colored version**: Visually distinguish different patterns within the game

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd game-of-life
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server (for dev purpose):
   ```bash
   npm run dev
   ```
   The app will be available : http://localhost:5173/
5. Or you can also start a built version for demonstration, it's fastest and has better performance :
   ```bash
     npm run build && npm run preview
   ```
   The app will be available at : http://localhost:4173/

## Technical Stack

This project leverages the following technologies:

- **React**: For building the user interface and managing component state.
- **Custom Hooks**: To encapsulate and reuse the game logic (`useGameOfLife`).
- **TypeScript**: Provides type safety and ensures a robust implementation.
- **LocalStorage**: For persisting the game state across sessions.

## Implementation Details

- The grid is represented as a canvas based 2D array of cells, each containing an `alive` state and optional metadata such as `color`.
- The `useGameOfLife` hook manages the grid's state, including:
  - Current grid structure.
  - History of generations for time travel.
  - Persistent state saved in `localStorage`.
- Neighbor calculations and grid updates follow Conway's rules to determine the next generation.
- Performance optimizations include memoized functions and conditional history updates to avoid redundant calculations.

## Deployment

- This app is deployed automatically on Vercel and is available here : https://game-of-life-psi-red.vercel.app/
