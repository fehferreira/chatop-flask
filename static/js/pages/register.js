import { applyCpfMask, applyCardNumberMask } from '/static/js/utils/masks.js';

const clientsData = document.getElementById('clients-data');
const clients = JSON.parse(clientsData?.textContent || '[]');

const clientList = document.getElementById('client-list');

const form = document.querySelector('.register-form-area');
const submitButton = document.getElementById('submit-button');
const documentInput = document.getElementById('document');
const cardInput = document.getElementById('cardNumber');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const adminInput = document.getElementById('admin');
const cardType = document.getElementById('cardType');
const cardStatus = document.getElementById('cardStatus');
const creditLimitInput = document.getElementById('creditLimit');
const availableLimitInput = document.getElementById('availableLimit');
const invoiceTotalInput = document.getElementById('invoiceTotal');
const dueDateInput = document.getElementById('dueDate');

if (clientList) {
	clientList.addEventListener('click', (event) => {
		const editButton = event.target.closest('[data-action="edit"]');
		if (!editButton) return;

		const clientId = Number(editButton.dataset.id);
		const client = clients.find((item) => item.id === clientId);
		if (!client) return;

		nameInput.value = client.name || '';
		documentInput.value = applyCpfMask(client.document || '');
		emailInput.value = client.email || '';
		adminInput.checked = Boolean(client.admin);

		cardInput.value = client.card?.number || '';
		cardType.value = client.card?.type || '';
		cardStatus.value = String(client.card?.status ?? '');
		creditLimitInput.value = client.card?.credit_limit ?? '';
		availableLimitInput.value = client.card?.available_limit ?? '';
		invoiceTotalInput.value = client.card?.invoice_total ?? '';

		dueDateInput.type = 'date';
		dueDateInput.value = client.card?.due_date || '';

		form.action = `/clients/${clientId}/edit`;
		submitButton.textContent = 'Salvar alterações';
	});
}

if (documentInput) {
	documentInput.addEventListener('input', () => {
		documentInput.value = applyCpfMask(documentInput.value);
	});
}

if (cardInput) {
	cardInput.addEventListener('input', () => {
		cardInput.value = applyCardNumberMask(cardInput.value);
	});
}
