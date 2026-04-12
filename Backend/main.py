from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse
import h3
import psycopg2
from psycopg2.extras import RealDictCursor
from config.db_config import DB_CONFIG

# Initialize the FastAPI application
app = FastAPI(title="GeoVenture API", description="Backend for location intelligence", version="1.0.0", docs_url=None)

# Configure CORS so the React frontend can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, replace "*" with your React frontend URL (e.g. "http://localhost:5173")
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- DATABASE CONNECTION SETUP ----
# This is a FastAPI Dependency. It opens a connection when an API is called,
# and safely closes it automatically when the API finishes to prevent database crashes.
def get_db():
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        # Yield gives the connection to the API route, then pauses.
        print("sdflkdjfsjskfldjkjljl")
        yield conn
    except Exception as e:
        print(f"❌ Database Connection Error: {e}")
        raise e
    finally:
        # This guarantees the connection always closes, even if your API crashes!
        if conn:
            conn.close()


# ---- HERE is where you will write your API functions ----

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    html_response = get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI"
    )
    body = html_response.body.decode("utf-8")
    script = """
    <script>
    window.onload = function() {
        setTimeout(function() {
            const urlParams = new URLSearchParams(window.location.search);
            const lat = urlParams.get('lat');
            const lng = urlParams.get('lng');
            
            if (lat || lng) {
                const btn = document.querySelector('#operations-default-analyze_location_api_analyze_get .opblock-summary');
                if (btn) btn.click();
                
                setTimeout(() => {
                    const tryBtn = document.querySelector('#operations-default-analyze_location_api_analyze_get .try-out__btn');
                    if(tryBtn) tryBtn.click();
                    
                    setTimeout(() => {
                        if(lat) {
                            const latInput = document.querySelector('input[placeholder="lat"]');
                            if(latInput) {
                                let setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                                setter.call(latInput, lat);
                                latInput.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        }
                        if(lng) {
                            const lngInput = document.querySelector('input[placeholder="lng"]');
                            if(lngInput) {
                                let setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                                setter.call(lngInput, lng);
                                lngInput.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        }
                        
                        setTimeout(() => {
                            const execBtn = document.querySelector('#operations-default-analyze_location_api_analyze_get .execute');
                            if(execBtn) execBtn.click();
                        }, 300);
                    }, 500);
                }, 500);
            }
        }, 1000);
    };
    </script>
    """
    body = body.replace("</body>", f"{script}</body>")
    return HTMLResponse(body)

@app.get("/")
def read_root():
    return {"message": "Welcome to GeoVenture Backend API!"}

CATEGORY_WEIGHTS = {
    "cafe": {
        "population_pct": 0.25,
        "traffic_pct": 0.20,
        "poi_pct": 0.25,
        "road_pct": 0.10,
        "transport_pct": 0.10,
        "pofw_pct": 0.05,
        "competition": -0.10
    },
    "retail": {
        "population_pct": 0.30,
        "poi_pct": 0.25,
        "traffic_pct": 0.20,
        "road_pct": 0.10,
        "transport_pct": 0.10,
        "pofw_pct": 0.05,
        "competition": -0.10
    },
    "ev_station": {
        "traffic_pct": 0.30,
        "road_pct": 0.25,
        "transport_pct": 0.20,
        "population_pct": 0.10,
        "poi_pct": 0.05,
        "pofw_pct": 0.05,
        "competition": -0.05
    },
    "warehouse": {
        "road_pct": 0.30,
        "transport_pct": 0.25,
        "pofw_pct": 0.15,
        "traffic_pct": 0.10,
        "competition": -0.10,
        "population_pct": -0.05,
        "poi_pct": -0.05
    },
    "healthcare": {
        "population_pct": 0.30,
        "transport_pct": 0.20,
        "road_pct": 0.15,
        "traffic_pct": 0.10,
        "poi_pct": 0.10,
        "pofw_pct": 0.10,
        "competition": -0.05
    },
    "education": {
        "population_pct": 0.30,
        "transport_pct": 0.20,
        "road_pct": 0.15,
        "poi_pct": 0.10,
        "pofw_pct": 0.10,
        "traffic_pct": 0.05,
        "competition": -0.05
    },
    "gym": {
        "population_pct": 0.25,
        "traffic_pct": 0.15,
        "poi_pct": 0.15,
        "road_pct": 0.15,
        "transport_pct": 0.15,
        "pofw_pct": 0.10,
        "competition": -0.05
    },
    "bank": {
        "population_pct": 0.25,
        "transport_pct": 0.20,
        "road_pct": 0.15,
        "traffic_pct": 0.10,
        "poi_pct": 0.10,
        "pofw_pct": 0.10,
        "competition": -0.10
    }
}

