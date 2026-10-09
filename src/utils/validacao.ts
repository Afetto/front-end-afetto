// Validações puras reaproveitadas pelos schemas (cadastro e esqueci a senha)

// Dígitos verificadores do CPF (aceita com ou sem máscara)
export function cpfValido(cpf: string) {
  const digitos = cpf.replace(/\D/g, "");
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(digitos[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(digitos[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(digitos[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(digitos[10]);
}

// Data DD/MM/AAAA que existe no calendário e já passou
export function dataValida(data: string) {
  const [dia, mes, ano] = data.split("/").map(Number);
  if (!dia || !mes || !ano || ano < 1900) return false;
  const d = new Date(ano, mes - 1, dia);
  return (
    d.getFullYear() === ano &&
    d.getMonth() === mes - 1 &&
    d.getDate() === dia &&
    d < new Date()
  );
}
