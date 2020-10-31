import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { AppComponent } from "./app.component";
import { P5Service } from "./automata-engine/p5-service";
import { Color } from "./automata-engine/color";
import { DomSanitizer } from "@angular/platform-browser";
import { MatIconRegistry } from "@angular/material/icon";
import { Grid } from "./automata-engine/grid";

describe("AppComponent", () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  const grid = new Grid(100, 100, 100);
  let p5ServiceMock;
  let domSanitizerMock;
  let matIconRegistryMock;

  beforeEach(() => {
    grid.backgroundColor = new Color(0, 0, 0);
    grid.gridColor = new Color(0, 0, 0);
    p5ServiceMock = jasmine.createSpyObj("p5ServiceMock", [
      "reDraw",
      "grid",
      "cellularAutomaton",
    ]);
    // spyOnProperty(p5ServiceMock, "grid", "get").and.returnValue(grid);
    domSanitizerMock = jasmine.createSpyObj("domSanitizerMock", [
      "bypassSecurityTrustResourceUrl",
    ]);
    matIconRegistryMock = jasmine.createSpyObj("matIconRegistryMock", [
      "addSvgIcon",
    ]);
  });

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AppComponent],
        providers: [P5Service],
      });
      TestBed.overrideProvider(P5Service, {
        useValue: p5ServiceMock,
      });
      TestBed.overrideProvider(DomSanitizer, {
        useValue: domSanitizerMock,
      });
      TestBed.overrideProvider(MatIconRegistry, {
        useValue: matIconRegistryMock,
      });
      TestBed.compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("background color should change", () => {
    const newBackgroundColor = new Color(100, 76, 11);
    component.onBackgroundColorChosen(newBackgroundColor);
    expect(p5ServiceMock.grid.backgroundColor.red).toBe(100);
    expect(p5ServiceMock.grid.backgroundColor.green).toBe(76);
    expect(p5ServiceMock.grid.backgroundColor.blue).toBe(11);
    expect(p5ServiceMock.reDraw.calls.count()).toBe(1);
  });

  it("grid color should change", () => {
    const newGridColor = new Color(5, 89, 4);
    component.onGridColorChosen(newGridColor);
    expect(p5ServiceMock.grid.gridColor.red).toBe(5);
    expect(p5ServiceMock.grid.gridColor.green).toBe(89);
    expect(p5ServiceMock.grid.gridColor.blue).toBe(4);
    expect(p5ServiceMock.reDraw.calls.count()).toBe(1);
  });
});
