import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessConfirmationDialogComponent } from './success-confirmation-dialog.component';

describe('SuccessConfirmationDialogComponent', () => {
  let component: SuccessConfirmationDialogComponent;
  let fixture: ComponentFixture<SuccessConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessConfirmationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
