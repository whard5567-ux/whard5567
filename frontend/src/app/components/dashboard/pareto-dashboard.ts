import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-pareto-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pareto-dashboard.html',
  styleUrl: './pareto-dashboard.css'
})
export class ParetoDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  paretoData: any[] = [];
  unitData: any[] = [];
  trendData: any[] = [];
  detailData: any[] = [];
  filters: any = { bulan: [], tahun: [], unit: [], kategory: [] };
  
  selectedBulan: string[] = [];
  selectedTahun: string[] = [];
  selectedUnit: string[] = [];
  selectedKategory: string[] = [];
  
  activeDropdown: string | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  lastUpdated: string = '';
  currentTime: string = '';
  chart: any = null;
  unitChart: any = null;
  trendChart: any = null;
  yoyChart: any = null;
  totalCount: number = 0;
  private refreshInterval: any;
  private clockInterval: any;

  // Presentation Mode State
  isPresentationMode: boolean = false;
  currentSlide: number = 1;
  totalSlides: number = 3;

  // Shared color palette - SOLID Vibrant Colors
  private chartColors: string[] = [
    '#3b82f6', // Blue (Index 0)
    '#ef4444', // Red
    '#f59e0b', // Amber/Yellow
    '#10b981', // Green
    '#8b5cf6', // Violet
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#64748b', // Slate
    '#d946ef', // Fuchsia
  ];

  // Map to store category colors deterministically
  private categoryColorMap: Map<string, string> = new Map();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadParetoData();
    this.updateClock();
    
    // Update clock every second
    this.clockInterval = setInterval(() => {
      this.updateClock();
    }, 1000);
    
    // Auto refresh data every 5 minutes (300,000 ms)
    this.refreshInterval = setInterval(() => {
      if (!this.isLoading) {
        this.loadParetoData();
      }
    }, 300000);
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    if (this.chart) this.chart.destroy();
    if (this.unitChart) this.unitChart.destroy();
    if (this.trendChart) this.trendChart.destroy();
    if (this.yoyChart) this.yoyChart.destroy();
  }

  updateClock(): void {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    this.currentTime = `${dayName}, ${date} ${monthName} ${year} | ${hours}:${minutes}:${seconds}`;
  }

  togglePresentationMode(): void {
    const element = document.getElementById('dashboardContainer');
    if (!element) return;

    if (!this.isPresentationMode) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
      this.isPresentationMode = true;
      this.currentSlide = 1;
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      this.isPresentationMode = false;
    }
  }

  nextSlide(): void {
    this.currentSlide = this.currentSlide >= this.totalSlides ? 1 : this.currentSlide + 1;
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide <= 1 ? this.totalSlides : this.currentSlide - 1;
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    if (!document.fullscreenElement) {
      this.isPresentationMode = false;
    }
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
    if (type === 'bulan') list = this.selectedBulan;
    else if (type === 'tahun') list = this.selectedTahun;
    else if (type === 'unit') list = this.selectedUnit;
    else if (type === 'kategory') list = this.selectedKategory;

    const index = list.indexOf(value);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(value);
    }

    // Urutkan bulan secara kronologis jika tipe adalah bulan
    if (type === 'bulan') {
      this.selectedBulan = this.sortMonths([...this.selectedBulan]);
    }

    this.loadParetoData();
  }

  isSelected(type: string, value: string): boolean {
    if (type === 'bulan') return this.selectedBulan.includes(value);
    if (type === 'tahun') return this.selectedTahun.includes(value);
    if (type === 'unit') return this.selectedUnit.includes(value);
    if (type === 'kategory') return this.selectedKategory.includes(value);
    return false;
  }

  getSelectedLabel(type: string): string {
    let list: string[] = [];
    if (type === 'bulan') list = this.selectedBulan;
    else if (type === 'tahun') list = this.selectedTahun;
    else if (type === 'unit') list = this.selectedUnit;
    else if (type === 'kategory') list = this.selectedKategory;

    if (list.length === 0) return 'Semua';

    // Check if all available are selected
    const available = this.filters[type] || [];
    if (available.length > 0 && list.length === available.length) return 'Semua';

    if (list.length === 1) return list[0];
    return `${list.length} Terpilih`;
  }

  isAllSelected(type: string): boolean {
    const available = this.filters[type] || [];
    if (available.length === 0) return false;

    let list: string[] = [];
    if (type === 'bulan') list = this.selectedBulan;
    else if (type === 'tahun') list = this.selectedTahun;
    else if (type === 'unit') list = this.selectedUnit;
    else if (type === 'kategory') list = this.selectedKategory;

    return list.length === available.length;
  }

  toggleAll(type: string): void {
    const available = [...(this.filters[type] || [])];
    const currentlyAll = this.isAllSelected(type);

    if (currentlyAll) {
      // Unselect all
      if (type === 'bulan') this.selectedBulan = [];
      else if (type === 'tahun') this.selectedTahun = [];
      else if (type === 'unit') this.selectedUnit = [];
      else if (type === 'kategory') this.selectedKategory = [];
    } else {
      // Select all
      if (type === 'bulan') this.selectedBulan = available;
      else if (type === 'tahun') this.selectedTahun = available;
      else if (type === 'unit') this.selectedUnit = available;
      else if (type === 'kategory') this.selectedKategory = available;
    }
    this.loadParetoData();
  }

  private assignColors(allCategories: string[]) {
    this.categoryColorMap.clear();
    
    // Sort: 'ALAT' first, then alphabetical
    const sorted = [...allCategories].sort((a, b) => {
      const aUp = (a || '').trim().toUpperCase();
      const bUp = (b || '').trim().toUpperCase();
      if (aUp === 'ALAT') return -1;
      if (bUp === 'ALAT') return 1;
      return aUp.localeCompare(bUp);
    });

    sorted.forEach((cat, index) => {
      const clean = (cat || '').trim();
      if (clean) {
        this.categoryColorMap.set(clean, this.chartColors[index % this.chartColors.length]);
      }
    });
    console.log('Category Color Map:', Object.fromEntries(this.categoryColorMap));
  }

  private getColor(cat: string): string {
    const key = (cat || '').trim();
    return this.categoryColorMap.get(key) || '#94a3b8';
  }

  private sortMonths(months: string[]): string[] {
    const monthMap: { [key: string]: number } = {
      'JANUARI': 1, 'JANUARY': 1, 'JAN': 1,
      'FEBRUARI': 2, 'FEBRUARY': 2, 'FEB': 2,
      'MARET': 3, 'MARCH': 3, 'MAR': 3,
      'APRIL': 4, 'APR': 4,
      'MEI': 5, 'MAY': 5,
      'JUNI': 6, 'JUNE': 6, 'JUN': 6,
      'JULI': 7, 'JULY': 7, 'JUL': 7,
      'AGUSTUS': 8, 'AUGUST': 8, 'AGS': 8, 'AUG': 8,
      'SEPTEMBER': 9, 'SEP': 9,
      'OKTOBER': 10, 'OCTOBER': 10, 'OKT': 10, 'OCT': 10,
      'NOVEMBER': 11, 'NOV': 11,
      'DESEMBER': 12, 'DECEMBER': 12, 'DES': 12, 'DEC': 12
    };
    return months.sort((a, b) => {
      return (monthMap[a.toUpperCase().trim()] || 99) - (monthMap[b.toUpperCase().trim()] || 99);
    });
  }

  loadParetoData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.apiService.getParetoData(
      this.selectedBulan, 
      this.selectedTahun, 
      this.selectedUnit, 
      this.selectedKategory
    ).subscribe({
      next: (data) => {
        this.paretoData = data.pareto_data;
        this.unitData = data.unit_data;
        this.trendData = data.trend_data || [];
        this.detailData = data.detail_data || [];
        this.filters = data.filters;
        this.lastUpdated = data.last_updated || '';
        
        // Pastikan bulan di filter selalu terurut secara kronologis
        if (this.filters.bulan) {
          this.filters.bulan = this.sortMonths(this.filters.bulan);
        }

        this.totalCount = this.paretoData.reduce((acc, curr) => acc + curr.count, 0);
        
        // BUILD COLOR MAP ONCE
        this.assignColors(this.filters.kategory || []);

        this.isLoading = false;
        
        if (this.paretoData.length > 0 || this.unitData.length > 0) {
          setTimeout(() => {
            this.renderChart();
            this.renderUnitChart();
            this.renderTrendChart();
            this.renderYoYChart();
          }, 0);
        }
      },
      error: (err) => {
        console.error('Error fetching pareto data', err);
        this.isLoading = false;
        this.errorMessage = err.error?.detail || 'Gagal memuat data dari server.';
      }
    });
  }

  renderChart(): void {
    const ctx = document.getElementById('paretoChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.paretoData.map(item => item.kategory);
    const counts = this.paretoData.map(item => item.count);
    const bgColors = labels.map(cat => this.getColor(cat));

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            data: counts,
            backgroundColor: bgColors,
            borderColor: '#1e293b',
            borderWidth: 2,
            hoverOffset: 15
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 20 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 15, color: '#8892b0' }
          },
          datalabels: {
            color: '#fff',
            font: { weight: 'bold', size: 11 },
            formatter: (value, ctx) => {
              let sum = 0;
              let dataArr = ctx.chart.data.datasets[0].data as number[];
              dataArr.forEach(data => sum += data);
              let percentage = (value * 100 / sum).toFixed(1) + "%";
              return `${value}\n(${percentage})`;
            }
          }
        }
      }
    });
  }

  renderUnitChart(): void {
    const ctx = document.getElementById('unitChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.unitChart) {
      this.unitChart.destroy();
    }

    const unitsSet = new Set<string>();
    const categoriesSet = new Set<string>();
    const unitTotals: { [key: string]: number } = {};

    this.unitData.forEach(item => {
      if (item.unit) unitsSet.add(item.unit);
      if (item.kategory) categoriesSet.add(item.kategory);
      
      if (item.unit) {
        if (!unitTotals[item.unit]) unitTotals[item.unit] = 0;
        unitTotals[item.unit] += item.count || 0;
      }
    });

    const labels = Array.from(unitsSet).sort((a, b) => unitTotals[b] - unitTotals[a]);
    console.log('Unit Chart Labels:', labels);
    const categories = Array.from(categoriesSet).sort();

    const datasets: any[] = categories.map(cat => {
      const data = labels.map(unit => {
        const records = this.unitData.filter(item => item.unit === unit && item.kategory === cat);
        return records.reduce((sum, record) => sum + (record.count || 0), 0);
      });

      return {
        label: cat,
        data: data,
        backgroundColor: this.getColor(cat),
        borderColor: '#1e293b',
        borderWidth: 1,
        stack: 'stack0',
        datalabels: {
          display: true,
          color: '#fff',
          formatter: (val: any) => val > 0 ? val : ''
        }
      };
    });

    // Add an extra dataset for the total label at the end of the bar
    if (labels.length > 0) {
      datasets.push({
        label: 'Total Label',
        data: labels.map(() => 0), // Use 0 to not increase bar length
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        stack: 'stack0', // Same stack so it's positioned at the end
        datalabels: {
          anchor: 'end',
          align: 'right',
          offset: 8,
          color: '#ccd6f6',
          font: {
            weight: 'bold',
            size: 13
          },
          formatter: (val: any, ctx: any) => {
            const unit = labels[ctx.dataIndex];
            return unitTotals[unit]; // Show the actual calculated total
          },
          display: true
        }
      });
    }

    this.unitChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels, // Use original unit names as keys
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        layout: {
          padding: {
            left: 20, 
            right: 40
          }
        },
        scales: {
          x: { 
            stacked: true, 
            beginAtZero: true, 
            grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
            ticks: { color: '#8892b0' },
            suggestedMax: Math.max(...Object.values(unitTotals)) * 1.2 
          },
          y: { 
            stacked: true, 
            grid: { display: false }, 
            ticks: { 
              color: '#8892b0',
              autoSkip: false
            } 
          }
        },
        plugins: {
          legend: { 
            position: 'bottom',
            labels: { 
              color: '#8892b0', 
              boxWidth: 12, 
              padding: 10,
              filter: (item: any) => !['Total', 'Total Label'].includes(item.text)
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                if (['Total', 'Total Label'].includes(context.dataset.label)) return undefined;
                return `${context.dataset.label}: ${context.raw}`;
              }
            }
          },
          datalabels: {
            display: (context: any) => {
              return context.dataset.label === 'Total Label' || (context.dataset.data[context.dataIndex] > 0);
            }
          }
        }
      }
    });
  }

  renderTrendChart(): void {
    const ctx = document.getElementById('trendChart') as HTMLCanvasElement;
    if (!ctx || this.trendData.length === 0) return;

    if (this.trendChart) {
      this.trendChart.destroy();
    }

    const idMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const enMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    let months = idMonths;
    if (this.trendData.length > 0) {
      const sample = this.trendData[0].Bulan;
      const isEnglish = enMonths.some(m => m.toLowerCase() === sample.toLowerCase());
      const baseList = isEnglish ? enMonths : idMonths;
      if (sample === sample.toUpperCase()) months = baseList.map(m => m.toUpperCase());
      else if (sample === sample.toLowerCase()) months = baseList.map(m => m.toLowerCase());
      else months = baseList;
    }
    
    const yearGroups: { [key: string]: any[] } = {};
    this.trendData.forEach(item => {
      const year = item.Tahun.toString();
      if (!yearGroups[year]) yearGroups[year] = [];
      yearGroups[year].push(item);
    });

    const years = Object.keys(yearGroups).sort();
    const colors = ['#fbbf24', '#38bdf8', '#f87171', '#4ade80', '#c084fc', '#fb923c', '#2dd4bf'];

    const datasets = years.map((year, index) => {
      const color = colors[index % colors.length];
      const data = months.map(month => {
        // Aggregate all categories for this month/year
        const items = yearGroups[year].filter(d => d.Bulan.trim().toLowerCase() === month.toLowerCase());
        return items.reduce((sum, item) => sum + item.count, 0);
      });

      return {
        label: `Tahun ${year}`,
        data: data,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 3,
        pointBackgroundColor: color,
        pointRadius: 4,
        fill: false,
        tension: 0.3
      };
    });

    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: { labels: months, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#8892b0' } },
          x: { grid: { display: false }, ticks: { color: '#8892b0', font: { size: 10 } } }
        },
        plugins: {
          datalabels: {
            anchor: 'end', align: 'top', 
            color: (context) => (context.dataset as any).borderColor,
            font: { weight: 'bold', size: 10 },
            formatter: (value) => value > 0 ? value : ''
          },
          legend: { display: true, position: 'top', labels: { color: '#ccd6f6', boxWidth: 15, padding: 15 } }
        }
      }
    });
  }

  renderYoYChart(): void {
    const ctx = document.getElementById('yoyChart') as HTMLCanvasElement;
    if (!ctx || this.trendData.length === 0) return;

    if (this.yoyChart) {
      this.yoyChart.destroy();
    }

    // Get unique categories and years
    const categoriesSet = new Set<string>();
    const yearsSet = new Set<string>();
    
    this.trendData.forEach(item => {
      if (item.kategory) categoriesSet.add(item.kategory);
      yearsSet.add(item.Tahun.toString());
    });

    const categories = Array.from(categoriesSet).sort();
    const years = Array.from(yearsSet).sort((a, b) => parseInt(a) - parseInt(b));

    const datasets: any[] = [];

    // 1. Tambahkan dataset TOTAL KUMULATIF PER TAHUN (Garis Paling Tebal)
    const totalData = years.map(year => {
      const items = this.trendData.filter(d => d.Tahun.toString() === year);
      return items.reduce((sum, item) => sum + item.count, 0);
    });

    datasets.push({
      label: 'TOTAL SELURUH GANGGUAN',
      data: totalData,
      borderColor: '#ffffff', // Putih Terang
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 6, // Sangat Tebal
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#fbbf24',
      pointRadius: 7,
      pointHoverRadius: 9,
      fill: false,
      tension: 0.3,
      zIndex: 10, // Pastikan di atas
      datalabels: {
        display: true,
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 4,
        padding: 4,
        font: { weight: 'bold', size: 12 }
      }
    });

    // 2. Tambahkan dataset per Kategori
    categories.forEach(cat => {
      const color = this.getColor(cat);
      const data = years.map(year => {
        const items = this.trendData.filter(d => 
          d.Tahun.toString() === year && 
          (d.kategory || '').toString().trim() === cat.trim()
        );
        return items.reduce((sum, item) => sum + item.count, 0);
      });

      datasets.push({
        label: cat,
        data: data,
        borderColor: color,
        backgroundColor: color + '20',
        borderWidth: 2,
        pointBackgroundColor: color,
        pointRadius: 4,
        fill: false,
        tension: 0.3,
        datalabels: {
          display: (ctx: any) => ctx.dataset.data[ctx.dataIndex] > 0,
          color: color,
          anchor: 'end',
          align: 'top',
          font: { size: 10 }
        }
      });
    });

    this.yoyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
            ticks: { color: '#8892b0' } 
          },
          x: { 
            grid: { display: false }, 
            ticks: { color: '#8892b0' } 
          }
        },
        plugins: {
          datalabels: {
            anchor: 'end', align: 'top',
            color: (context) => (context.dataset as any).borderColor,
            font: { weight: 'bold', size: 11 },
            formatter: (value) => value > 0 ? value : ''
          },
          legend: { 
            display: true, 
            position: 'top', 
            labels: { color: '#ccd6f6', boxWidth: 15, padding: 15, font: { size: 10 } } 
          }
        }
      }
    });
  }
}
