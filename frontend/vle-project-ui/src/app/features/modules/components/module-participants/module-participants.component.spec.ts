import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleParticipantsComponent } from './module-participants.component';

describe('ModuleParticipantsComponent', () => {
  let component: ModuleParticipantsComponent;
  let fixture: ComponentFixture<ModuleParticipantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleParticipantsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleParticipantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
