import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './equipment-list.html',
  styleUrl: './equipment-list.css'
})
export class EquipmentListComponent implements OnInit {
  equipment: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getAllEquipment().subscribe(data => {
      this.equipment = data;
    });
  }

  getHealthColor(index: number): string {
    if (index >= 80) return 'var(--success)';
    if (index >= 50) return 'var(--warning)';
    return 'var(--danger)';
  }
}
