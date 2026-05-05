import sqlite3

from flask import Blueprint, jsonify, redirect, render_template, request, session
from data.service.sqlite_service import sqlite_service
from domain.use_case.chat_use_case import respond


web_bp = Blueprint("web_bp", __name__)


@web_bp.get("/")
def root_page():
    return render_template("index.html")


@web_bp.get("/chat")
def chat_page():
    user = session.get("user")
    if user is None:
        return redirect("/")

    history = sqlite_service.list_chat_messages(user["id"])
    return render_template("chatbot.html", message_history=history)


@web_bp.post("/chat")
def chat_send():
    user = session.get("user")
    if user is None:
        return jsonify({"error": "Usuário não autenticado."}), 401

    data = request.get_json(force=True, silent=True)
    message = (data.get("message") or "").strip() if data else ""

    if not message:
        return jsonify({"error": "Mensagem vazia."}), 400

    sqlite_service.create_chat_message(user["id"], "user", "Você", message)
    reply = respond(message)
    bot_message = sqlite_service.create_chat_message(user["id"], "bot", "Chatbot", reply)

    return jsonify({"reply": reply, "timestamp": bot_message["timestamp"]})


@web_bp.get("/logout")
def logout():
    session.clear()
    return redirect("/")


@web_bp.get("/clients")
def clients_page():
    users = sqlite_service.list_users()
    return render_template("register.html", users=users, feedback=None, feedback_type=None)


@web_bp.post("/clients")
def create_client():
    data = request.form.to_dict()

    try:
        sqlite_service.create_user(data)
        feedback = "Cliente cadastrado com sucesso."
        feedback_type = "success"

    except sqlite3.IntegrityError:
        feedback = "Erro ao cadastrar cliente. Verifique os dados informados."
        feedback_type = "error"

    users = sqlite_service.list_users()
    return render_template("register.html", users=users, feedback=feedback, feedback_type=feedback_type)


@web_bp.post("/clients/<int:user_id>/edit")
def edit_client(user_id: int):
    data = request.form.to_dict()

    try:
        updated = sqlite_service.update_user(user_id, data)
        if not updated:
            feedback = "Cliente não encontrado."
            feedback_type = "error"
        else:
            feedback = "Cliente atualizado com sucesso."
            feedback_type = "success"

    except sqlite3.IntegrityError:
        feedback = "Erro ao atualizar cliente. Verifique os dados informados."
        feedback_type = "error"

    users = sqlite_service.list_users()
    return render_template("register.html", users=users, feedback=feedback, feedback_type=feedback_type)


@web_bp.post("/clients/<int:user_id>/delete")
def delete_client(user_id: int):
    sqlite_service.delete_user(user_id)
    return redirect("/clients")
