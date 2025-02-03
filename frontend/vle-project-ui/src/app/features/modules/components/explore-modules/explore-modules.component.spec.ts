import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreModulesComponent } from './explore-modules.component';

describe('ExploreModulesComponent', () => {
  let component: ExploreModulesComponent;
  let fixture: ComponentFixture<ExploreModulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreModulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreModulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
