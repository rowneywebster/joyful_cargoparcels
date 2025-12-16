from flask import Blueprint, request
from app.models import Parcel, PostponedOrder
from app.database import db
from app.utils import api_response, error_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

parcel_bp = Blueprint('parcels', __name__)

@parcel_bp.route('', methods=['GET'])
@jwt_required()
def get_parcels():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('limit', 20, type=int)
    status = request.args.get('status')
    search = request.args.get('search')

    query = Parcel.query

    if status:
        query = query.filter(Parcel.status == status)
    if search:
        query = query.filter(Parcel.customer_name.ilike(f'%{search}%') | Parcel.phone.ilike(f'%{search}%'))
        
    query = query.order_by(Parcel.created_at.desc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    meta = {
        "page": page,
        "pages": pagination.pages,
        "total": pagination.total,
        "limit": per_page
    }
    
    return api_response([p.to_dict() for p in pagination.items], meta=meta)

@parcel_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_parcel(id):
    parcel = Parcel.query.get_or_404(id)
    return api_response(parcel.to_dict())

@parcel_bp.route('', methods=['POST'])
@jwt_required()
def create_parcel():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    new_parcel = Parcel(
        customer_name=data['customer_name'],
        phone=data['phone'],
        alt_phone=data.get('alt_phone'),
        product=data['product'],
        destination=data['destination'],
        expected_amount=data.get('expected_amount', 0),
        courier=data.get('courier'),
        status=data.get('status', 'pending'),
        user_id=user_id
    )
    
    db.session.add(new_parcel)
    db.session.commit()
    return api_response(new_parcel.to_dict(), status=201)

@parcel_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_parcel(id):
    parcel = Parcel.query.get_or_404(id)
    data = request.get_json()
    
    parcel.customer_name = data.get('customer_name', parcel.customer_name)
    parcel.product = data.get('product', parcel.product)
    parcel.destination = data.get('destination', parcel.destination)
    parcel.expected_amount = data.get('expected_amount', parcel.expected_amount)
    
    # Check status change for postponement
    new_status = data.get('status')
    if new_status and new_status != parcel.status:
        parcel.status = new_status
        if new_status == 'postponed':
            # Auto create postponed order if not exists
            if not parcel.postponed_order:
                po = PostponedOrder(parcel_id=parcel.id, notes="Auto-created from status change")
                db.session.add(po)

    db.session.commit()
    return api_response(parcel.to_dict())

@parcel_bp.route('/<int:id>/status', methods=['PATCH'])
@jwt_required()
def update_status(id):
    parcel = Parcel.query.get_or_404(id)
    data = request.get_json()
    new_status = data.get('status')
    
    if not new_status:
        return error_response("Status required")
        
    parcel.status = new_status
    
    if new_status == 'postponed' and not parcel.postponed_order:
        po = PostponedOrder(
            parcel_id=parcel.id,
            notes=data.get('notes', 'Postponed manually'),
            new_delivery_date=None # To be filled later
        )
        db.session.add(po)
    
    db.session.commit()
    return api_response(parcel.to_dict(), "Status updated")

@parcel_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_parcel(id):
    parcel = Parcel.query.get_or_404(id)
    db.session.delete(parcel)
    db.session.commit()
    return api_response(None, "Parcel deleted")

@parcel_bp.route('/overdue', methods=['GET'])
@jwt_required()
def get_overdue():
    parcels = Parcel.query.filter_by(status='overdue').all()
    return api_response([p.to_dict() for p in parcels])

@parcel_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    # Simple stats
    stats = {
        "pending": Parcel.query.filter_by(status='pending').count(),
        "paid": Parcel.query.filter_by(status='paid').count(),
        "cancelled": Parcel.query.filter_by(status='cancelled').count()
    }
    return api_response(stats)