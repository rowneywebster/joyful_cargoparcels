from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Expense, ExpenseCategory
from app.database import db
from app.utils import api_response, error_response
from datetime import datetime

expense_bp = Blueprint('expenses', __name__)

@expense_bp.route('', methods=['GET'])
@jwt_required()
def get_expenses():
    expenses = Expense.query.all()
    return api_response([e.to_dict() for e in expenses])

@expense_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_expense(id):
    expense = Expense.query.get_or_404(id)
    return api_response(expense.to_dict())

@expense_bp.route('', methods=['POST'])
@jwt_required()
def create_expense():
    data = request.get_json()
    user_id = get_jwt_identity()

    new_expense = Expense(
        category_id=data['category_id'],
        user_id=user_id,
        description=data.get('description'),
        amount=data['amount'],
        date=datetime.fromisoformat(data['date']) if 'date' in data else datetime.utcnow()
    )

    db.session.add(new_expense)
    db.session.commit()
    return api_response(new_expense.to_dict(), "Expense created", status=201)

@expense_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_expense(id):
    expense = Expense.query.get_or_404(id)
    data = request.get_json()

    expense.category_id = data.get('category_id', expense.category_id)
    expense.description = data.get('description', expense.description)
    expense.amount = data.get('amount', expense.amount)
    if 'date' in data:
        expense.date = datetime.fromisoformat(data['date'])

    db.session.commit()
    return api_response(expense.to_dict(), "Expense updated")

@expense_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_expense(id):
    expense = Expense.query.get_or_404(id)
    db.session.delete(expense)
    db.session.commit()
    return api_response(None, "Expense deleted")
