export function mascararCPF(valor: string) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2");
}

export function mascararCelular(valor: string) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 9)
    .replace(/(\d{5})(\d{1,4})/, "$1-$2");
}

export function mascararData(valor: string) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2");
}

export function mascararCEP(valor: string) {
  return valor.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
}
