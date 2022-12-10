import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheMeterComponent } from './the-meter.component';

describe('TheMeterComponent', () => {
  let component: TheMeterComponent;
  let fixture: ComponentFixture<TheMeterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TheMeterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TheMeterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
