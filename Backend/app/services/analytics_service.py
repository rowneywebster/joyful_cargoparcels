from sqlalchemy import func, extract
from datetime import datetime, timedelta
from app.database import db
from app.models import Parcel, Expense

def get_dashboard_overview():
    today = datetime.utcnow().date()
    start_of_month = datetime(today.year, today.month, 1)
    
    # Total Revenue (Paid parcels)
    total_revenue = db.session.query(func.sum(Parcel.expected_amount)).filter(
        Parcel.status == 'paid'
    ).scalar() or 0

    # Current Month Revenue
    month_revenue = db.session.query(func.sum(Parcel.expected_amount)).filter(
        Parcel.status == 'paid',
        Parcel.updated_at >= start_of_month
    ).scalar() or 0

    # Active Parcels
    active_parcels = Parcel.query.filter(Parcel.status.in_(['pending', 'postponed'])).count()

    # Overdue
    overdue_parcels = Parcel.query.filter_by(status='overdue').count()

    return {
        "total_revenue": total_revenue,
        "month_revenue": month_revenue,
        "active_parcels": active_parcels,
        "overdue_parcels": overdue_parcels
    }

def get_revenue_trend():
    # Last 6 months
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=180)
    
    results = db.session.query(
        func.to_char(Parcel.updated_at, 'YYYY-MM').label('month'),
        func.sum(Parcel.expected_amount)
    ).filter(
        Parcel.status == 'paid',
        Parcel.updated_at >= start_date
    ).group_by('month').order_by('month').all()
    
    return [{"month": r[0], "revenue": r[1]} for r in results]