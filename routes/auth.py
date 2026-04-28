import re

from flask import Blueprint, jsonify, request, session

from data.service.sqlite_service import sqlite_service


auth_bp = Blueprint("auth_bp", __name__, url_prefix="/auth")


@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    document = (payload.get("document") or "").strip()
    email = (payload.get("email") or "").strip()

    normalized_document = re.sub(r"\D", "", document)
    user = sqlite_service.find_by_document_email(normalized_document, email)

    if user is None:
        return jsonify(
            {"success": False, "message": "Credenciais invalidas. Por favor, insira o CPF novamente."}
        ), 401

    session["user"] = user
    return jsonify({"success": True, "message": "Login realizado.", "user": user})
