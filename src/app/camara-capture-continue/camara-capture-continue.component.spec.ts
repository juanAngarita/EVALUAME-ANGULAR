import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CamaraCaptureContinueComponent } from './camara-capture-continue.component';

describe('CamaraCaptureContinueComponent', () => {
  let component: CamaraCaptureContinueComponent;
  let fixture: ComponentFixture<CamaraCaptureContinueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CamaraCaptureContinueComponent]
    });
    fixture = TestBed.createComponent(CamaraCaptureContinueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
