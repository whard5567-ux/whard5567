import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  recentEquipment: any[] = [];
  isUploading = false;
  uploadMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getDashboardStats().subscribe(data => {
      this.stats = data;
    });

    this.apiService.getAllEquipment().subscribe(data => {
      this.recentEquipment = data.slice(0, 3);
    });
  }

  getHealthColor(index: number): string {
    if (index >= 80) return 'var(--success)';
    if (index >= 50) return 'var(--warning)';
    return 'var(--danger)';
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.uploadMessage = 'Uploading...';
      this.apiService.uploadEquipment(file).subscribe({
        next: (response) => {
          this.isUploading = false;
          this.uploadMessage = 'Success: ' + response.message;
          this.loadData();
          setTimeout(() => this.uploadMessage = '', 3000);
        },
        error: (err) => {
          this.isUploading = false;
          this.uploadMessage = 'Error: ' + (err.error?.detail || 'Upload failed');
          setTimeout(() => this.uploadMessage = '', 5000);
        }
      });
    }
  }
}
