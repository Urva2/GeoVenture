from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse
import h3

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

@app.get("/api/analyze")
def analyze_location(lat: float, lng: float, business_type: str = "cafe"):
    """
    Example API endpoint that receives coordinates and returns an analysis.
    """
    
    # --- ADDED LOGGING SO YOU CAN SEE IT IN TERMINAL ---
    print(f"\n✅ [BACKEND RECEIVED DATA]: Latitude: {lat}, Longitude: {lng}, Business Type: {business_type}\n")
    
    # Example logic using the 'h3' library you installed:
    # Get the H3 hexagon cell index for this latitude/longitude at resolution 8
    h3_index = h3.latlng_to_cell(lat, lng, 8)
    
    return {
        # Backend debugging metadata
        "location": {"lat": lat, "lng": lng},
        "h3_index": h3_index,
        "business_type": business_type,
        
        # Frontend UI required payload
        "score": 85,
        "factors": [
            {"label": "Population Density", "icon": "👥", "value": 78},
            {"label": "Road & Transit Access", "icon": "🛣️", "value": 65},
            {"label": "Competition Index", "icon": "🏪", "value": 80, "inverted": True},
            {"label": "Risk Score", "icon": "⚠️", "value": 15, "inverted": True},
            {"label": "Purchasing Power", "icon": "💰", "value": 60}
        ],
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
            "score": 92
        },
        "riskFlags": [
            "High competition detected in a 500m radius"
        ]
    }

# To run the development server, type this in the terminal:
# uvicorn main:app --reload
