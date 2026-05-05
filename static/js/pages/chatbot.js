const form = document.getElementById('chat-form');
const messageInput = document.getElementById('message');
const messageList = document.querySelector('.message-list');
const messageHistory = [];

const parseTimestamp = (timestamp) => {
	if (typeof timestamp === 'number') return new Date(timestamp);
	if (typeof timestamp === 'string') {
		const normalized = timestamp.includes('T') ? timestamp : timestamp.replace(' ', 'T');
		return new Date(normalized);
	}
	return new Date();
};

const messageInfo = {
	formatTime(timestamp) {
		return parseTimestamp(timestamp).toLocaleTimeString('pt-BR', {
			hour: '2-digit',
			minute: '2-digit',
		});
	},
	formatDay(timestamp) {
		const date = parseTimestamp(timestamp);
		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);

		if (date.toDateString() === today.toDateString()) return 'Hoje';
		if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
		return date.toLocaleDateString('pt-BR');
	},
	getAuthor(msg) {
		return msg.author;
	},
};

const renderMessages = () => {
	messageList.innerHTML = '';
	let previousMessageDay = '';

	messageHistory.forEach((msg) => {
		const currentMessageDay = messageInfo.formatDay(msg.timestamp);
		const bubble = document.createElement('div');
		const author = document.createElement('span');
		const text = document.createElement('p');
		const time = document.createElement('span');

		if (currentMessageDay && currentMessageDay !== previousMessageDay) {
			const daySeparator = document.createElement('div');
			daySeparator.classList.add('message-day');
			daySeparator.textContent = currentMessageDay;
			messageList.appendChild(daySeparator);
			previousMessageDay = currentMessageDay;
		}

		bubble.classList.add('message-bubble', msg.origin === 'user' ? 'right' : 'left');

		author.classList.add('message-author');
		author.textContent = messageInfo.getAuthor(msg);

		text.classList.add('message');
		text.textContent = msg.text;

		time.classList.add('message-time');
		time.textContent = messageInfo.formatTime(msg.timestamp);

		bubble.appendChild(author);
		bubble.appendChild(text);
		bubble.appendChild(time);
		messageList.appendChild(bubble);
	});

	messageList.scrollTop = messageList.scrollHeight;
};

const appendMessage = (origin, author, text, timestamp = Date.now()) => {
	messageHistory.push({ origin, author, text, timestamp });
	renderMessages();
};

const hydrateHistoryFromHtml = () => {
	const bubbles = [...messageList.querySelectorAll('.message-bubble')];
	bubbles.forEach((bubble) => {
		const author = bubble.querySelector('.message-author')?.textContent || '';
		const text = bubble.querySelector('.message')?.textContent || '';
		const timestamp = bubble.dataset.timestamp || Date.now();
		const origin = bubble.classList.contains('right') ? 'user' : 'bot';
		if (text.trim()) {
			messageHistory.push({ origin, author, text, timestamp });
		}
	});
	renderMessages();
};

const appendTyping = () => {
	const bubble = document.createElement('div');
	bubble.className = 'message-bubble left';
	bubble.id = 'typing-indicator';

	const textEl = document.createElement('p');
	textEl.className = 'message';
	textEl.textContent = '...';

	bubble.appendChild(textEl);
	messageList.appendChild(bubble);
	messageList.scrollTop = messageList.scrollHeight;
};

const removeTyping = () => {
	document.getElementById('typing-indicator')?.remove();
};

if (form) {
	hydrateHistoryFromHtml();

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const message = messageInput.value.trim();
		if (!message) return;

		appendMessage('user', 'Você', message);
		messageInput.value = '';
		appendTyping();

		await new Promise((resolve) => setTimeout(resolve, 3000));

		const response = await fetch('/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ message }),
		});

		removeTyping();
		const data = await response.json();

		if (response.ok) {
			appendMessage(
				'bot',
				'Chatbot',
				data.reply || 'Erro ao obter resposta.',
				data.timestamp || Date.now(),
			);
			return;
		}

		appendMessage('bot', 'Chatbot', data.error || 'Erro ao obter resposta.', Date.now());
	});

	messageInput.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			form.dispatchEvent(new Event('submit'));
		}
	});

	const initialMessage = new URLSearchParams(window.location.search).get('message');
	if (initialMessage) {
		messageInput.value = initialMessage;
		form.dispatchEvent(new Event('submit'));
		window.history.replaceState({}, '', '/chat');
	}
}
