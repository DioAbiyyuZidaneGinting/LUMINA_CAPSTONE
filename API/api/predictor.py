import pickle
import numpy as np
import pandas as pd
from pathlib import Path


# Path resolution: API/api/predictor.py -> parent.parent.parent = project root
BASE_DIR    = Path(__file__).resolve().parent.parent.parent
MODELS_DIR  = BASE_DIR / "models"
DATA_DIR    = BASE_DIR / "data" / "processed"

MODEL_FILE         = MODELS_DIR / "model_sales.pkl"
FEATURES_FILE      = MODELS_DIR / "model_sales_features.pkl"
FORECAST_FILE      = MODELS_DIR / "forecast_30d.csv"
PRODUCT_FCST_FILE  = MODELS_DIR / "product_forecast_30d.csv"
SALES_FILE         = DATA_DIR / "df_sales.csv"
DELIVERY_FILE      = DATA_DIR / "df_delivery.csv"

class PredictorState:
    model_bundle: dict = None
    feature_meta: dict = None
    forecast_df: pd.DataFrame = None
    product_forecast_df: pd.DataFrame = None
    df_sales: pd.DataFrame = None
    df_delivery: pd.DataFrame = None
    has_category_column: bool = False


state = PredictorState()

def load_artifacts():
    print(f"\n   Loading artifacts from:")
    print(f"   Models dir: {MODELS_DIR}")
    print(f"   Data dir:   {DATA_DIR}\n")

    with open(MODEL_FILE, "rb") as f:
        state.model_bundle = pickle.load(f)

    with open(FEATURES_FILE, "rb") as f:
        state.feature_meta = pickle.load(f)

    state.forecast_df = pd.read_csv(FORECAST_FILE)
    state.forecast_df["order_date"] = pd.to_datetime(state.forecast_df["order_date"])

    state.product_forecast_df = pd.read_csv(PRODUCT_FCST_FILE)

    state.df_sales = pd.read_csv(SALES_FILE)
    state.df_sales["order_purchase_timestamp"] = pd.to_datetime(
        state.df_sales["order_purchase_timestamp"], errors="coerce"
    )
    state.has_category_column = "product_category_name_english" in state.df_sales.columns
    state.df_delivery = pd.read_csv(DELIVERY_FILE)

    print(f"   Model           : {state.model_bundle.get('model_name', 'unknown')}")
    print(f"   Trained at      : {state.model_bundle.get('trained_at', 'unknown')}")
    print(f"   Forecast        : {len(state.forecast_df)} hari")
    print(f"   Products        : {len(state.product_forecast_df)} produk")
    print(f"   Sales rows      : {len(state.df_sales):,}")
    print(f"   Delivery rows   : {len(state.df_delivery):,}")
    print(f"   Category column : {'tersedia' if state.has_category_column else 'belum ada (re-run EDA)'}")

def get_forecast():
    df = state.forecast_df.copy()

    forecast_list = [
        {
            "order_date": row["order_date"].strftime("%Y-%m-%d"),
            "predicted_items": float(row["predicted_items"]),
            "predicted_revenue": float(row["predicted_revenue"]),
        }
        for _, row in df.iterrows()
    ]

    return {
        "horizon_days": len(df),
        "total_predicted_items": float(df["predicted_items"].sum()),
        "total_predicted_revenue": float(df["predicted_revenue"].sum()),
        "avg_daily_items": float(df["predicted_items"].mean()),
        "avg_daily_revenue": float(df["predicted_revenue"].mean()),
        "forecast": forecast_list,
    }

def _product_row_to_dict(row):
    return {
        "product_id": str(row["product_id"]),
        "predicted_qty_30d": float(row["predicted_qty_30d"]),
        "predicted_revenue_30d": float(row["predicted_revenue_30d"]),
        "avg_price": float(row["avg_price"]),
        "historical_qty": int(row["qty"]),
    }

def get_top_products(limit: int = 15):
    df = (state.product_forecast_df
          .sort_values("predicted_qty_30d", ascending=False)
          .head(limit))
    return {"period_days": 30, "products": [_product_row_to_dict(r) for _, r in df.iterrows()]}

def get_bottom_products(limit: int = 15, min_qty: int = 2):
    df = (state.product_forecast_df[state.product_forecast_df["qty"] >= min_qty]
          .sort_values("predicted_qty_30d", ascending=True)
          .head(limit))
    return {"period_days": 30, "products": [_product_row_to_dict(r) for _, r in df.iterrows()]}

