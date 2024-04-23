import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReporteVentasPage } from './reporte-ventas.page';

describe('ReporteVentasPage', () => {
  let component: ReporteVentasPage;
  let fixture: ComponentFixture<ReporteVentasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteVentasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
