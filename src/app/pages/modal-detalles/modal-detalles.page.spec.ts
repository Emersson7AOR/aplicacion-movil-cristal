import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalDetallesPage } from './modal-detalles.page';

describe('ModalDetallesPage', () => {
  let component: ModalDetallesPage;
  let fixture: ComponentFixture<ModalDetallesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDetallesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
