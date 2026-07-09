import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentDetail } from './equipment-detail';

describe('EquipmentDetail', () => {
  let component: EquipmentDetail;
  let fixture: ComponentFixture<EquipmentDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(EquipmentDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
