import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomataCanvasComponent } from './automata-canvas.component';

describe('AutomataCanvasComponent', () => {
  let component: AutomataCanvasComponent;
  let fixture: ComponentFixture<AutomataCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomataCanvasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomataCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
