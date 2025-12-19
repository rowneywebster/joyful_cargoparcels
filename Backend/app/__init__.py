from flask import Flask
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

from .config import config_by_name
from .database import db

# Import Blueprints
from .routes.auth_routes import auth_bp
from .routes.parcel_routes import parcel_bp
from .routes.postponed_routes import postponed_bp
from .routes.user_routes import user_bp
from .routes.dashboard_routes import dashboard_bp
from .routes.expense_routes import expense_bp
from .routes.expense_category_routes import expense_category_bp



from app.config import config_by_name


def create_app(config_name='development'):
    app = Flask(__name__)

    # Load environment configurations
    app.config.from_object(config_by_name[config_name])


    # Initialize extensions
    db.init_app(app)
    JWTManager(app)
    Migrate(app, db)

    # -----------------------
    # ROOT HOMEPAGE
    # -----------------------
    @app.route("/")
    def root():
        return """
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Joyful Cargo API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #f4f4f4;
                    padding: 30px;
                }
                h1 {
                    color: #333;
                }
                .container {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    max-width: 600px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                a {
                    display: block;
                    padding: 10px;
                    margin: 6px 0;
                    background: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                }
                a:hover {
                    background: #0056b3;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Joyful Cargo API</h1>
                <p>Select an endpoint:</p>

                <a href='/api/auth'>Auth Routes</a>
                <a href='/api/parcels'>Parcel Routes</a>
                <a href='/api/postponed'>Postponed Orders</a>
                <a href='/api/users'>User Routes</a>
                <a href='/api/dashboard'>Dashboard Routes</a>
                <a href='/api/expenses'>Expenses Routes</a>
            </div>
        </body>
        </html>
        """

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(parcel_bp, url_prefix="/api/parcels")
    app.register_blueprint(postponed_bp, url_prefix="/api/postponed")
    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(expense_bp, url_prefix="/api/expenses")
    app.register_blueprint(expense_category_bp, url_prefix="/api/expense-categories")


    return app
