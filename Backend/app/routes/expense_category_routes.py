from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.models import ExpenseCategory
from app.utils import api_response

expense_category_bp = Blueprint("expense_categories", __name__)

@expense_category_bp.route("", methods=["GET"])
@jwt_required()
def get_categories():
    categories = ExpenseCategory.query.all()
    return api_response([c.to_dict() for c in categories])
