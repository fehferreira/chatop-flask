# Chatop - Plataforma de Atendimento ChatBot para Conta Digital

**Aplicativo web de atendimento ao cliente via ChatBot** focado em consulta, cadastro, edição e deleção de clientes de contas digitais e cartões de crédito. Desenvolvido com Flask e SQLite, oferece uma experiência de atendimento interativa e responsiva.

---

## 📋 Visão Geral

O Chatop é uma plataforma web que simula um atendente de chat para gerenciar clientes de um banco digital. O sistema utiliza **Machine Learning (Naive Bayes)** para classificar intenções dos usuários e fornecer respostas inteligentes sobre limites, faturas, cartão e suporte técnico.

### Funcionalidades Principais

- ✅ **Autenticação por CPF e Email** - Login seguro dos clientes
- ✅ **Chat Interativo com IA** - Respostas automáticas baseadas em intenção do usuário
- ✅ **Gerenciamento de Clientes** - CRUD completo (criar, ler, atualizar, deletar)
- ✅ **Histórico de Conversas** - Persistência de mensagens em banco de dados
- ✅ **Painel de Clientes** - Visualização e administração de cadastros
- ✅ **Responsivo** - Interface adaptável para desktop e mobile

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas

```
chatop-flask/
├── app.py                          # Inicialização da aplicação Flask
├── requirements.txt                # Dependências do projeto
├── config/
│   └── connection.py              # Configuração e inicialização do SQLite
├── data/
│   ├── perguntas.csv              # Dataset de exemplos de perguntas (treinamento de IA)
│   ├── respostas.json             # Mapeamento de categorias para respostas
│   ├── service/
│   │   └── sqlite_service.py      # Operações de banco de dados (DAO)
│   └── entity/
│       └── sqlite_entity.py       # Definições de entidades (vazio - potencial uso futuro)
├── domain/
│   └── use_case/
│       └── chat_use_case.py       # Lógica de ML para classificação de intenções
├── routes/
│   ├── __init__.py                # Blueprint de rotas
│   ├── auth.py                    # Rotas de autenticação (login)
│   └── web.py                     # Rotas principais (chat, clientes, CRUD)
├── templates/
│   ├── index.html                 # Página de login/inicial
│   ├── chatbot.html               # Interface do chat
│   └── register.html              # Página de gestão de clientes
├── static/
│   ├── css/
│   │   ├── global.css             # Estilos compartilhados
│   │   ├── index.css              # Estilos da página inicial
│   │   ├── chat.css               # Estilos do chat
│   │   └── register.css           # Estilos da página de clientes
│   └── js/
│       ├── pages/
│       │   ├── index.js           # Lógica de login/autenticação
│       │   ├── chatbot.js         # Lógica do envio de mensagens
│       │   └── register.js        # Lógica do CRUD de clientes
│       └── utils/
│           ├── masks.js           # Máscara de formatação (CPF)
│           └── validators.js      # Validação de formulários (CPF, email)
└── presentation/
    ├── index.html                 # HTML estático
    └── page/
        ├── home_page.py           # Potencial uso futuro
        └── chatbot_page.py        # Potencial uso futuro
```

### Fluxo de Dados

```
Usuário (Frontend)
    ↓
[HTML/CSS/JS] - Templates + JavaScript
    ↓
Flask Routes (auth.py, web.py)
    ↓
├─ POST /auth/login → SQLiteService.find_by_document_email()
├─ POST /chat → chat_use_case.respond() [ML Classification]
├─ POST /clients → SQLiteService.create_user()
├─ POST /clients/<id>/edit → SQLiteService.update_user()
├─ POST /clients/<id>/delete → SQLiteService.delete_user()
└─ GET /clients → SQLiteService.list_users()
    ↓
SQLite Database (chatbot-database.db)
    ├─ users (clientes)
    └─ chat_messages (histórico de conversas)
```

### Padrão de Arquitetura

