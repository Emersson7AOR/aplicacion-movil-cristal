import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Prueba2Page } from './prueba2.page';

describe('Prueba2Page', () => {
  let component: Prueba2Page;
  let fixture: ComponentFixture<Prueba2Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Prueba2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
