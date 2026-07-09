import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getAllEquipment(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/equipment`);
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/equipment/dashboard-stats`);
  }

  getEquipmentDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/equipment/${id}`);
  }

  uploadEquipment(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/equipment/upload`, formData);
  }

  getParetoData(bulan?: string[], tahun?: string[], unit?: string[], kategory?: string[]): Observable<any> {
    let params: any = {};
    params['t'] = new Date().getTime(); // Anti-cache
    if (bulan && bulan.length > 0) params['bulan'] = bulan;
    if (tahun && tahun.length > 0) params['tahun'] = tahun;
    if (unit && unit.length > 0) params['unit'] = unit;
    if (kategory && kategory.length > 0) params['kategory'] = kategory;
    return this.http.get<any>(`${this.apiUrl}/pareto/gangguan`, { params });
  }

  getCeAboData(upt?: string[], subBidang?: string[], status?: string[], levelAnomali?: string[]): Observable<any> {
    let params: any = {};
    params['t'] = new Date().getTime(); // Anti-cache
    if (upt && upt.length > 0) params['upt'] = upt;
    if (subBidang && subBidang.length > 0) params['sub_bidang'] = subBidang;
    if (status && status.length > 0) params['status'] = status;
    if (levelAnomali && levelAnomali.length > 0) params['level_anomali'] = levelAnomali;
    return this.http.get<any>(`${this.apiUrl}/ce-abo/data`, { params });
  }
}
