from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from api import predictor
from api.schemas import (
    HealthResponse,
    SummaryResponse,
    ForecastResponse,
    ProductsResponse,
    DayOfWeekResponse,
    MonthlyTrendResponse,
    CategoryResponse,
    DeliveryResponse,
    ReviewResponse,
    LivePredictRequest,
    LivePredictResponse,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    predictor.load_artifacts()
    print("\n  [OK] API activated - all endpoints ready.\n")
    yield
    print("  API deactivated.")

app = FastAPI(
    title="LUMINA — Sales Forecasting API",
    description=(
        "API untuk dashboard admin LUMINA. Menyediakan prediksi penjualan "
        "30 hari ke depan, produk paling/tidak diminati, analisis kategori, "
        "delivery & review berdasarkan dataset Brazilian E-Commerce."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Info"])
def root():
    return {
        "name": "LUMINA — Sales Forecasting API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": [
            "/health",
            "/summary",
            "/forecast",
            "/products/top",
            "/products/bottom",
            "/analysis/day-of-week",
            "/analysis/monthly-trend",
            "/analysis/category",
            "/analysis/delivery",
            "/analysis/review",
        ],
    }

@app.get("/health", response_model=HealthResponse, tags=["Info"])
def health():
    return predictor.get_health()

@app.get("/summary", response_model=SummaryResponse, tags=["Info"])
def summary():
    return predictor.get_summary()

@app.get("/forecast", response_model=ForecastResponse, tags=["Forecast"])
def forecast():
    return predictor.get_forecast()

@app.get("/products/top", response_model=ProductsResponse, tags=["Products"])
def top_products(
    limit: int = Query(15, ge=1, le=100, description="Jumlah produk yang dikembalikan"),
):
    return predictor.get_top_products(limit=limit)


@app.get("/products/bottom", response_model=ProductsResponse, tags=["Products"])
def bottom_products(
    limit: int = Query(15, ge=1, le=100, description="Jumlah produk yang dikembalikan"),
    min_qty: int = Query(2, ge=1, description="Minimum penjualan historis"),
):
    return predictor.get_bottom_products(limit=limit, min_qty=min_qty)

@app.get("/analysis/day-of-week", response_model=DayOfWeekResponse, tags=["Analysis"])
def day_of_week():
    return predictor.get_day_of_week()

@app.get("/analysis/monthly-trend", response_model=MonthlyTrendResponse, tags=["Analysis"])
def monthly_trend():
    return predictor.get_monthly_trend()

@app.get("/analysis/category", response_model=CategoryResponse, tags=["Analysis"])
def category_analysis(
    top_n: int = Query(10, ge=1, le=50, description="Jumlah kategori top/bottom"),
    lookback_days: int = Query(90, ge=7, le=365, description="Periode analisis dalam hari"),
):
    return predictor.get_category_analysis(top_n=top_n, lookback_days=lookback_days)

@app.get("/analysis/delivery", response_model=DeliveryResponse, tags=["Analysis"])
def delivery_analysis():
    return predictor.get_delivery_analysis()

@app.get("/analysis/review", response_model=ReviewResponse, tags=["Analysis"])
def review_analysis():
    return predictor.get_review_analysis()


@app.post("/predict", response_model=LivePredictResponse, tags=["Forecast"])
def predict_from_store_data(request: LivePredictRequest):
    """Predict future demand using actual store data fed into the trained model."""
    daily_sales = [{"date": s.date, "total_items": s.total_items} for s in request.daily_sales]
    return predictor.predict_from_data(
        daily_sales=daily_sales,
        horizon_days=request.horizon_days,
        avg_price=request.avg_price,
    )
