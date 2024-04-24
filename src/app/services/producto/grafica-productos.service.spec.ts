import { TestBed } from '@angular/core/testing';

import { GraficaProductosService } from './grafica-productos.service';

describe('GraficaProductosService', () => {
  let service: GraficaProductosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraficaProductosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