def get_day_of_week():
    dow_order = ["Monday", "Tuesday", "Wednesday", "Thursday",
                 "Friday", "Saturday", "Sunday"]

    dow_sales = (state.df_sales.groupby("day_of_week")["order_id"].nunique()
                 .reindex(dow_order))

    breakdown = [
        {"day": day, "total_orders": int(count)}
        for day, count in dow_sales.items()
    ]

    return {
        "best_day":  str(dow_sales.idxmax()),
        "worst_day": str(dow_sales.idxmin()),
        "breakdown": breakdown,
    }

def get_monthly_trend():
    monthly = (state.df_sales.groupby("year_month")
               .agg(orders=("order_id", "nunique"),
                    revenue=("price", "sum"))
               .reset_index()
               .sort_values("year_month"))

    months = [
        {
            "year_month": str(row["year_month"]),
            "orders":     int(row["orders"]),
            "revenue":    float(row["revenue"]),
        }
        for _, row in monthly.iterrows()
    ]

    return {"months": months}

def get_category_analysis(top_n: int = 10, lookback_days: int = 90):
    if not state.has_category_column:
        return {
            "period_days": lookback_days,
            "top_categories": [],
            "bottom_categories": [],
        }

    cutoff = state.df_sales["order_purchase_timestamp"].max() - pd.Timedelta(days=lookback_days)
    recent = state.df_sales[state.df_sales["order_purchase_timestamp"] >= cutoff]
    recent = recent[recent["product_category_name_english"].notna()]

    cat_summary = (recent.groupby("product_category_name_english")
                   .agg(qty=("order_item_id", "count"),
                        revenue=("price", "sum"))
                   .sort_values("qty", ascending=False))

    def to_list(df):
        return [
            {"category": str(idx), "qty": int(row["qty"]), "revenue": float(row["revenue"])}
            for idx, row in df.iterrows()
        ]

    return {
        "period_days":       lookback_days,
        "top_categories":    to_list(cat_summary.head(top_n)),
        "bottom_categories": to_list(cat_summary.tail(top_n).iloc[::-1]),
    }

def get_delivery_analysis():
    df = state.df_delivery.dropna(subset=["delivery_delay_days"])

    total = len(df)
    late  = int((df["delivery_delay_days"] > 0).sum())
    early = int((df["delivery_delay_days"] <= 0).sum())

    return {
        "avg_delay_days":         float(df["delivery_delay_days"].mean()),
        "median_delay_days":      float(df["delivery_delay_days"].median()),
        "on_time_percentage":     float(early / total * 100) if total else 0.0,
        "late_orders_count":      late,
        "early_orders_count":     early,
        "total_orders_analyzed":  total,
    }

def get_review_analysis():
    df = state.df_delivery.dropna(subset=["review_score"])
    total = len(df)

    dist = df["review_score"].value_counts().sort_index()
    score_distribution = [
        {
            "score": int(score),
            "count": int(count),
            "percentage": float(count / total * 100),
        }
        for score, count in dist.items()
    ]

    df_with_delay = df.dropna(subset=["delivery_delay_days"])
    delay_per_review = (df_with_delay.groupby("review_score")
                        .agg(avg_delay=("delivery_delay_days", "mean"),
                             count=("delivery_delay_days", "count"))
                        .reset_index())

    delay_vs_review = [
        {
            "review_score":    int(row["review_score"]),
            "avg_delay_days":  float(row["avg_delay"]),
            "order_count":     int(row["count"]),
        }
        for _, row in delay_per_review.iterrows()
    ]

    return {
        "avg_review_score":     float(df["review_score"].mean()),
        "total_reviews":        total,
        "score_distribution":   score_distribution,
        "delay_vs_review":      delay_vs_review,
    }

def get_summary():
    df = state.df_sales
    fcst = state.forecast_df

    return {
        "total_orders_all_time":  int(df["order_id"].nunique()),
        "total_revenue_all_time": float(df["price"].sum()),
        "total_unique_products":  int(df["product_id"].nunique()),
        "total_unique_customers": int(df["customer_id"].nunique()),
        "date_range_start":       df["order_purchase_timestamp"].min().strftime("%Y-%m-%d"),
        "date_range_end":         df["order_purchase_timestamp"].max().strftime("%Y-%m-%d"),
        "forecast_30d_items":     float(fcst["predicted_items"].sum()),
        "forecast_30d_revenue":   float(fcst["predicted_revenue"].sum()),
    }

