import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltimeterComponent } from './altimeter.component';

describe('AltimeterComponent', () => {
  let component: AltimeterComponent;
  let fixture: ComponentFixture<AltimeterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AltimeterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AltimeterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
