import pandas as pd
import httpx
import io
import asyncio

async def debug_data():
    url = "https://docs.google.com/spreadsheets/d/1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM/export?format=csv&gid=299154811"
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.get(url)
        if resp.status_code != 200:
            print(f"Failed to fetch: {resp.status_code}")
            return
        
        # Try reading with default CSV settings
        df = pd.read_csv(io.StringIO(resp.text))
        print(f"Total Rows: {len(df)}")
        print(f"Columns: {df.columns.tolist()}")
        
        # Clean column names
        df.columns = [str(c).strip() for c in df.columns]
        
        # Search for Sub Bidang
        sb_col = next((c for c in df.columns if 'sub bidang' in c.lower()), None)
        print(f"Sub Bidang Column: {sb_col}")
        
        if sb_col:
            unique_sb = df[sb_col].fillna('NAN').astype(str).unique().tolist()
            print(f"Unique Sub Bidang values (first 20): {unique_sb[:20]}")
            
            hargi_rows = df[df[sb_col].astype(str).str.contains('HARGI', case=False, na=False)]
            print(f"Rows containing 'HARGI': {len(hargi_rows)}")
            
            if len(hargi_rows) > 0:
                st_col = next((c for c in df.columns if 'status' in c.lower() and 'terkini' in c.lower()), None)
                print(f"Status Terkini Column: {st_col}")
                if st_col:
                    print("Status counts for HARGI:")
                    print(hargi_rows[st_col].fillna('NAN').astype(str).value_counts())

if __name__ == "__main__":
    asyncio.run(debug_data())
