from typing import List, Dict

EQUIPMENT_DATA: List[Dict] = [
    {
        "id": 1,
        "name": "Transformer T-01",
        "type": "Transformer",
        "health_index": 85,
        "status": "Baik",
        "last_maintenance": "2024-05-15",
        "history": [
            {"date": "2024-01-01", "index": 90},
            {"date": "2024-02-01", "index": 88},
            {"date": "2024-03-01", "index": 87},
            {"date": "2024-04-01", "index": 86},
            {"date": "2024-05-01", "index": 85},
        ]
    },
    {
        "id": 2,
        "name": "Generator G-02",
        "type": "Generator",
        "health_index": 45,
        "status": "Waspada",
        "last_maintenance": "2024-04-20",
        "history": [
            {"date": "2024-01-01", "index": 70},
            {"date": "2024-02-01", "index": 65},
            {"date": "2024-03-01", "index": 60},
            {"date": "2024-04-01", "index": 50},
            {"date": "2024-05-01", "index": 45},
        ]
    },
    {
        "id": 3,
        "name": "Water Pump P-03",
        "type": "Pump",
        "health_index": 20,
        "status": "Kritis",
        "last_maintenance": "2024-03-10",
        "history": [
            {"date": "2024-01-01", "index": 50},
            {"date": "2024-02-01", "index": 40},
            {"date": "2024-03-01", "index": 35},
            {"date": "2024-04-01", "index": 25},
            {"date": "2024-05-01", "index": 20},
        ]
    },
    {
        "id": 4,
        "name": "Cooling Tower CT-01",
        "type": "Cooling Tower",
        "health_index": 92,
        "status": "Baik",
        "last_maintenance": "2024-05-20",
        "history": [
            {"date": "2024-01-01", "index": 95},
            {"date": "2024-02-01", "index": 94},
            {"date": "2024-03-01", "index": 93},
            {"date": "2024-04-01", "index": 92},
            {"date": "2024-05-01", "index": 92},
        ]
    }
]