- **Camada de Apresentação** (`templates/` + `static/`) - Interface do usuário
- **Camada de Rotas** (`routes/`) - Endpoints HTTP
- **Camada de Domínio** (`domain/`) - Lógica de negócio (ML)
- **Camada de Dados** (`data/`) - Acesso a dados (SQLite)
- **Camada de Configuração** (`config/`) - Setup do banco de dados

---

## 🗄️ Modelagem de Dados

### Tabela: `users` (Clientes)

| Campo         | Tipo    | Obrigatório  | Descrição                        |
| ------------- | ------- | ------------ | -------------------------------- |
| id            | INTEGER | SIM (PK)     | Identificador único              |
| name          | TEXT    | SIM          | Nome completo do cliente         |
| document      | TEXT    | SIM (UNIQUE) | CPF normalizado (apenas dígitos) |
| email         | TEXT    | SIM          | Email do cliente                 |
| admin         | INTEGER | SIM          | Flag de administrador (0 ou 1)   |
| card_number   | TEXT    | SIM          | Últimos dígitos do cartão        |
| card_type     | TEXT    | SIM          | Tipo (ex: "fisico", "virtual")   |
| card_status   | INTEGER | SIM          | Status do cartão (ativo/inativo) |
| credit_limit  | REAL    | SIM          | Limite de crédito total          |
| invoice_total | REAL    | SIM          | Valor total da fatura atual      |
| due_date      | TEXT    | SIM          | Data de vencimento (YYYY-MM-DD)  |
| created_at    | TEXT    | NÃO          | Timestamp de criação (auto)      |

### Tabela: `chat_messages` (Histórico de Conversas)

| Campo      | Tipo    | Obrigatório | Descrição                            |
| ---------- | ------- | ----------- | ------------------------------------ |
| id         | INTEGER | SIM (PK)    | Identificador único                  |
| user_id    | INTEGER | SIM (FK)    | ID do usuário (referencia users.id)  |
| origin     | TEXT    | SIM         | Origem da mensagem ("user" ou "bot") |
| author     | TEXT    | SIM         | Autor (ex: "Você", "Chatbot")        |
| text       | TEXT    | SIM         | Conteúdo da mensagem                 |
| created_at | TEXT    | SIM         | Timestamp de criação                 |

---

## 🤖 Sistema de IA (Classificação de Intenções)

### Algoritmo: Naive Bayes Multinomial

O sistema usa **scikit-learn** para classificar intenções de usuário:

1. **Treinamento** (`data/perguntas.csv`):
   - Dataset com 25 exemplos de perguntas
   - 5 categorias: `limite`, `fatura`, `cartao`, `app`, `senha`

2. **Classificação** (`domain/use_case/chat_use_case.py`):
   - Vetorização de texto com `CountVectorizer`
   - Previsão com confiança mínima de 0.4
   - Se confiança < 0.4, retorna mensagem padrão

3. **Respostas** (`data/respostas.json`):
   - Mapeamento direto de categoria para resposta

### Exemplo de Fluxo

```
Usuário: "Qual o limite do meu cartão?"
    ↓
Vetorização → Classificação com Naive Bayes
    ↓
Categoria Prevista: "limite" (confiança: 0.92)
    ↓
Resposta: "Seu limite atual está disponível no aplicativo..."
```

---

## 🔐 Autenticação e Sessões

### Fluxo de Login

1. Usuário insere **CPF** e **Email**
2. Frontend valida CPF (máscara + formato)
3. `POST /auth/login` com credenciais
4. Backend normaliza CPF e busca no banco
5. Se encontrado → Cria **sessão Flask**
6. Redireciona para `/chat`

### Dados de Teste

- **CPF**: `12345678901`
- **Email**: `cliente@demo.com`
- **Nome**: Cliente Demo

---

## 🚀 Guia de Instalação e Execução

### Pré-requisitos

- **Python 3.8+** (testado em 3.10, 3.11, 3.12)
- **pip** (gerenciador de pacotes Python)
- **Git** (opcional, para clonar o repositório)

### Passo 1: Clone o Repositório

```bash
git clone https://github.com/seu-usuario/chatop-flask.git
cd chatop-flask
```

Ou, se já está no diretório:

