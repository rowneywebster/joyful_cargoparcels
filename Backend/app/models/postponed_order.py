from datetime import datetime
from app.database import db

class PostponedOrder(db.Model):
    __tablename__ = 'postponed_orders'

    id = db.Column(db.Integer, primary_key=True)
    parcel_id = db.Column(db.Integer, db.ForeignKey('parcels.id'), unique=True, nullable=False)
    new_delivery_date = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    is_resolved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'parcel_id': self.parcel_id,
            'parcel_details': self.parcel.to_dict() if self.parcel else None,
            'new_delivery_date': self.new_delivery_date.isoformat() if self.new_delivery_date else None,
            'notes': self.notes,
            'is_resolved': self.is_resolved,
            'created_at': self.created_at.isoformat()
        }