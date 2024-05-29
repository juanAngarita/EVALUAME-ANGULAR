import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaIntentosComponent } from './tabla-intentos.component';

describe('TablaIntentosComponent', () => {
  let component: TablaIntentosComponent;
  let fixture: ComponentFixture<TablaIntentosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablaIntentosComponent]
    });
    fixture = TestBed.createComponent(TablaIntentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
