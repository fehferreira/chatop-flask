import sqlite3

from flask import Blueprint, redirect, render_template, request, session
from data.service.sqlite_service import sqlite_service


web_bp = Blueprint("web_bp", __name__)


@web_bp.get("/")
def root_page():
    return render_template("index.html")


@web_bp.get("/chat")
def chat_page():
    return render_template("chatbot.html", message_history=[])


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
            feedback = "Cliente nao encontrado."
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
