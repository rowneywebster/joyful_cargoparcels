from flask import jsonify

def api_response(data=None, message="", success=True, status=200, meta=None):
    response = {
        "success": success,
        "data": data if data is not None else {},
        "message": message,
        "meta": meta if meta is not None else {}
    }
    return jsonify(response), status

def error_response(message, code="ERROR", status=400):
    response = {
        "success": False,
        "error": message,
        "code": code,
        "statusCode": status
    }
    return jsonify(response), status