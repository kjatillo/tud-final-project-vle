import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadLectureNoteComponent } from './upload-lecture-note.component';

describe('UploadLectureNoteComponent', () => {
  let component: UploadLectureNoteComponent;
  let fixture: ComponentFixture<UploadLectureNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadLectureNoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadLectureNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
