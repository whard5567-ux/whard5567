import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-ce-abo-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ce-abo-dashboard.html',
  styleUrl: './ce-abo-dashboard.css'
})
export class CeAboDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  stats: any = { total: 0, closed: 0, open: 0, progress: 0 };
  filters: any = { upt: [], sub_bidang: [], status: [], level_anomali: [] };
  
  selectedUpt: string[] = [];
  selectedSubBidang: string[] = [];
  selectedStatus: string[] = [];
  selectedLevelAnomali: string[] = [];
  
  detailData: any[] = [];
  subBidangDist: any[] = [];
  uptDist: any[] = [];
  uptSummary: any[] = [];
  kondisiDist: any[] = [];
  levelAnomaliDist: any[] = [];
  levelAnomaliSummary: any[] = [];
  kaSummary: any[] = [];
  uraianDist: any[] = [];
  uraianLevelDist: any[] = [];
  
  activeDropdown: string | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  lastUpdated: string = '';
  currentTime: string = '';
  
  subBidangChart: any = null;
  uptChart: any = null;
  kondisiChart: any = null;
  statusPieChart: any = null;
  levelAnomaliChart: any = null;
  uraianChart: any = null;
  uraianLevelChart: any = null;
  
  private refreshInterval: any;
  private clockInterval: any;

  private conditionColors: { [key: string]: string } = {
    '5-Critical': '#991b1b',
    '4-Poor': '#f87171',
    '3-Fair': '#fbbf24',
    '2-Good': '#10b981',
    '1-Very Good': '#3b82f6',
    'N/A': '#475569'
  };

  private getConditionColor(label: string): string {
    const key = Object.keys(this.conditionColors).find(k => String(label).includes(k)) || 'N/A';
    return this.conditionColors[key];
  }

  private getSortedConditions(data: any[]): string[] {
    const unique = Array.from(new Set(data.map(d => d.status || d.kondisi)));
    return unique.sort((a, b) => {
      const aVal = String(a).split('-')[0];
      const bVal = String(b).split('-')[0];
      return (parseInt(bVal) || 0) - (parseInt(aVal) || 0);
    });
  }

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    this.refreshInterval = setInterval(() => {
      if (!this.isLoading) this.loadData();
    }, 300000);
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.destroyCharts();
  }

  destroyCharts(): void {
    if (this.subBidangChart) this.subBidangChart.destroy();
    if (this.uptChart) this.uptChart.destroy();
    if (this.kondisiChart) this.kondisiChart.destroy();
    if (this.statusPieChart) this.statusPieChart.destroy();
    if (this.levelAnomaliChart) this.levelAnomaliChart.destroy();
    if (this.uraianChart) this.uraianChart.destroy();
  }

  updateClock(): void {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    this.currentTime = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} | ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  }

  loadData(): void {
    this.isLoading = true;
    this.apiService.getCeAboData(this.selectedUpt, this.selectedSubBidang, this.selectedStatus, this.selectedLevelAnomali).subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.filters = data.filters;
        this.subBidangDist = data.sub_bidang_dist;
        this.uptDist = data.upt_dist;
        this.kondisiDist = data.kondisi_dist;
        this.levelAnomaliDist = data.level_anomali_dist || [];
        this.kaSummary = data.ka_summary || [];
        this.uraianDist = data.uraian_dist || [];
        this.detailData = data.detail_data;
        this.lastUpdated = data.last_updated;
        
        // 1. Calculate Level Anomali Summary Table (Full Breakdown of Kondisi Akhir)
        const levelMap = new Map<string, any>();
        this.levelAnomaliDist.forEach(d => {
          const level = d.level;
          if (!levelMap.has(level)) {
            levelMap.set(level, { level: level, vg: 0, g: 0, f: 0, p: 0, c: 0, total: 0 });
          }
          const item = levelMap.get(level);
          const s = String(d.status);
          
          if (s.includes('1-')) item.vg += d.count;
          else if (s.includes('2-')) item.g += d.count;
          else if (s.includes('3-')) item.f += d.count;
          else if (s.includes('4-')) item.p += d.count;
          else if (s.includes('5-')) item.c += d.count;
          
          item.total = item.vg + item.g + item.f + item.p + item.c;
        });

        const totalOverall = Array.from(levelMap.values()).reduce((sum, item) => sum + item.total, 0);
        this.levelAnomaliSummary = Array.from(levelMap.values())
          .map(item => ({
            ...item,
            percentage: totalOverall > 0 ? (item.total / totalOverall * 100).toFixed(1) + '%' : '0%'
          }))
          .sort((a, b) => b.total - a.total);

        // 2. Calculate UPT Summary Table
        const uptMap = new Map<string, any>();
        this.uptDist.forEach(d => {
          const upt = d['UPT'];
          if (!uptMap.has(upt)) {
            uptMap.set(upt, { name: upt, open: 0, close: 0, total: 0 });
          }
          const item = uptMap.get(upt);
          const s = String(d.status);
          if (s.includes('1-') || s.includes('2-')) item.close += d.count;
          else if (s.includes('3-') || s.includes('4-') || s.includes('5-')) item.open += d.count;
          item.total = item.open + item.close;
        });
        this.uptSummary = Array.from(uptMap.values()).sort((a, b) => b.total - a.total);

        this.isLoading = false;

        setTimeout(() => {
          this.renderCharts();
        }, 0);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.detail || 'Gagal memuat data CE ABO.';
      }
    });
  }

  toggleDropdown(name: string, event: Event): void {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  @HostListener('document:click')
  closeDropdowns(): void {
    this.activeDropdown = null;
  }

  toggleFilter(type: string, value: string): void {
    let list: string[] = [];
    if (type === 'upt') list = this.selectedUpt;
    else if (type === 'sub_bidang') list = this.selectedSubBidang;
    else if (type === 'status') list = this.selectedStatus;
    else if (type === 'level_anomali') list = this.selectedLevelAnomali;

    const index = list.indexOf(value);
    if (index > -1) list.splice(index, 1);
    else list.push(value);

    this.loadData();
  }

  isSelected(type: string, value: string): boolean {
    if (type === 'upt') return this.selectedUpt.includes(value);
    if (type === 'sub_bidang') return this.selectedSubBidang.includes(value);
    if (type === 'status') return this.selectedStatus.includes(value);
    if (type === 'level_anomali') return this.selectedLevelAnomali.includes(value);
    return false;
  }

  isAllSelected(type: string): boolean {
    const available = this.filters[type] || [];
    if (available.length === 0) return false;
    let list: string[] = [];
    if (type === 'upt') list = this.selectedUpt;
    else if (type === 'sub_bidang') list = this.selectedSubBidang;
    else if (type === 'status') list = this.selectedStatus;
    else if (type === 'level_anomali') list = this.selectedLevelAnomali;
    return list.length === available.length;
  }

  toggleAll(type: string): void {
    const available = [...(this.filters[type] || [])];
    const currentlyAll = this.isAllSelected(type);
    if (currentlyAll) {
      if (type === 'upt') this.selectedUpt = [];
      else if (type === 'sub_bidang') this.selectedSubBidang = [];
      else if (type === 'status') this.selectedStatus = [];
      else if (type === 'level_anomali') this.selectedLevelAnomali = [];
    } else {
      if (type === 'upt') this.selectedUpt = available;
      else if (type === 'sub_bidang') this.selectedSubBidang = available;
      else if (type === 'status') this.selectedStatus = available;
      else if (type === 'level_anomali') this.selectedLevelAnomali = available;
    }
    this.loadData();
  }

  getSelectedLabel(type: string): string {
    let list: string[] = [];
    if (type === 'upt') list = this.selectedUpt;
    else if (type === 'sub_bidang') list = this.selectedSubBidang;
    else if (type === 'status') list = this.selectedStatus;
    else if (type === 'level_anomali') list = this.selectedLevelAnomali;

    if (list.length === 0) return 'Semua';
    const available = this.filters[type] || [];
    if (available.length > 0 && list.length === available.length) return 'Semua';
    if (list.length === 1) return list[0];
    return `${list.length} Terpilih`;
  }

  renderCharts(): void {
    this.destroyCharts();
    this.renderSubBidangChart();
    this.renderUptChart();
    this.renderKondisiChart();
    this.renderStatusPieChart();
    this.renderLevelAnomaliChart();
    this.renderUraianChart();
    this.renderUraianLevelChart();
  }

  renderUraianLevelChart(): void {
    const ctx = document.getElementById('uraianLevelChart') as HTMLCanvasElement;
    if (!ctx || this.uraianLevelDist.length === 0) return;

    const levels = Array.from(new Set(this.uraianLevelDist.map(d => d.level))).sort();
    const uraians = Array.from(new Set(this.uraianLevelDist.map(d => d.uraian))).sort();
    
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
      '#f97316', '#06b6d4', '#ec4899', '#64748b', '#d946ef',
      '#a855f7', '#14b8a6', '#facc15', '#fb7185', '#94a3b8'
    ];

    const datasets = uraians.map((uraian, index) => {
      const data = levels.map(level => {
        const found = this.uraianLevelDist.find(d => d.level === level && d.uraian === uraian);
        return found ? found.count : 0;
      });

      return {
        label: uraian,
        data: data,
        backgroundColor: colors[index % colors.length],
        borderRadius: 4
      };
    });

    if (this.uraianLevelChart) {
      this.uraianLevelChart.destroy();
    }

    this.uraianLevelChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: levels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, ticks: { color: '#8892b0', font: { weight: 'bold' } } },
          y: { stacked: true, beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#8892b0' } }
        },
        plugins: {
          legend: { position: 'bottom', labels: { color: '#8892b0', boxWidth: 10, font: { size: 9 }, padding: 15 } },
          datalabels: {
            display: (ctx) => (ctx.dataset.data[ctx.dataIndex] as number) > 0,
            color: '#fff',
            font: { weight: 'bold', size: 10 }
          }
        }
      }
    });
  }

  renderStatusPieChart(): void {
    const ctx = document.getElementById('statusPieChart') as HTMLCanvasElement;
    if (!ctx || this.kaSummary.length === 0) return;

    const sortedSummary = [...this.kaSummary].sort((a, b) => {
      const aVal = String(a.status).split('-')[0];
      const bVal = String(b.status).split('-')[0];
      return (parseInt(bVal) || 0) - (parseInt(aVal) || 0);
    });

    const labels = sortedSummary.map(d => d.status);
    const data = sortedSummary.map(d => d.count);
    const colors = labels.map(l => this.getConditionColor(l));

    this.statusPieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: '#1e293b',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#8892b0', boxWidth: 10, font: { size: 9 } } },
          datalabels: {
            color: '#fff',
            font: { weight: 'bold', size: 11 },
            formatter: (value, ctx) => {
              const total = (ctx.chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
              const pct = (value / total * 100).toFixed(1) + '%';
              return value > 0 ? `${value}\n(${pct})` : '';
            }
          }
        }
      }
    });
  }

  renderLevelAnomaliChart(): void {
    const ctx = document.getElementById('levelAnomaliChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (!this.levelAnomaliSummary || this.levelAnomaliSummary.length === 0) return;

    const labels = this.levelAnomaliSummary.map(d => d.level);
    const conditions = this.getSortedConditions(this.levelAnomaliDist);

    const datasets = conditions.map(status => {
      const data = labels.map(level => {
        const found = this.levelAnomaliDist.find(d => d.level === level && d.status === status);
        return found ? found.count : 0;
      });

      return {
        label: status,
        data: data,
        backgroundColor: this.getConditionColor(status),
        borderRadius: 4
      };
    });

    if (this.levelAnomaliChart) {
      this.levelAnomaliChart.destroy();
    }

    this.levelAnomaliChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { stacked: true, beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#8892b0', font: { size: 10 } } },
          x: { stacked: true, grid: { display: false }, ticks: { color: '#8892b0', font: { size: 10, weight: 'bold' } } }
        },
        plugins: {
          legend: { display: true, position: 'top', labels: { color: '#8892b0', boxWidth: 10, font: { size: 9 } } },
          datalabels: {
            display: (ctx) => (ctx.dataset.data[ctx.dataIndex] as number) > 0,
            color: '#fff',
            anchor: 'center',
            align: 'center',
            font: { weight: 'bold', size: 9 }
          }
        }
      }
    });
  }

  renderUraianChart(): void {
    const ctx = document.getElementById('uraianChart') as HTMLCanvasElement;
    if (!ctx || this.uraianDist.length === 0) return;

    const labels = this.uraianDist.map(d => d.uraian);
    const data = this.uraianDist.map(d => d.count);

    if (this.uraianChart) {
      this.uraianChart.destroy();
    }

    this.uraianChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Jumlah Temuan',
          data: data,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#8892b0' } },
          y: { grid: { display: false }, ticks: { color: '#8892b0', font: { size: 10 } } }
        },
        plugins: {
          legend: { display: false },
          datalabels: {
            anchor: 'end',
            align: 'right',
            color: '#fff',
            font: { weight: 'bold' },
            formatter: (value) => value
          }
        }
      }
    });
  }

  renderSubBidangChart(): void {
    const ctx = document.getElementById('subBidangChart') as HTMLCanvasElement;
    if (!ctx || this.subBidangDist.length === 0) return;

    const subBidangs = Array.from(new Set(this.subBidangDist.map(d => d['Sub Bidang'])));
    const conditions = this.getSortedConditions(this.subBidangDist);

    const datasets = conditions.map(status => {
      const data = subBidangs.map(sb => {
        const found = this.subBidangDist.find(d => d['Sub Bidang'] === sb && d.status === status);
        return found ? found.count : 0;
      });

      return {
        label: status,
        data: data,
        backgroundColor: this.getConditionColor(status)
      };
    });

    this.subBidangChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: subBidangs,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { 
          x: { stacked: true, ticks: { color: '#8892b0' } }, 
          y: { stacked: true, ticks: { color: '#8892b0' } } 
        },
        plugins: { 
          legend: { position: 'top', labels: { color: '#ccd6f6', boxWidth: 10, font: { size: 9 } } },
          datalabels: {
            display: (ctx) => ctx.dataset.data[ctx.dataIndex] as number > 0,
            color: '#fff',
            font: { weight: 'bold', size: 10 }
          }
        }
      }
    });
  }

  renderUptChart(): void {
    const ctx = document.getElementById('uptChart') as HTMLCanvasElement;
    if (!ctx || this.uptDist.length === 0) return;

    const upts = Array.from(new Set(this.uptDist.map(d => d['UPT'])));
    const conditions = this.getSortedConditions(this.uptDist);

    const datasets = conditions.map(status => {
      const data = upts.map(u => {
        const found = this.uptDist.find(d => d['UPT'] === u && d.status === status);
        return found ? found.count : 0;
      });

      return {
        label: status,
        data: data,
        backgroundColor: this.getConditionColor(status)
      };
    });

    this.uptChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: upts,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: { 
          x: { stacked: true, ticks: { color: '#8892b0' } }, 
          y: { stacked: true, ticks: { color: '#8892b0' } } 
        },
        plugins: { 
          legend: { position: 'top', labels: { color: '#ccd6f6', boxWidth: 10, font: { size: 9 } } },
          datalabels: {
            display: (ctx) => ctx.dataset.data[ctx.dataIndex] as number > 0,
            color: '#fff',
            anchor: 'center',
            align: 'center',
            font: { weight: 'bold', size: 10 }
          }
        }
      }
    });
  }

  renderKondisiChart(): void {
    const ctx = document.getElementById('kondisiChart') as HTMLCanvasElement;
    if (!ctx || this.kondisiDist.length === 0) return;

    const sortedData = [...this.kondisiDist].sort((a, b) => {
      const aVal = a.kondisi.split('-')[0];
      const bVal = b.kondisi.split('-')[0];
      return parseInt(bVal) - parseInt(aVal);
    });

    const labels = sortedData.map(d => d.kondisi);
    const data = sortedData.map(d => d.count);
    const colors = labels.map(label => this.getConditionColor(label));

    this.kondisiChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{ 
          data: data, 
          backgroundColor: colors, 
          borderColor: '#1e293b', 
          borderWidth: 2,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { position: 'bottom', labels: { color: '#8892b0', boxWidth: 12, padding: 15 } },
          datalabels: {
            color: '#fff',
            font: { weight: 'bold', size: 12 },
            formatter: (value, ctx) => {
              const total = (ctx.chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
              const pct = (value / total * 100).toFixed(1) + '%';
              return value > 0 ? `${value}\n(${pct})` : '';
            }
          }
        }
      }
    });
  }
}