```bash
cd c:\Users\Felipe\Documents\projetos\chatop-flask
```

### Passo 2: Crie um Ambiente Virtual

**No Windows (PowerShell/CMD):**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**No macOS/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

Você verá `(venv)` no início da linha de comando quando ativado.

### Passo 3: Instale as Dependências

```bash
pip install -r requirements.txt
```

**Dependências instaladas:**

- **Flask 3.0.0** - Framework web
- **pandas 2.1.0** - Manipulação de dados (CSV)
- **scikit-learn 1.3.0** - Machine Learning

### Passo 4: Execute a Aplicação

```bash
python app.py
```

**Saída esperada:**

```
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

### Passo 5: Acesse a Aplicação

Abra seu navegador e acesse:

- **URL**: `http://localhost:5000` ou `http://127.0.0.1:5000`
- **Login**: CPF `12345678901`, Email `cliente@demo.com`

---

## 📖 Guia de Uso

### 1️⃣ Página Inicial (Login)

- Insira seu CPF (será formatado automaticamente como `XXX.XXX.XXX-XX`)
- Insira seu email
- Clique no botão enviar
- Se autenticado com sucesso, será redirecionado para o chat

### 2️⃣ Chat (Atendimento)

- Digite sua pergunta (ex: "Qual meu limite?", "Como aumentar limite?")
- O chatbot responde com base na intenção detectada
- Acesse "Cadastro" para gerenciar clientes
- Clique "Restart" ou "Sair" para logout

### 3️⃣ Página de Clientes

- **Visualizar**: Lista todos os clientes cadastrados
- **Criar**: Formulário para cadastrar novo cliente
- **Editar**: Modifica dados de cliente existente
- **Deletar**: Remove cliente da base

---

## 🛠️ Endpoints da API

### Autenticação

| Método | Rota          | Descrição             | Payload                                           |
| ------ | ------------- | --------------------- | ------------------------------------------------- |
| POST   | `/auth/login` | Login com CPF e Email | `{ "document": "123", "email": "user@mail.com" }` |

### Web

| Método | Rota                   | Descrição                               |
| ------ | ---------------------- | --------------------------------------- |
| GET    | `/`                    | Página inicial/login                    |
| GET    | `/chat`                | Interface do chat (requer autenticação) |
| POST   | `/chat`                | Enviar mensagem (requer autenticação)   |
| GET    | `/clients`             | Página de gestão de clientes            |
| POST   | `/clients`             | Criar novo cliente                      |
| POST   | `/clients/<id>/edit`   | Editar cliente                          |
| POST   | `/clients/<id>/delete` | Deletar cliente                         |
| GET    | `/logout`              | Fazer logout                            |

---

## 🔧 Configurações

### Arquivo: `config/connection.py`

- **DB_PATH**: `chatbot-database.db` (no diretório raiz)
- **Autoload**: Cria tabelas automaticamente na primeira execução

### Arquivo: `domain/use_case/chat_use_case.py`

- **CONFIDENCE_THRESHOLD**: `0.4` (mínimo para responder)
- **FALLBACK**: Mensagem padrão quando confiança < 0.4

---

## 📊 Estrutura do Banco de Dados

O banco de dados é criado automaticamente na primeira execução:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    document TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    admin INTEGER NOT NULL DEFAULT 0,
    card_number TEXT NOT NULL,
    card_type TEXT NOT NULL,
    card_status INTEGER NOT NULL,
    credit_limit REAL NOT NULL,
    invoice_total REAL NOT NULL,
    due_date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    origin TEXT NOT NULL,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🎨 Interface do Usuário

### Tecnologias Frontend

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos responsivos (Flexbox, Grid)
- **JavaScript ES6+** - Interatividade
- **Google Fonts** - Tipografia (Poppins, Roboto)

### Componentes Principais

1. **Chat Interface** - Bolhas de mensagem, input de texto
2. **Formulário de Clientes** - CRUD com validação
3. **Validação de Entrada** - CPF, email, números
4. **Formatação de Entrada** - Máscara de CPF

---

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais.
