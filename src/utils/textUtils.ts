/**
 * Remove acentos, caracteres especiais e converte para maiúsculo.
 * Ex: "São Paulo" -> "SAO PAULO"
 */
export const normalizeCity = (text: string): string => {
  if (!text) return '';
  return String(text)
    .normalize("NFD") // Separa acentos das letras
    .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
    .toUpperCase()
    .trim();
};