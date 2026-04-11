# GeoVenture

GeoVenture is a modern full-stack web application designed for location intelligence and spatial analysis. The project uses an interactive map interface coupled with advanced hexagonal hierarchical spatial indexing to provide real-time location insights.

## Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS & shadcn/ui
- **Maps:** Leaflet & React-Leaflet
- **Data Fetching:** React Query (@tanstack/react-query)
- **Routing:** React Router DOM

### Backend
- **Framework:** FastAPI (Python)
- **Spatial Grid System:** H3 (Uber's Hexagonal Hierarchical Spatial Index)
- **Server:** Uvicorn

## Project Structure

The repository is organized into a multi-tier architecture:

```
GeoVenture/
├── Backend/        # FastAPI python server, routes, and spatial logic
└── Frontend/       # Vite-powered React UI, map components, and state
```

## Getting Started

### Prerequisites
- Node.js & npm (for the frontend)
- Python 3.8+ (for the backend)

### 1. Running the Backend

Navigate to the Backend directory, set up your Python environment, install dependencies (if any listed, typically `fastapi`, `uvicorn`, `h3`), and start the server:

```bash
cd Backend
# Create and activate a virtual environment (recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install required packages (e.g., pip install fastapi uvicorn h3)
# pip install -r requirements.txt # (If a requirements.txt is added later)

# Run the backend server
uvicorn main:app --reload
```
The backend API will be running at `http://127.0.0.1:8000`.

### 2. Running the Frontend

In a separate terminal, navigate to the Frontend directory, install Node dependencies, and start the development server:

```bash
cd Frontend
npm install
npm run dev
```
The frontend UI will be running locally (usually at `http://localhost:5173`).

## Features

- **Interactive Maps:** Restricted and controlled interactive map view powered by Leaflet.
- **Geospatial Analysis:** Real-time data processing relying on H3 hexagon cell indexes to segment and analyze geographical coordinates.
- **Modern UI:** Built carefully with shadcn/ui utilizing Radix UI primitives and Tailwind CSS for a highly responsive and aesthetic interface.
