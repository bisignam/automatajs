import { CellularAutomaton } from '../automata-engine/cellularautomaton';
import { BriansBrain } from '../automata-rules/briansbrain';
import { DayAndNight } from '../automata-rules/dayandnight';
import { GameOfLife } from '../automata-rules/gameoflife';
import { Maze } from '../automata-rules/maze';
import { Seeds } from '../automata-rules/seeds';
import { LifeWithoutDeath } from '../automata-rules/life-without-death';

export interface RulePreset {
  id: string;
  label: string;
  summary: string;
  createAutomaton: () => CellularAutomaton;
  matches: (automaton: CellularAutomaton) => boolean;
}

export const RULE_PRESETS: RulePreset[] = [
  {
    id: 'life',
    label: 'Game of Life',
    summary: 'Conway’s playground of gliders, blinkers, and glider guns.',
    createAutomaton: () => new GameOfLife(),
    matches: (automaton) => automaton instanceof GameOfLife,
  },
  {
    id: 'life-without-death',
    label: 'Life without Death',
    summary: 'Cells are born like Life but never die, growing crystal blooms.',
    createAutomaton: () => new LifeWithoutDeath(),
    matches: (automaton) => automaton instanceof LifeWithoutDeath,
  },
  {
    id: 'brians-brain',
    label: "Brian's Brain",
    summary: 'Neurons fire once, then fade like neon trails.',
    createAutomaton: () => new BriansBrain(),
    matches: (automaton) => automaton instanceof BriansBrain,
  },
  {
    id: 'seeds',
    label: 'Seeds',
    summary: 'Hyper-reactive cells ignite and disappear every tick.',
    createAutomaton: () => new Seeds(),
    matches: (automaton) => automaton instanceof Seeds,
  },
  {
    id: 'maze',
    label: 'Maze',
    summary: 'Birth rules carve angular corridors until a maze appears.',
    createAutomaton: () => new Maze(),
    matches: (automaton) => automaton instanceof Maze,
  },
  {
    id: 'day-night',
    label: 'Day & Night',
    summary: 'Symmetric births keep yin-yang ripples balanced.',
    createAutomaton: () => new DayAndNight(),
    matches: (automaton) => automaton instanceof DayAndNight,
  },
];
