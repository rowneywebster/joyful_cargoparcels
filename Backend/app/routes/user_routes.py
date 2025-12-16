from flask import Blueprint, request
from app.models import User
from app.database import db
from app.utils import api_response, error_response
from app.utils.jwt_helper import admin_required
from flask_jwt_extended import jwt_required
from app.utils.validators import validate_email

user_bp = Blueprint('users', __name__)

@user_bp.route('', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    return api_response([u.to_dict() for u in users])

@user_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_user(id):
    user = User.query.get(id)
    if not user:
        return error_response("User not found", "NOT_FOUND", 404)
    return api_response(user.to_dict())

@user_bp.route('', methods=['POST'])
@admin_required()
def create_user():
    data = request.get_json()
    
    if not validate_email(data.get('email', '')):
        return error_response("Invalid email", "VALIDATION_ERROR")
        
    if User.query.filter_by(email=data['email']).first():
        return error_response("Email already exists", "CONFLICT", 409)

    new_user = User(
        name=data['name'],
        email=data['email'],
        phone=data.get('phone'),
        role=data.get('role', 'user')
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    return api_response(new_user.to_dict(), "User created", status=201)

@user_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.get_json()
    
    # Logic could be added to ensure users only update themselves unless admin
    
    user.name = data.get('name', user.name)
    user.phone = data.get('phone', user.phone)
    
    if 'password' in data and data['password']:
         user.set_password(data['password'])

    db.session.commit()
    return api_response(user.to_dict(), "User updated")

@user_bp.route('/<int:id>/role', methods=['PATCH'])
@admin_required()
def update_role(id):
    user = User.query.get_or_404(id)
    data = request.get_json()
    user.role = data.get('role', user.role)
    db.session.commit()
    return api_response(user.to_dict(), "Role updated")

@user_bp.route('/<int:id>', methods=['DELETE'])
@admin_required()
def delete_user(id):
    user = User.query.get_or_404(id)

    # Check for linked expenses
    if user.expenses and len(user.expenses) > 0:
        return error_response(
            "Cannot delete user with existing expenses. Delete or reassign their expenses first.",
            "DEPENDENCY_ERROR",
            400
        )

    db.session.delete(user)
    db.session.commit()
    return api_response(None, "User deleted")
