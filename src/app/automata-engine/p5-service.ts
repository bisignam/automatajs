import { Injectable, ElementRef } from '@angular/core'
import * as p5 from 'p5'
import { CellularAutomaton } from './cellularautomaton'
import { Color } from './color'
import { Grid } from './grid'
import { Pixel } from './pixel'

export class P5Service {
  private automataSize: number = 10
  private currentStep: number = 1
  private maxStep: number = 1
  private cellularAutomaton: CellularAutomaton
  private backGroundColor: Color
  private grid: Grid
  private initialConfiguration: Array<Pixel>
  private initialized: boolean = false

  constructor(automataSize: number, backGroundColor: Color, node: HTMLElement) {
    this.automataSize = automataSize
    this.backGroundColor = backGroundColor
    new p5((p: p5) => {
      p.setup = () => {
        let width = node.getBoundingClientRect().width
        let height = node.getBoundingClientRect().height
        p.colorMode(p.RGB)
        p.stroke(1)
        p.strokeWeight(1)
        p.createCanvas(width, height)
        p.background(
          backGroundColor.red,
          backGroundColor.green,
          backGroundColor.blue,
          backGroundColor.alpha
        )
        this.grid = new Grid(
          width,
          height,
          this.automataSize,
          backGroundColor,
          p
        )
        console.log('bau')
      }
      p.windowResized = () => {
        this.currentStep = 1
        this.initialized = false
        let width = node.getBoundingClientRect().width
        let height = node.getBoundingClientRect().height
        this.grid.setWidth(width)
        this.grid.setHeight(height)
        p.resizeCanvas(width, height)
        this.grid.reset(this.backGroundColor)
      }
      p.draw = () => {
        this.draw()
      }
    }, node)
  }

  public startAutomata(
    cellularAutomaton: CellularAutomaton,
    initialConfiguration: Array<Pixel>,
    maxStep: number
  ): void {
    this.initialConfiguration = initialConfiguration
    this.currentStep = 1 //reset the counter
    this.cellularAutomaton = cellularAutomaton
    this.maxStep = maxStep
  }

  private activateCell(pixel: Pixel): void {
    this.grid.activate(this.cellularAutomaton, pixel.getX(), pixel.getY())
  }

  private draw(): void {
    if (!this.initialized) {
      this.cellularAutomaton.setGrid(this.grid) //we do it here because at this point we are sure the grid is already initialized
      for (const pixel of this.initialConfiguration) {
        this.activateCell(pixel)
      }
      this.initialized = true
    }
    if (this.currentStep == this.maxStep) {
      return
    }
    this.grid.reset(this.backGroundColor)
    this.cellularAutomaton.advance()
    this.currentStep++
  }
}
