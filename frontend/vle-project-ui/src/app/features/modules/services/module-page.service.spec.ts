import { TestBed } from '@angular/core/testing';

import { ModulePageService } from './module-page.service';

describe('ModulePageService', () => {
  let service: ModulePageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModulePageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
