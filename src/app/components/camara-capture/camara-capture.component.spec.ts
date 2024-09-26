import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CamaraCaptureComponent } from './camara-capture.component';

describe('CamaraCaptureComponent', () => {
  let component: CamaraCaptureComponent;
  let fixture: ComponentFixture<CamaraCaptureComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CamaraCaptureComponent]
    });
    fixture = TestBed.createComponent(CamaraCaptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
