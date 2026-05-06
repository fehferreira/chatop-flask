import re

from config.connection import get_connection


class SQLiteService:
	@staticmethod
	def _to_float(value):
		if value is None:
			return 0.0

		if isinstance(value, (int, float)):
			return float(value)

		text = str(value).strip()
		if text == "":
			return 0.0

		# Accept both Brazilian (5.000,00) and standard (5000.00) formats.
		text = re.sub(r"[^\d,.-]", "", text)
		if "," in text and "." in text:
			text = text.replace(".", "").replace(",", ".")
		elif "," in text:
			text = text.replace(",", ".")

		return float(text)

	@staticmethod
	def _row_to_client(row):
		return {
			"id": row["id"],
			"name": row["name"],
			"document": row["document"],
			"email": row["email"],
			"admin": bool(row["admin"]),
			"card": {
				"number": row["card_number"],
				"type": row["card_type"],
				"status": row["card_status"],
				"credit_limit": row["credit_limit"],
				"invoice_total": row["invoice_total"],
				"due_date": row["due_date"],
			},
		}

	@staticmethod
	def _row_to_chat_message(row):
		return {
			"id": row["id"],
			"user_id": row["user_id"],
			"origin": row["origin"],
			"author": row["author"],
			"text": row["text"],
			"timestamp": row["created_at"],
		}

	def list_users(self):
		with get_connection() as connection:
			rows = connection.execute("SELECT * FROM users ORDER BY id DESC").fetchall()

		return [self._row_to_client(row) for row in rows]

	def find_by_document_email(self, document, email):
		with get_connection() as connection:
			row = connection.execute(
				"SELECT * FROM users WHERE document = ? AND lower(email) = lower(?)",
				(document, email),
			).fetchone()

		if row is None:
			return None

		return self._row_to_client(row)

	def list_chat_messages(self, user_id):
		with get_connection() as connection:
			rows = connection.execute(
				"""
				SELECT id, user_id, origin, author, text, datetime(created_at, 'localtime') AS created_at
				FROM chat_messages
				WHERE user_id = ?
				ORDER BY id ASC
				""",
				(user_id,),
			).fetchall()

		return [self._row_to_chat_message(row) for row in rows]

	def create_chat_message(self, user_id, origin, author, text):
		with get_connection() as connection:
			cursor = connection.cursor()
			cursor.execute(
				"""
				INSERT INTO chat_messages (user_id, origin, author, text)
				VALUES (?, ?, ?, ?)
				""",
				(user_id, origin, author, text),
			)
			connection.commit()

			row = connection.execute(
				"""
				SELECT id, user_id, origin, author, text, datetime(created_at, 'localtime') AS created_at
				FROM chat_messages
				WHERE id = ?
				""",
				(cursor.lastrowid,),
			).fetchone()

		return self._row_to_chat_message(row)

	def create_user(self, payload):
		with get_connection() as connection:
			admin = 1 if payload.get("admin") in (1, True, "1", "true", "True", "on") else 0
			normalized_document = re.sub(r"\D", "", payload["document"])
			card_status = int(payload.get("card_status", 0))
			credit_limit = self._to_float(payload.get("credit_limit", 0))
			invoice_total = self._to_float(payload.get("invoice_total", 0))

			cursor = connection.cursor()
			cursor.execute(
				"""
				INSERT INTO users (
					name, document, email, admin,
					card_number, card_type, card_status,
					credit_limit, invoice_total, due_date
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				""",
				(
					payload["name"],
					normalized_document,
					payload["email"],
					admin,
					payload["card_number"],
					payload["card_type"],
					card_status,
					credit_limit,
					invoice_total,
					payload["due_date"],
				),
			)
			connection.commit()
			return cursor.lastrowid

	def update_user(self, user_id, payload):
		with get_connection() as connection:
			admin = 1 if payload.get("admin") in (1, True, "1", "true", "True", "on") else 0
			normalized_document = re.sub(r"\D", "", payload["document"])
			card_status = int(payload.get("card_status", 0))
			credit_limit = self._to_float(payload.get("credit_limit", 0))
			invoice_total = self._to_float(payload.get("invoice_total", 0))

			cursor = connection.cursor()
			cursor.execute(
				"""
				UPDATE users
				SET
					name = ?,
					document = ?,
					email = ?,
					admin = ?,
					card_number = ?,
					card_type = ?,
					card_status = ?,
					credit_limit = ?,
					invoice_total = ?,
					due_date = ?
				WHERE id = ?
				""",
				(
					payload["name"],
					normalized_document,
					payload["email"],
					admin,
					payload["card_number"],
					payload["card_type"],
					card_status,
					credit_limit,
					invoice_total,
					payload["due_date"],
					user_id,
				),
			)
			connection.commit()
			return cursor.rowcount > 0

	def find_user_by_id(self, user_id):
		with get_connection() as connection:
			row = connection.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

		if row is None:
			return None

		return self._row_to_client(row)

	def delete_user(self, user_id):
		user = self.find_user_by_id(user_id)

		if user is None:
			return False, "Cliente não encontrado."

		if user.get("admin"):
			return False, "Usuário admin não pode ser removido."

		with get_connection() as connection:
			cursor = connection.cursor()
			cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
			connection.commit()

		return True, "Cliente removido com sucesso."

sqlite_service = SQLiteService()
