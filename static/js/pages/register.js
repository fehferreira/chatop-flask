import { applyCpfMask, applyCardNumberMask, applyCurrencyMask, parseCurrencyMask, toCurrencyMask } from '/static/js/utils/masks.js';
import { validateClientForm } from '/static/js/utils/validators.js';

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
const invoiceTotalInput = document.getElementById('invoiceTotal');
const dueDateInput = document.getElementById('dueDate');

const getCardDigits = (value) => {
	return value.replace(/\D/g, '').slice(0, 16);
};

const getOrCreateErrorToast = () => {
	let toast = document.getElementById('form-error');

	if (!toast) {
		toast = document.createElement('div');
		toast.id = 'form-error';
		document.body.appendChild(toast);
	}

	toast.className = 'toast toast--error';
	return toast;
};

const showFormErrors = (errors) => {
	const toast = getOrCreateErrorToast();
	toast.textContent = errors.map(e => `- ${e}`).join('\n');
};

const clearFormErrors = () => {
	const toast = document.getElementById('form-error');
	if (!toast) return;

	toast.remove();
};

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

		cardInput.value = applyCardNumberMask(client.card?.number || '');
		cardType.value = client.card?.type || '';
		cardStatus.value = String(client.card?.status ?? '');
		creditLimitInput.value = toCurrencyMask(client.card?.credit_limit);
		invoiceTotalInput.value = toCurrencyMask(client.card?.invoice_total);

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

if (creditLimitInput) {
	creditLimitInput.addEventListener('input', () => {
		creditLimitInput.value = applyCurrencyMask(creditLimitInput.value);
	});
}

if (invoiceTotalInput) {
	invoiceTotalInput.addEventListener('input', () => {
		invoiceTotalInput.value = applyCurrencyMask(invoiceTotalInput.value);
	});
}

if (form) {
	form.noValidate = true;

	form.addEventListener('submit', (event) => {
		const cardStatusValue = cardStatus?.value;
		const parsedCardStatus = cardStatusValue === '' ? null : Number(cardStatusValue);

		const payload = {
			name: nameInput?.value || '',
			document: documentInput?.value || '',
			email: emailInput?.value || '',
			card: {
				number: getCardDigits(cardInput?.value || ''),
				type: cardType?.value || '',
				status: parsedCardStatus,
				credit_limit: parseCurrencyMask(creditLimitInput?.value),
				invoice_total: parseCurrencyMask(invoiceTotalInput?.value),
				due_date: dueDateInput?.value || '',
			},
		};

		const errors = validateClientForm(payload);

		if (errors.length > 0) {
			event.preventDefault();
			showFormErrors(errors);
			return;
		}

		clearFormErrors();
	});
}
