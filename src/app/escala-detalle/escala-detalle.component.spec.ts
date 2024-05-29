import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscalaDetalleComponent } from './escala-detalle.component';

describe('EscalaDetalleComponent', () => {
  let component: EscalaDetalleComponent;
  let fixture: ComponentFixture<EscalaDetalleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EscalaDetalleComponent]
    });
    fixture = TestBed.createComponent(EscalaDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
