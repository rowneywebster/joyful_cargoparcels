from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
from app.models.user import User
from app.utils import api_response, error_response
from app.database import db

auth_bp = Blueprint('auth', __name__)

# -------------------------
# Root endpoint
# -------------------------
@auth_bp.route('/', methods=['GET'])
def auth_root():
    return api_response(message="Auth API is running")

# -------------------------
# Register new user
# -------------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "staff")

    if not all([name, email, password]):
        return error_response("Missing required fields", "VALIDATION_ERROR", 400)

    if User.query.filter_by(email=email).first():
        return error_response("Email already exists", "DUPLICATE_EMAIL", 400)

    new_user = User(
        name=name,
        email=email,
        role=role,
        phone=data.get("phone")
    )
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return api_response(new_user.to_dict(), "User registered successfully", 201)

# -------------------------
# Login
# -------------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return api_response({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user.to_dict()
        }, "Login successful")

    return error_response("Invalid credentials", "AUTH_ERROR", 401)

# -------------------------
# Refresh token
# -------------------------
@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=str(user_id))
    return api_response({"access_token": new_access_token}, "Token refreshed")

# -------------------------
# Get logged-in user
# -------------------------
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return error_response("User not found", "NOT_FOUND", 404)

    return api_response(user.to_dict())

# -------------------------
# Logout
# -------------------------
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # If using token blocklist, revoke token here
    return api_response(None, "Logged out successfully")