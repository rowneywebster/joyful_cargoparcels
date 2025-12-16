from datetime import datetime
from app.database import db

class Parcel(db.Model):
    __tablename__ = 'parcels'

    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    alt_phone = db.Column(db.String(20), nullable=True)
    product = db.Column(db.String(200), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    expected_amount = db.Column(db.Float, default=0.0)
    courier = db.Column(db.String(100), nullable=True)
    # Status: paid, pending, postponed, cancelled, overdue
    status = db.Column(db.String(20), default='pending') 
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # One-to-One relationship
    postponed_order = db.relationship('PostponedOrder', backref='parcel', uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'customer_name': self.customer_name,
            'phone': self.phone,
            'alt_phone': self.alt_phone,
            'product': self.product,
            'destination': self.destination,
            'expected_amount': self.expected_amount,
            'courier': self.courier,
            'status': self.status,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'creator_name': self.creator.name if self.creator else "Unknown"
        }