from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import h3

# Initialize the FastAPI application
app = FastAPI(title="GeoVenture API", description="Backend for location intelligence", version="1.0.0")

# Configure CORS so the React frontend can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, replace "*" with your React frontend URL (e.g. "http://localhost:5173")
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- HERE is where you will write your API functions ----

@app.get("/")
def read_root():
    return {"message": "Welcome to GeoVenture Backend API!"}

@app.get("/api/analyze")
def analyze_location(lat: float, lng: float, business_type: str = "cafe"):
    """
    Example API endpoint that receives coordinates and returns an analysis.
    You will eventually replace the frontend mock data with this logic.
    """
    
    # Example logic using the 'h3' library you installed:
    # Get the H3 hexagon cell index for this latitude/longitude at resolution 9
    h3_index = h3.latlng_to_cell(lat, lng, 9)
    
    return {
        "location": {"lat": lat, "lng": lng},
        "h3_index": h3_index,
        "business_type": business_type,
        "score": 85,
        "status": "Analyzing..."
    }

# To run the development server, type this in the terminal:
# uvicorn main:app --reload
