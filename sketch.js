import { Grid } from './grid.js';
import { BriansBrain } from './briansbrain.js';

let automataSize = 10;
let currentStep = 1;
let maxStep = 2000;
let cellularAutomaton;
let grid;

window.setup = function () {
    createCanvas(1000, 1000);
    frameRate(2);
    background(0);
    colorMode(RGB);
    cellularAutomaton = new BriansBrain();
    grid = new Grid(automataSize, color(100, 100, 100));
    cellularAutomaton.grid = grid;
}

window.draw = function () {
    if (currentStep == 1) {
        oscillator();
    }
    if (currentStep == maxStep) {
        return;
    }
    //grid.reset(color(100, 100, 100));
    cellularAutomaton.advance();
    currentStep++;
}

function glider() {
    grid.activate(cellularAutomaton, 10, 10);
    grid.activate(cellularAutomaton, 12, 10);
    grid.activate(cellularAutomaton, 11, 11);
    grid.activate(cellularAutomaton, 12, 11);
    grid.activate(cellularAutomaton, 11, 12);
}

function oscillator() {
    grid.activate(cellularAutomaton, 50, 50);
    grid.activate(cellularAutomaton, 50, 51);
    grid.activate(cellularAutomaton, 50, 52);
    grid.activate(cellularAutomaton, 51, 50);
}


function oscillator2() {
    grid.activate(cellularAutomaton, 50, 50);
    grid.activate(cellularAutomaton, 50, 51);
    grid.activate(cellularAutomaton, 50, 52);
    grid.activate(cellularAutomaton, 51, 50);
    grid.activate(cellularAutomaton, 52, 49);
    grid.activate(cellularAutomaton, 53, 49);
}