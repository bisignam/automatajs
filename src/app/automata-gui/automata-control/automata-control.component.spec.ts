import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomataControlComponent } from './automata-control.component';

describe('AutomataControlComponent', () => {
  let component: AutomataControlComponent;
  let fixture: ComponentFixture<AutomataControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomataControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomataControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
