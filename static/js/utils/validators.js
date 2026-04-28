export const isValidCpf = (cpf) => {
  const digits = cpf.replace(/\D/g, '');

  return digits.length === 11;
};

export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const validateOnboardingCredentials = ({ document, email }) => {
  const errors = [];

  if (document && !isValidCpf(document)) {
    errors.push('CPF inválido. Informe um CPF válido para continuar.');
  }

  if (email && !isValidEmail(email)) {
    errors.push('E-mail inválido. Informe um endereço válido para continuar.');
  }

  return errors;
};

export const validateClientForm = ({ name, document, email, card }) => {
  const errors = [];

  if (!name || name.trim().length < 3) {
    errors.push('Nome deve ter no mínimo 3 caracteres.');
  }

  if (!isValidCpf(document)) {
    errors.push('CPF inválido.');
  }

  if (!isValidEmail(email)) {
    errors.push('E-mail inválido.');
  }

  if (!card.number || !/^\d{4}$/.test(card.number)) {
    errors.push('Final do cartão deve ter exatamente 4 dígitos.');
  }

  if (!card.type) {
    errors.push('Selecione o tipo do cartão.');
  }

  if (card.status !== 0 && card.status !== 1) {
    errors.push('Selecione o status do cartão.');
  }

  if (!card.credit_limit || card.credit_limit <= 0) {
    errors.push('Limite total deve ser maior que zero.');
  }

  if (card.available_limit < 0 || card.available_limit > card.credit_limit) {
    errors.push('Limite disponível inválido.');
  }

  if (card.invoice_total < 0) {
    errors.push('Valor da fatura não pode ser negativo.');
  }

  if (!card.due_date) {
    errors.push('Informe a data de vencimento.');
  }

  return errors;
};
