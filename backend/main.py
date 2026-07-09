from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import pandas as pd
import io
import httpx
import time
from mock_data import EQUIPMENT_DATA

app = FastAPI(title="Healthy Index Equipment API")

# Google Sheets URLs
PARETO_SHEET_URL = "https://docs.google.com/spreadsheets/d/1hf_lpXI6x3hBDfEHX8r8q15w6F3wtlzIABGibdpCMhg/export?format=csv&gid=1882488493"
CE_ABO_SHEET_URL = "https://docs.google.com/spreadsheets/d/1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM/export?format=csv&gid=299154811"

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/heartbeat")
async def heartbeat():
    return {"status": "alive", "version": "1.6", "time": time.time()}

def clean_filter_list(values):
    return sorted([str(x) for x in values if str(x).lower() != 'nan'])

@app.get("/api/ce-abo/data")
async def get_ce_abo_data(
    upt: Optional[List[str]] = Query(None),
    sub_bidang: Optional[List[str]] = Query(None),
    status: Optional[List[str]] = Query(None),
    level_anomali: Optional[List[str]] = Query(None)
):
    try:
        timestamp = int(time.time())
        fetch_url = f"{CE_ABO_SHEET_URL}&t={timestamp}"
        
        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
            response = await client.get(fetch_url)
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Gagal mengambil data dari Google Sheets.")
            
            df = pd.read_csv(io.StringIO(response.text), low_memory=False)

        if df.empty:
            return {"stats": {"total": 0, "closed": 0, "open": 0, "progress": 0}, "filters": {}}

        # 1. AGGRESSIVE CLEANING
        df.columns = [str(c).strip().replace('\xa0', ' ') for c in df.columns]
        for col in df.columns:
            if df[col].dtype == 'object':
                df[col] = df[col].fillna('').astype(str).str.strip().replace('\xa0', ' ')

        # 2. DETECT COLUMNS
        sb_col = next((c for c in df.columns if 'sub' in c.lower() and 'bidang' in c.lower()), 'Sub Bidang')
        st_col = next((c for c in df.columns if 'status' in c.lower() and 'terkini' in c.lower()), 'Status Terkini')
        la_col = next((c for c in df.columns if 'level' in c.lower() and 'anomali' in c.lower()), 'Level Anomali')
        upt_col = next((c for c in df.columns if c.lower() == 'upt'), 'UPT')
        ka_col = next((c for c in df.columns if 'kondisi' in c.lower() and 'akhir' in c.lower()), 'Kondisi Akhir')

        # 3. BASE FILTER: HARGI & ACTUAL FINDINGS (OPEN/CLOSE)
        # We only care about anomalies (Findings)
        df = df[df[sb_col].str.upper().str.contains('HARGI', na=False)]
        df = df[df[st_col].str.upper().isin(['OPEN', 'CLOSE'])]
        
        # 4. GET AVAILABLE FILTERS
        available_upt = clean_filter_list(df[upt_col].unique().tolist())
        available_sub_bidang = clean_filter_list(df[sb_col].unique().tolist())
        available_level_anomali = clean_filter_list(df[la_col].unique().tolist())
        # Use Kondisi Akhir for the status filter options
        available_status = clean_filter_list(df[ka_col].unique().tolist())

        # 5. APPLY USER FILTERS
        if upt and len(upt) > 0:
            df = df[df[upt_col].isin(upt)]
        if sub_bidang and len(sub_bidang) > 0:
            df = df[df[sb_col].isin(sub_bidang)]
        if status and len(status) > 0:
            df = df[df[ka_col].isin(status)]
        if level_anomali and len(level_anomali) > 0:
            df = df[df[la_col].isin(level_anomali)]

        # 6. CALCULATE STATS (Based on Kondisi Akhir categories)
        count_all = len(df)
        def is_vg_g(s): return any(x in str(s) for x in ['1-', '2-'])
        def is_f_p_c(s): return any(x in str(s) for x in ['3-', '4-', '5-'])

        # CLOSED = Very Good or Good (Target met)
        # OPEN = Fair, Poor, or Critical (Action required)
        count_close = len(df[df[ka_col].apply(is_vg_g)])
        count_open = len(df[df[ka_col].apply(is_f_p_c)])
        progress = round((count_close / count_all * 100), 2) if count_all > 0 else 0

        # 7. PREPARE RESPONSE DATA
        sub_bidang_dist = df.groupby([sb_col, ka_col]).size().reset_index(name='count').rename(columns={sb_col:'Sub Bidang', ka_col:'status'}).to_dict(orient='records')
        upt_dist = df.groupby([upt_col, ka_col]).size().reset_index(name='count').rename(columns={upt_col:'UPT', ka_col:'status'}).to_dict(orient='records')
        
        level_anomali_dist = []
        if la_col:
            dist = df.groupby([la_col, ka_col]).size().reset_index(name='count')
            level_anomali_dist = dist.rename(columns={la_col: 'level', ka_col: 'status'}).to_dict(orient='records')

        ka_counts = df[ka_col].value_counts().reset_index()
        ka_counts.columns = ['status', 'count']
        ka_summary = ka_counts.to_dict(orient='records')
        
        # Kondisi Terkini (Current Index Status)
        kt_col = next((c for c in df.columns if 'kondisi' in c.lower() and 'terkini' in c.lower()), None)
        kondisi_dist = df[kt_col].value_counts().reset_index().rename(columns={kt_col:'kondisi', 'count':'count'}).to_dict(orient='records') if kt_col else []

        # Uraian Anomali Dist
        uraian_dist = []
        ur_col = next((c for c in df.columns if 'uraian' in c.lower()), None)
        if ur_col:
            u_dist = df[ur_col].value_counts().reset_index()
            u_dist.columns = ['uraian', 'count']
            # Limit to top 15 to keep chart clean
            uraian_dist = u_dist.head(15).to_dict(orient='records')

        # Uraian per Level Anomali Dist
        uraian_level_dist = []
        if la_col and ur_col:
            ul_dist = df.groupby([la_col, ur_col]).size().reset_index(name='count')
            uraian_level_dist = ul_dist.rename(columns={la_col: 'level', ur_col: 'uraian'}).to_dict(orient='records')

        return {
            "stats": {"total": count_all, "closed": int(count_close), "open": int(count_open), "progress": progress},
            "filters": {"upt": available_upt, "sub_bidang": available_sub_bidang, "status": available_status, "level_anomali": available_level_anomali},
            "sub_bidang_dist": sub_bidang_dist,
            "upt_dist": upt_dist,
            "kondisi_dist": kondisi_dist,
            "level_anomali_dist": level_anomali_dist,
            "ka_summary": ka_summary,
            "uraian_dist": uraian_dist,
            "uraian_level_dist": uraian_level_dist,
            "detail_data": df.head(100).fillna('').to_dict(orient='records'),
            "last_updated": time.strftime('%H:%M:%S')
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error CE ABO: {str(e)}")

# Equipment Endpoints
@app.get("/api/equipment")
async def get_all_equipment():
    return EQUIPMENT_DATA

@app.get("/api/equipment/dashboard-stats")
async def get_dashboard_stats():
    total = len(EQUIPMENT_DATA)
    baik = len([e for e in EQUIPMENT_DATA if e["status"] == "Baik"])
    waspada = len([e for e in EQUIPMENT_DATA if e["status"] == "Waspada"])
    kritis = len([e for e in EQUIPMENT_DATA if e["status"] == "Kritis"])
    
    return {
        "total_equipment": total,
        "health_categories": [
            {"name": "Baik", "count": baik, "color": "#10b981"},
            {"name": "Waspada", "count": waspada, "color": "#f59e0b"},
            {"name": "Kritis", "count": kritis, "color": "#ef4444"}
        ],
        "recent_alerts": [e for e in EQUIPMENT_DATA if e["health_index"] < 50]
    }

@app.get("/api/equipment/{equipment_id}")
async def get_equipment_detail(equipment_id: int):
    equipment = next((e for e in EQUIPMENT_DATA if e["id"] == equipment_id), None)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment

@app.post("/api/equipment/upload")
async def upload_equipment(file: UploadFile = File(...)):
    return {"message": f"Successfully uploaded {file.filename}", "count": 0}

# Placeholder for Pareto endpoint (I'll keep it minimal for now to fix the reporting issue)
@app.get("/api/pareto/gangguan")
async def get_pareto_gangguan(bulan: Optional[List[str]] = Query(None), tahun: Optional[List[str]] = Query(None)):
    return {"pareto_data": [], "unit_data": [], "trend_data": [], "detail_data": [], "filters": {}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
