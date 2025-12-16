from flask import Blueprint, request
from app.models import PostponedOrder, Parcel
from app.database import db
from app.utils import api_response, error_response
from flask_jwt_extended import jwt_required
from datetime import datetime

postponed_bp = Blueprint('postponed', __name__)

@postponed_bp.route('', methods=['GET'])
@jwt_required()
def get_all_postponed():
    orders = PostponedOrder.query.filter_by(is_resolved=False).all()
    return api_response([o.to_dict() for o in orders])

@postponed_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_postponed(id):
    order = PostponedOrder.query.get_or_404(id)
    return api_response(order.to_dict())

@postponed_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_postponed(id):
    order = PostponedOrder.query.get_or_404(id)
    data = request.get_json()
    
    if 'new_delivery_date' in data:
        order.new_delivery_date = datetime.fromisoformat(data['new_delivery_date'].replace('Z', '+00:00'))
    
    order.notes = data.get('notes', order.notes)
    db.session.commit()
    return api_response(order.to_dict())

@postponed_bp.route('/<int:id>/resolve', methods=['PATCH'])
@jwt_required()
def resolve_order(id):
    order = PostponedOrder.query.get_or_404(id)
    order.is_resolved = True
    
    # Optionally set parcel back to pending
    if order.parcel:
        order.parcel.status = 'pending'
        
    db.session.commit()
    return api_response(order.to_dict(), "Order resolved")

@postponed_bp.route('/stats', methods=['GET'])
@jwt_required()
def stats():
    count = PostponedOrder.query.filter_by(is_resolved=False).count()
    return api_response({"active_postponed": count})