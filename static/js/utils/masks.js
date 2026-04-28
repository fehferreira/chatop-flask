export const applyCpfMask = (value) => {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const applyCardNumberMask = (value) => {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
};

export const applyCurrencyMask = (value) => {
  const numeric = value.replace(/\D/g, '');

  if (!numeric) {
    return '';
  }

  return (Number(numeric) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
