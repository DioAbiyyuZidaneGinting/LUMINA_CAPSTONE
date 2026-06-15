from pydantic import BaseModel, Field
from typing import List

class HealthResponse(BaseModel):
    status: str
    model_name: str
    trained_at: str
    train_period: List[str]

class SummaryResponse(BaseModel):
    total_orders_all_time: int
    total_revenue_all_time: float
    total_unique_products: int
    total_unique_customers: int
    date_range_start: str
    date_range_end: str
    forecast_30d_items: float
    forecast_30d_revenue: float

class DailyForecast(BaseModel):
    order_date: str = Field(..., description="Tanggal (YYYY-MM-DD)")
    predicted_items: float = Field(..., description="Prediksi jumlah item terjual")
    predicted_revenue: float = Field(..., description="Prediksi revenue")


class ForecastResponse(BaseModel):
    horizon_days: int
    total_predicted_items: float
    total_predicted_revenue: float
    avg_daily_items: float
    avg_daily_revenue: float
    forecast: List[DailyForecast]

class ProductForecast(BaseModel):
    product_id: str
    predicted_qty_30d: float
    predicted_revenue_30d: float
    avg_price: float
    historical_qty: int

class ProductsResponse(BaseModel):
    period_days: int
    products: List[ProductForecast]

class DayOfWeekStat(BaseModel):
    day: str
    total_orders: int

class DayOfWeekResponse(BaseModel):
    best_day: str
    worst_day: str
    breakdown: List[DayOfWeekStat]

class MonthlyStat(BaseModel):
    year_month: str
    orders: int
    revenue: float


class MonthlyTrendResponse(BaseModel):
    months: List[MonthlyStat]

class CategoryStat(BaseModel):
    category: str
    qty: int
    revenue: float

class CategoryResponse(BaseModel):
    period_days: int
    top_categories: List[CategoryStat]
    bottom_categories: List[CategoryStat]

class DeliveryResponse(BaseModel):
    avg_delay_days: float = Field(..., description="Negatif = lebih cepat dari estimasi")
    median_delay_days: float
    on_time_percentage: float = Field(..., description="persen order yang tidak telat (delay <= 0)")
    late_orders_count: int
    early_orders_count: int
    total_orders_analyzed: int

class ReviewScoreCount(BaseModel):
    score: int
    count: int
    percentage: float

class DelayPerReview(BaseModel):
    review_score: int
    avg_delay_days: float
    order_count: int

class ReviewResponse(BaseModel):
    avg_review_score: float
    total_reviews: int
    score_distribution: List[ReviewScoreCount]
    delay_vs_review: List[DelayPerReview]


# --- Live Prediction from Store Data ---

class DailySalesInput(BaseModel):
    date: str = Field(..., description="Tanggal (YYYY-MM-DD)")
    total_items: float = Field(..., description="Jumlah item terjual pada hari tersebut")

class LivePredictRequest(BaseModel):
    daily_sales: List[DailySalesInput] = Field(..., description="Data penjualan harian dari toko")
    horizon_days: int = Field(7, ge=1, le=30, description="Jumlah hari prediksi (maks 30)")
    avg_price: float = Field(0.0, ge=0, description="Harga rata-rata per item untuk estimasi revenue")

class LivePredictForecast(BaseModel):
    order_date: str
    predicted_items: float
    predicted_revenue: float

class LivePredictResponse(BaseModel):
    horizon_days: int
    total_predicted_items: float
    total_predicted_revenue: float
    avg_daily_items: float
    avg_daily_revenue: float
    model_name: str
    data_points_used: int
    forecast: List[LivePredictForecast]

