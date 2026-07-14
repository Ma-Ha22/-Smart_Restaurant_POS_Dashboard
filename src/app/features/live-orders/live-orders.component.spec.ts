import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveOrdersComponent } from './live-orders.component';

describe('LiveOrdersComponent', () => {
  let component: LiveOrdersComponent;
  let fixture: ComponentFixture<LiveOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveOrdersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LiveOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
