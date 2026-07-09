import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './equipment-detail.html',
  styleUrl: './equipment-detail.css'
})
export class EquipmentDetailComponent implements OnInit {
  item: any = null;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.apiService.getEquipmentDetail(id).subscribe(data => {
      this.item = data;
    });
  }

  getHealthColor(index: number): string {
    if (index >= 80) return 'var(--success)';
    if (index >= 50) return 'var(--warning)';
    return 'var(--danger)';
  }
}
