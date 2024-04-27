import { TestBed } from '@angular/core/testing';

import { GraficaRubberService } from './grafica-rubber.service';

describe('GraficaRubberService', () => {
  let service: GraficaRubberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraficaRubberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