# Helper to clean up DB floats safely
def safe_score(val):
    try:
        v = float(val)
        return int(v * 100) if v <= 1.2 else int(v)
    except:
        return 0

def _score_from_db_data(db_data, lat=None, lng=None, business_type="other", h3_index=None):
    """
    Internal helper to process raw database row into the standard frontend JSON format.
    """
    # 1. Apply Multi-Layer Weightings
    if db_data:
        road_pct = safe_score(db_data.get('road_pct', 0))
        pofw_pct = safe_score(db_data.get('pofw_pct', 0))
        transport_pct = safe_score(db_data.get('transport_pct', 0))
        traffic_pct = safe_score(db_data.get('traffic_pct', 0))
        poi_pct = safe_score(db_data.get('poi_pct', 0))
        pop_pct = safe_score(db_data.get('population_pct', 0))
        
        # Determine weights based on business_type
        weights = CATEGORY_WEIGHTS.get(business_type, CATEGORY_WEIGHTS["cafe"])
        
        # Calculate dynamic final score
        raw_score = (
            (road_pct * weights.get("road_pct", 0)) +
            (pofw_pct * weights.get("pofw_pct", 0)) +
            (transport_pct * weights.get("transport_pct", 0)) +
            (traffic_pct * weights.get("traffic_pct", 0)) +
            (poi_pct * weights.get("poi_pct", 0)) +
            (pop_pct * weights.get("population_pct", 0)) +
            (50 * weights.get("competition", 0))
        )
        
        overall_score = max(0, min(100, int(raw_score)))
        
        alternatives = []
        for b_type, b_weights in CATEGORY_WEIGHTS.items():
            b_raw = (
                (road_pct * b_weights.get("road_pct", 0)) +
                (pofw_pct * b_weights.get("pofw_pct", 0)) +
                (transport_pct * b_weights.get("transport_pct", 0)) +
                (traffic_pct * b_weights.get("traffic_pct", 0)) +
                (poi_pct * b_weights.get("poi_pct", 0)) +
                (pop_pct * b_weights.get("population_pct", 0)) +
                (50 * b_weights.get("competition", 0))
            )
            b_score = max(0, min(100, int(b_raw)))
            alternatives.append({"type": b_type, "score": b_score})
            
        alternatives = sorted(alternatives, key=lambda x: x["score"], reverse=True)
        
    else:
        # Fallback values if no DB data exists
        road_pct = 0; pofw_pct = 0; transport_pct = 0; traffic_pct = 0; poi_pct = 0; pop_pct = 0
        overall_score = 0
        alternatives = []

    # 4. Map directly to Frontend Format
    factors = [
        {"label": "Local Population", "icon": "👥", "value": pop_pct},
        {"label": "Road Matrix", "icon": "🛣️", "value": road_pct},
        {"label": "Points of Interest", "icon": "📍", "value": poi_pct},
        {"label": "Public Transit", "icon": "🚆", "value": transport_pct},
        {"label": "Traffic Index", "icon": "🚗", "value": traffic_pct},
        {"label": "Waterways (POFW)", "icon": "💧", "value": pofw_pct}
    ]

    return {
        "location": {"lat": lat, "lng": lng},
        "h3_index": h3_index if h3_index else (db_data.get('hex_id') if db_data else None),
        "business_type": business_type,
        "score": overall_score,
        "factors": factors,
        "alternatives": alternatives,
        "bestBusiness": {
            "type": "EV Charging Station",
            "icon": "⚡",
            "reasons": [
                "Low competition within 1km radius",
                "High transit footfall nearby",
                "Above-average purchasing power in area"
            ]
        },
        "betterLocation": {
            "lat": (lat + 0.005) if lat else 0,
            "lng": (lng - 0.005) if lng else 0,
            "score": min(100, overall_score + 10)
        },
        "riskFlags": []
    }

