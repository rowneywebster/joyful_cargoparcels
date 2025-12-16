import re

def validate_email(email):
    regex = r'^\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return re.fullmatch(regex, email)

def validate_phone(phone):
    # Simple check, adjust regex for specific country codes if needed
    return len(str(phone)) >= 9