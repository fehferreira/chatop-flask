import json
import os

import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

_BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")
_CSV_PATH = os.path.join(_BASE_DIR, "perguntas.csv")
_JSON_PATH = os.path.join(_BASE_DIR, "respostas.json")

_CONFIDENCE_THRESHOLD = 0.4
_FALLBACK = (
    "Não entendi sua pergunta. Você quis perguntar sobre "
    "limite, fatura, cartão, aplicativo ou senha?"
)


def _train():
    df = pd.read_csv(_CSV_PATH)
    phrase_column = "phrase" if "phrase" in df.columns else "frase"
    category_column = "category" if "category" in df.columns else "categoria"

    phrases = df[phrase_column].tolist()
    categories = df[category_column].tolist()

    vectorizer = CountVectorizer()
    X = vectorizer.fit_transform(phrases)

    model = MultinomialNB()
    model.fit(X, categories)

    with open(_JSON_PATH, "r", encoding="utf-8") as f:
        responses = json.load(f)

    return vectorizer, model, responses


_vectorizer, _model, _responses = _train()


def respond(question: str) -> str:
    input_vector = _vectorizer.transform([question.lower()])
    predicted_category = _model.predict(input_vector)[0]
    confidence = max(_model.predict_proba(input_vector)[0])

    if confidence < _CONFIDENCE_THRESHOLD:
        return _FALLBACK

    return _responses.get(predicted_category, _FALLBACK)


def responder(question: str) -> str:
    return respond(question)
