import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeSubmissionsComponent } from './grade-submissions.component';

describe('GradeSubmissionsComponent', () => {
  let component: GradeSubmissionsComponent;
  let fixture: ComponentFixture<GradeSubmissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradeSubmissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GradeSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
