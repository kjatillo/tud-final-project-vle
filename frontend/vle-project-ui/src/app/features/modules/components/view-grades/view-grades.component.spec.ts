import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGradesComponent } from './view-grades.component';

describe('ViewGradesComponent', () => {
  let component: ViewGradesComponent;
  let fixture: ComponentFixture<ViewGradesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewGradesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewGradesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