def get_health():
    return {
        "status":       "ok",
        "model_name":   state.model_bundle.get("model_name", "unknown"),
        "trained_at":   state.model_bundle.get("trained_at", "unknown"),
        "train_period": state.model_bundle.get("train_period", ["", ""]),
    }


def predict_from_data(daily_sales: list, horizon_days: int = 7, avg_price: float = 0.0):
    """
    Predict future demand using the trained ML model based on actual store data.

    Args:
        daily_sales: list of {"date": "YYYY-MM-DD", "total_items": int}
        horizon_days: number of days to predict (1-30)
        avg_price: average price per item for revenue estimation
    """
    model = state.model_bundle["model"]
    feature_names = state.feature_meta["features"]
    horizon = min(max(horizon_days, 1), 30)

    # Build DataFrame from store data
    df = pd.DataFrame(daily_sales)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)

    # Ensure continuous dates (fill missing days with 0)
    if len(df) > 0:
        date_range = pd.date_range(start=df["date"].min(), end=df["date"].max())
        full_df = pd.DataFrame({"date": date_range})
        full_df = full_df.merge(df, on="date", how="left")
        full_df["total_items"] = full_df["total_items"].fillna(0).astype(float)
    else:
        # No data at all - create minimal history of zeros
        today = pd.Timestamp.now().normalize()
        date_range = pd.date_range(end=today, periods=30)
        full_df = pd.DataFrame({"date": date_range, "total_items": 0.0})

    # Trend offset: continue from the length of historical data
    trend_start = len(full_df)

    # Iteratively predict each future day
    predictions = []

    for i in range(horizon):
        pred_date = full_df["date"].iloc[-1] + pd.Timedelta(days=1)
        items = full_df["total_items"].values
        n = len(items)

        # Engineer features in the exact order the model expects
        features = {
            "lag_1":       items[-1]  if n >= 1  else 0.0,
            "lag_7":       items[-7]  if n >= 7  else 0.0,
            "lag_14":      items[-14] if n >= 14 else 0.0,
            "lag_30":      items[-30] if n >= 30 else 0.0,
            "roll_mean_7":  float(np.mean(items[-7:]))  if n >= 7  else float(np.mean(items)),
            "roll_std_7":   float(np.std(items[-7:]))   if n >= 7  else float(np.std(items)),
            "roll_mean_30": float(np.mean(items[-30:])) if n >= 30 else float(np.mean(items)),
            "roll_std_30":  float(np.std(items[-30:]))  if n >= 30 else float(np.std(items)),
            "dow":          pred_date.dayofweek,
            "month":        pred_date.month,
            "day":          pred_date.day,
            "weekofyear":   int(pred_date.isocalendar()[1]),
            "is_weekend":   1 if pred_date.dayofweek >= 5 else 0,
            "trend":        trend_start + i,
        }

        # Create feature array in the exact order expected by the model
        X = np.array([[features[f] for f in feature_names]])

        # Predict
        predicted_items = float(model.predict(X)[0])
        predicted_items = max(0.0, predicted_items)  # Can't sell negative items

        predicted_revenue = predicted_items * avg_price if avg_price > 0 else 0.0

        predictions.append({
            "order_date": pred_date.strftime("%Y-%m-%d"),
            "predicted_items": round(predicted_items, 1),
            "predicted_revenue": round(predicted_revenue, 2),
        })

        # Append prediction to history so next iteration can use it as lag
        new_row = pd.DataFrame({"date": [pred_date], "total_items": [predicted_items]})
        full_df = pd.concat([full_df, new_row], ignore_index=True)

    total_items = sum(p["predicted_items"] for p in predictions)
    total_revenue = sum(p["predicted_revenue"] for p in predictions)

    return {
        "horizon_days": horizon,
        "total_predicted_items": round(total_items, 1),
        "total_predicted_revenue": round(total_revenue, 2),
        "avg_daily_items": round(total_items / horizon, 1) if horizon else 0,
        "avg_daily_revenue": round(total_revenue / horizon, 2) if horizon else 0,
        "model_name": state.model_bundle.get("model_name", "unknown"),
        "data_points_used": len(daily_sales),
        "forecast": predictions,
    }
