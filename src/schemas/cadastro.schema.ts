import { z } from "zod";

function cpfValido(cpf: string) {
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

function dataValida(data: string) {
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

export const CadastroSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(3, "Nome deve ter ao menos 3 caracteres")
    .trim(),
  cpf: z
    .string()
    .min(1, "CPF é obrigatório")
    .refine(cpfValido, "CPF inválido"),
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido")
    .toLowerCase()
    .trim(),
  phoneCode: z.string().min(1, "Código é obrigatório"),
  phone: z
    .string()
    .min(1, "Celular é obrigatório")
    .refine((v) => v.replace(/\D/g, "").length >= 9, "Número inválido"),
  birthDate: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use o formato DD/MM/AAAA")
    .refine(dataValida, "Data inválida"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter ao menos 6 caracteres"),
});

export type CadastroInput = z.infer<typeof CadastroSchema>;
