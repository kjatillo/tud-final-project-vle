import { TestBed } from '@angular/core/testing';

import { ModuleContentService } from './module-content.service';

describe('ModuleContentService', () => {
  let service: ModuleContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModuleContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
