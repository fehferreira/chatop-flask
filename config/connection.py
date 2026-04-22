import sqlite3

# Configurando conexões iniciais
connection = sqlite3.connect("chatbot-database.db")
cursor = connection.cursor()


# Inicialização de tabelas

cursor.execute("""
    CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        numero_cartao TEXT NOT NULL,
        limite_total REAL NOT NULL,
        limite_disponivel REAL NOT NULL,
        fatura_atual REAL NOT NULL,
        vencimento_cartao TEXT NOT NULL,
        vencimento_fatura TEXT NOT NULL,
        status_cartao TEXT NOT NULL
    )
""")