from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse
import h3
import psycopg2
from psycopg2.extras import RealDictCursor

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
        conn = psycopg2.connect(
            host="localhost",
            database="Geo-Venture",       # <-- Change to your PostgreSQL database name
            user="postgres",         # <-- Change to your PostgreSQL username
            password="Urv@3214", # <-- Change to your PostgreSQL password
            port="5432"
        )
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

@app.get("/api/analyze")
def analyze_location(lat: float, lng: float, business_type: str = "cafe", db = Depends(get_db)):
    """
    Core API endpoint that calculates ML suitability dynamically from PostgreSQL using category weights.
    """
    
    # --- LOGGING TO TERMINAL ---
    print(f"\n✅ [BACKEND RECEIVED]: Lat: {lat}, Lng: {lng}, Type: {business_type}\n")
    
    # 1. Convert specific coordinates to Regional Hex Grid ID
    h3_index = h3.latlng_to_cell(lat, lng, 8)
    print("h3_index", h3_index)
    
    # 2. Query Machine Learning Data from Database
    db_data = None
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        # Note: In the new DB schema, the category name is stored in the 'competition' column
        cursor.execute("SELECT * FROM business_scores WHERE hex_id = %s AND competition = %s LIMIT 1;", (h3_index, business_type))
        db_data = cursor.fetchone()
        
        if not db_data:
            # Fallback: Just get ANY row for this hex if exactly this business isn't there
            cursor.execute("SELECT * FROM business_scores WHERE hex_id = %s LIMIT 1;", (h3_index,))
            db_data = cursor.fetchone()
            
        cursor.close()
    except Exception as e:
        print("❌ Database query failed:", e)

    # Helper to clean up DB floats safely
    def safe_score(val):
        try:
            v = float(val)
            return int(v * 100) if v <= 1.2 else int(v)
        except:
            return 0

    # 3. Apply Multi-Layer Weightings
    if db_data:
        road_pct = safe_score(db_data.get('road_pct', 0))
        pofw_pct = safe_score(db_data.get('pofw_pct', 0))
        transport_pct = safe_score(db_data.get('transport_pct', 0))
        traffic_pct = safe_score(db_data.get('traffic_pct', 0))
        poi_pct = safe_score(db_data.get('poi_pct', 0))
        pop_pct = safe_score(db_data.get('population_pct', 0))
        
        weights = CATEGORY_WEIGHTS.get(business_type, CATEGORY_WEIGHTS["cafe"])
        
        # Calculate dynamic final score based on requested weight profile
        raw_score = (
            (road_pct * weights.get("road_pct", 0)) +
            (pofw_pct * weights.get("pofw_pct", 0)) +
            (transport_pct * weights.get("transport_pct", 0)) +
            (traffic_pct * weights.get("traffic_pct", 0)) +
            (poi_pct * weights.get("poi_pct", 0)) +
            (pop_pct * weights.get("population_pct", 0)) +
            (50 * weights.get("competition", 0)) # Fixed penalty multiplier against the negative weight
        )
        
        overall_score = max(0, min(100, int(raw_score))) # Prevent mathematically impossible scores
        
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
            
        # Sort top descending so frontend doesn't have to work as hard
        alternatives = sorted(alternatives, key=lambda x: x["score"], reverse=True)
        
    else:
        # Emergency Default Fallback Array
        road_pct = 45; pofw_pct = 45; transport_pct = 45; traffic_pct = 45; poi_pct = 45; pop_pct = 45
        overall_score = 45 
        alternatives = []

    # 4. Map directly to Frontend Format dynamically
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
        "h3_index": h3_index,
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
            "lat": lat + 0.005,
            "lng": lng - 0.005,
            "score": min(100, overall_score + 10)
        },
        "riskFlags": []
    }

# To run the development server, type this in the terminal:
# uvicorn main:app --reload