def _score_location_by_hex(hex_id: str, business_type: str, db):
    """
    Queries DB by hex_id and business type, then scores it.
    """
    db_data = None
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        # Try finding exact business match first
        cursor.execute("SELECT * FROM business_scores WHERE hex_id = %s AND competition = %s LIMIT 1;", (hex_id, business_type))
        db_data = cursor.fetchone()
        
        if not db_data:
            # Fallback: Just get ANY row for this hex if exactly this business isn't there
            cursor.execute("SELECT * FROM business_scores WHERE hex_id = %s LIMIT 1;", (hex_id,))
            db_data = cursor.fetchone()
            
        cursor.close()
    except Exception as e:
        print(f"❌ Database query failed for hex {hex_id}:", e)
        return None

    if not db_data:
        return None

    return _score_from_db_data(db_data, business_type=business_type, h3_index=hex_id)
@app.get("/api/analyze")
def analyze_location(lat: float, lng: float, business_type: str = "cafe", db = Depends(get_db)):
    """
    Core API endpoint that calculates ML suitability dynamically from PostgreSQL.
    """
    print(f"\n✅ [BACKEND RECEIVED]: Lat: {lat}, Lng: {lng}, Type: {business_type}\n")
    
    # 1. Convert specific coordinates to Regional Hex Grid ID
    h3_index = h3.latlng_to_cell(lat, lng, 8)
    
    # 2. Get data and score
    result = _score_location_by_hex(h3_index, business_type, db)
    
    # 3. If no DB data found, create a placeholder via _score_from_db_data(None)
    if not result:
        result = _score_from_db_data(None, lat=lat, lng=lng, business_type=business_type, h3_index=h3_index)
    else:
        # Update with actual coordinates for the frontend
        result["location"] = {"lat": lat, "lng": lng}
        result["betterLocation"] = {"lat": lat + 0.005, "lng": lng - 0.005, "score": min(100, result["score"] + 10)}

    return result

@app.get("/api/compare")
def compare_locations(
    hex1: str = None, 
    hex2: str = None, 
    business_type: str = "cafe", 
    lat1: float = None, 
    lng1: float = None, 
    lat2: float = None, 
    lng2: float = None,
    db = Depends(get_db)
):
    """
    Compares two locations side-by-side using either H3 hex IDs or lat/lng coordinates.
    """
    # Convert lat/lng to hex if provided
    h1 = hex1
    h2 = hex2
    
    if lat1 is not None and lng1 is not None:
        h1 = h3.latlng_to_cell(lat1, lng1, 8)
    if lat2 is not None and lng2 is not None:
        h2 = h3.latlng_to_cell(lat2, lng2, 8)
        
    if not h1 or not h2:
        raise HTTPException(status_code=400, detail="Missing location identifiers (hex or lat/lng)")

    loc1 = _score_location_by_hex(h1, business_type, db)
    loc2 = _score_location_by_hex(h2, business_type, db)
    
    if not loc1 or not loc2:
        raise HTTPException(status_code=404, detail="One or both hex_ids not found in database")
        
    score_diff = loc1["score"] - loc2["score"]
    
    if score_diff > 0:
        better = "location1"
    elif score_diff < 0:
        better = "location2"
    else:
        better = "equal"
        
    insights = []
    # Compare each factor one by one
    for f1, f2 in zip(loc1["factors"], loc2["factors"]):
        diff = f1["value"] - f2["value"]
        if diff > 10:
            insights.append(f"Location 1 has significantly better {f1['label']}")
        elif diff < -10:
            insights.append(f"Location 2 has significantly better {f2['label']}")

    return {
        "location1": loc1,
        "location2": loc2,
        "comparison": {
            "betterLocation": better,
            "scoreDifference": abs(score_diff),
            "percentDifference": round(abs(score_diff) / max(loc1["score"], loc2["score"], 1) * 100, 1),
            "insights": insights if insights else ["Both locations are remarkably similar across key metrics."]
        }
    }

# To run the development server, type this in the terminal:
# uvicorn main:app --reload
