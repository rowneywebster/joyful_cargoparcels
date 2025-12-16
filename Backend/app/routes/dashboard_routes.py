from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.models import Parcel, PostponedOrder, Expense, ExpenseCategory
from app.database import db
from app.services.analytics_service import get_dashboard_overview, get_revenue_trend
from app.utils import api_response

dashboard_bp = Blueprint('dashboard', __name__)

# Root route to check if blueprint is active
@dashboard_bp.route('/', methods=['GET'])
@jwt_required()
def dashboard_root():
    return api_response(message="Dashboard API is running")

# Dashboard overview stats
@dashboard_bp.route('/overview', methods=['GET'])
@jwt_required()
def overview():
    data = get_dashboard_overview()
    return api_response(data)

# Revenue trend for charts
@dashboard_bp.route('/revenue-trend', methods=['GET'])
@jwt_required()
def revenue_trend():
    data = get_revenue_trend()
    return api_response(data)

# Optionally, you can add more aggregated endpoints if needed, e.g., parcel status stats
@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def stats():
    stats_data = {
        "total_parcels": Parcel.query.count(),
        "pending_parcels": Parcel.query.filter_by(status="pending").count(),
        "paid_parcels": Parcel.query.filter_by(status="paid").count(),
        "overdue_parcels": Parcel.query.filter_by(status="overdue").count(),
        "total_expenses": db.session.query(db.func.sum(Expense.amount)).scalar() or 0
    }
    return api_response(stats_data, "Dashboard stats")
