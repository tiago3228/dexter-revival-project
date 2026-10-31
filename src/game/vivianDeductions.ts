export type VivianDeduction = {
  id: string;
  title: string;
  question: string;
  sources: readonly string[];
  options: readonly { id: string; label: string }[];
  answer: string;
  insight: string;
};

// Optional exercises interpret existing sources; they never establish a culprit.
export const VIVIAN_DEDUCTIONS: readonly VivianDeduction[] = [
  {
    id: "witness-limits",
    title: "Uma discussão, duas versões",
    question: "O que as testemunhas permitem afirmar sobre a discussão?",
    sources: ["police-report", "scott-denial"],
    options: [
      { id: "confession", label: "Ouviram Scott confessar o crime." },
      { id: "discussion", label: "Ouviram uma discussão, mas não identificaram as palavras." },
      { id: "innocence", label: "Confirmaram que Scott foi embora e não voltou." },
    ],
    answer: "discussion",
    insight: "CONFIRMADO no registro: há relato de uma discussão. PENDENTE: o conteúdo e uma confirmação independente da versão de Scott. A suspeita permanece HIPÓTESE, não prova de autoria.",
  },
  {
    id: "money-causality",
    title: "O dinheiro explica a morte?",
    question: "O nome de Henry aparece no relatório financeiro e na notícia do lago. Qual conclusão respeita as duas fontes?",
    sources: ["funds-investigation", "henry-death"],
    options: [
      { id: "motive", label: "A transferência foi comprovadamente a causa da morte." },
      { id: "lead", label: "Existe uma linha de pesquisa, mas a relação causal está pendente." },
      { id: "verdict", label: "O relatório equivale a uma condenação judicial." },
    ],
    answer: "lead",
    insight: "CONFIRMADO nas fontes: o nome aparece em ambos os registros. HIPÓTESE: pode haver uma ligação. PENDENTE: corroboração da acusação e circunstâncias da morte.",
  },
  {
    id: "family-context",
    title: "Contexto não é veredito",
    question: "A carta familiar e o relatório médico bastam para atribuir o homicídio a Charles?",
    sources: ["charles-secret", "vivian-medical"],
    options: [
      { id: "guilty", label: "Sim: o conflito pessoal estabelece a autoria." },
      { id: "cleared", label: "Não: os documentos provam que ele é inocente." },
      { id: "context", label: "Não: descrevem contexto pessoal, sem estabelecer culpa ou inocência." },
    ],
    answer: "context",
    insight: "CONFIRMADO: os documentos descrevem aspectos da relação e da saúde de Vivian. HIPÓTESE: um conflito pode orientar perguntas. PENDENTE: evidência independente sobre o homicídio.",
  },
  {
    id: "missing-photo",
    title: "O que falta na fotografia?",
    question: "Qual lacuna impede transformar o empréstimo da foto em prova contra Scott?",
    sources: ["dorothy-photo", "police-report"],
    options: [
      { id: "content", label: "A identidade, o conteúdo e a relevância da imagem ainda não estão estabelecidos." },
      { id: "borrow", label: "Pedir uma foto emprestada já comprova participação no crime." },
      { id: "alibi", label: "A foto comprova onde Scott estava na hora da morte." },
    ],
    answer: "content",
    insight: "CONFIRMADO no diário: o empréstimo é mencionado. HIPÓTESE: a foto pode ser relevante. PENDENTE: localizar a imagem e verificar seu conteúdo antes de atribuir significado criminal.",
  },
];

export function evaluateVivianDeduction(id: string, answer: string, found: readonly string[]) {
  const deduction = VIVIAN_DEDUCTIONS.find((item) => item.id === id);
  if (!deduction || !deduction.sources.every((source) => found.includes(source))) return "locked";
  return deduction.answer === answer ? "supported" : "unsupported";
}