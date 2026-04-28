from flask import Flask

from config.connection import init_db
from routes import auth_bp, web_bp


def create_app() -> Flask:
	app = Flask(__name__)
	app.config["SECRET_KEY"] = "chatop-secret-key"

	init_db()

	app.register_blueprint(web_bp)
	app.register_blueprint(auth_bp)

	return app


app = create_app()


if __name__ == "__main__":
	app.run(debug=True)
