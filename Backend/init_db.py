# init_db.py
import os
from datetime import datetime, timedelta
from random import choice, randint

from app import create_app, db
from app.models import User, Parcel, PostponedOrder, Expense, ExpenseCategory

# Create app with production config
app = create_app('production')

with app.app_context():
    print("🔧 Initializing database...")
    
    # Create all tables
    db.create_all()
    print("✅ Tables created successfully!")
    
    # Only seed if database is empty (check if admin exists)
    admin_email = "admin@example.com"
    if User.query.filter_by(email=admin_email).first():
        print("ℹ️  Database already seeded, skipping seed data")
    else:
        print("🌱 Seeding database...")
        
        # -------------------
        # Users
        # -------------------
        admin = User(name="Admin User", email=admin_email, phone="0700000000", role="admin")
        admin.set_password("password123")
        db.session.add(admin)
        print("✔ Admin created")

        # Add sample staff users
        staff_emails = ["alice@example.com", "bob@example.com", "carol@example.com"]
        for email in staff_emails:
            user = User(
                name=email.split("@")[0].capitalize(), 
                email=email, 
                role="staff", 
                phone=f"07{randint(10000000, 99999999)}"
            )
            user.set_password("password123")
            db.session.add(user)
            print(f"✔ User {email} created")

        db.session.commit()

        # -------------------
        # Expense Categories
        # -------------------
        categories = ["Office Supplies", "Transport", "Utilities", "Marketing"]
        for cat_name in categories:
            cat = ExpenseCategory(name=cat_name)
            db.session.add(cat)
            print(f"✔ ExpenseCategory '{cat_name}' created")
        
        db.session.commit()

        # -------------------
        # Expenses
        # -------------------
        users = User.query.all()
        expense_cats = ExpenseCategory.query.all()
        for _ in range(5):
            expense = Expense(
                category_id=choice(expense_cats).id,
                user_id=choice(users).id,
                description="Sample expense",
                amount=randint(100, 5000),
                date=datetime.utcnow() - timedelta(days=randint(0, 30))
            )
            db.session.add(expense)
        db.session.commit()
        print("✔ Sample expenses created")

        # -------------------
        # Parcels
        # -------------------
        products = ["Shoes", "Laptop", "Phone", "Book", "Watch"]
        statuses = ["pending", "paid", "cancelled", "postponed", "overdue"]
        for i in range(5):
            parcel = Parcel(
                customer_name=f"Customer {i+1}",
                phone=f"07{randint(10000000, 99999999)}",
                alt_phone=f"07{randint(10000000, 99999999)}",
                product=choice(products),
                destination=f"Nairobi Area {i+1}",
                expected_amount=randint(1000, 10000),
                status=choice(statuses),
                user_id=choice(users).id,
            )
            db.session.add(parcel)
        db.session.commit()
        print("✔ Sample parcels created")

        # -------------------
        # Postponed Orders
        # -------------------
        postponed_parcels = Parcel.query.filter_by(status="postponed").all()
        for p in postponed_parcels:
            if not p.postponed_order:
                po = PostponedOrder(parcel_id=p.id, notes="Auto-created for seed", is_resolved=False)
                db.session.add(po)
        db.session.commit()
        print("✔ Sample postponed orders created")

        print("✅ Database seeding completed!")
    
    print("🚀 Database initialization finished!")