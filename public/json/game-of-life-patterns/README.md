# Game of Life Patterns Collection

A curated collection of classic patterns for Conway's Game of Life.

## Categories

### Oscillators
Patterns that repeat after a certain number of generations
- Blinker (Period 2)
- Toad (Period 2)
- Beacon (Period 2)
- Pulsar (Period 3)
- Pentadecathlon (Period 15)

### Still Life
Patterns that remain unchanged from one generation to the next
- Block
- Beehive
- Loaf
- Boat

### Spaceships
Patterns that translate across the grid
- Glider

## Pattern Format
Each pattern is stored in JSON format with:
- name: Pattern name
- type: Pattern category
- period: Number of generations before pattern repeats
- grid: 2D array representing the pattern state

## Usage
These patterns can be imported into any Game of Life implementation that follows
the specified JSON structure for cell states: `{ "alive": boolean }`.
