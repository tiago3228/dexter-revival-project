/**
 * Catálogo documental preliminar de Painscreek (PDF, páginas 80–116).
 *
 * Este arquivo normaliza referências para implementação futura; não está conectado
 * à interface do jogo. "documented" descreve o que a fonte relata, não prova
 * independente de que a alegação seja verdadeira.
 */
export type PainscreekEvidenceStatus =
  | "unverified"
  | "visually-checked"
  | "incomplete"
  | "contradictory";

export type PainscreekEvidence = {
  id: string;
  title: string;
  pages: number[];
  sourceType: string;
  documented: string;
  pendingVerification: string;
  confidence: "low" | "medium" | "high";
  status: PainscreekEvidenceStatus;
  playerInference: string;
};

export const PAINSCREEK_EVIDENCE_080_116: PainscreekEvidence[] = [
  {
    id: "P-001",
    title: "Carta de ameaça a Vivian",
    pages: [100],
    sourceType: "Referência indireta a documento",
    documented:
      "O remetente anônimo afirma ter incluído uma cópia de uma carta de ameaça recebida por Vivian no dia de sua morte.",
    pendingVerification:
      "Localizar a carta citada e verificar texto, data, remetente e destinatário.",
    confidence: "high",
    status: "incomplete",
    playerInference:
      "A menção indica uma fonte a localizar; o conteúdo e a autoria da ameaça não estão estabelecidos.",
  },
  {
    id: "P-002",
    title: "Incidente de 1975",
    pages: [93, 98, 99, 102, 103, 111],
    sourceType: "Relato indireto e conexão a verificar",
    documented:
      "Steven Moss teria mencionado um incidente de 1975 como possível avanço. O autor do livro de registro pergunta se ele se relaciona à empregada que deixou Painscreek.",
    pendingVerification:
      "Identificar o incidente referido e confirmar se está ligado a Sofia ou a outra pessoa.",
    confidence: "medium",
    status: "incomplete",
    playerInference:
      "Existe uma linha de investigação sugerida pelo registro, mas a identidade do incidente não está confirmada.",
  },
  {
    id: "P-003",
    title: "Código 0318",
    pages: [102],
    sourceType: "Código mencionado em carta",
    documented:
      "Matthew associa o código 0318 à data da chegada de Sofia ao orfanato.",
    pendingVerification:
      "Verificar eventual correspondência com objeto ou mecanismo do jogo; a carta foi conferida visualmente, mas a função de puzzle não foi validada.",
    confidence: "medium",
    status: "visually-checked",
    playerInference:
      "O código pode ser relevante, mas não deve ser tratado como solução de puzzle sem validação adicional.",
  },
  {
    id: "P-004",
    title: "Fita de vigilância ausente",
    pages: [106, 107],
    sourceType: "Livro de segurança",
    documented:
      "Uma nota atribuída a Magdalene pede a localização de uma fita de vigilância de 28 de junho de 1975; o registro informa que ela não foi encontrada.",
    pendingVerification:
      "Cruzar inventários e referências posteriores sem presumir que a fita foi destruída ou escondida.",
    confidence: "high",
    status: "unverified",
    playerInference:
      "A ausência está registrada; a causa e a responsabilidade pela ausência permanecem desconhecidas.",
  },
  {
    id: "P-005",
    title: "Fotografia emprestada por Scott",
    pages: [104, 116],
    sourceType: "Entrada de diário",
    documented:
      "Em 13 de fevereiro de 1995, Scott pede emprestada uma fotografia do álbum de Dorothy após uma conversa sobre Charles e Vivian.",
    pendingVerification:
      "Identificar a fotografia, verificar se foi devolvida e procurar outras referências.",
    confidence: "high",
    status: "incomplete",
    playerInference:
      "O empréstimo é relatado por Dorothy; a identidade da foto e seu significado não estão estabelecidos.",
  },
  {
    id: "P-006",
    title: "Gravidez de Sofia e segredo de Charles",
    pages: [93, 98, 102, 103, 112, 113, 114],
    sourceType: "Diário e cartas",
    documented:
      "O diário de Dorothy relata que Charles pediu que ela cuidasse de Sofia durante a gravidez e mantivesse o assunto em segredo; outras cartas tratam da situação de Sofia e do bebê.",
    pendingVerification:
      "Conferir cartas parcialmente encobertas e estabelecer a cronologia completa da saída de Sofia e da criança.",
    confidence: "high",
    status: "incomplete",
    playerInference:
      "Os documentos indicam segredo e gravidez; detalhes do desfecho exigem cruzamento de fontes.",
  },
  {
    id: "P-007",
    title: "Alegação sobre fundos da Roberts Relief",
    pages: [84, 92, 97],
    sourceType: "Relatório de investigação privada",
    documented:
      "Um relatório acusa Henry Johnson de transferir fundos para uma conta offshore e estima o total em aproximadamente US$ 160.000.",
    pendingVerification:
      "Procurar comprovantes ou fontes independentes que corroborem a acusação.",
    confidence: "high",
    status: "unverified",
    playerInference:
      "O relatório registra uma acusação; ela não equivale, por si só, a prova judicial ou motivo confirmado.",
  },
  {
    id: "P-008",
    title: "Morte de Henry Johnson",
    pages: [85],
    sourceType: "Notícia de jornal",
    documented:
      "A notícia relata que Henry Johnson foi encontrado morto em um veículo submerso no Lago Cherry Creek em julho de 1995.",
    pendingVerification:
      "Cruzar a notícia com registros oficiais e outras fontes, sem presumir conexão com a alegação financeira.",
    confidence: "high",
    status: "unverified",
    playerInference:
      "A notícia documenta a descoberta do corpo; causa, circunstâncias e conexões não estão confirmadas neste catálogo.",
  },
  {
    id: "P-009",
    title: "Mulher vista na floresta",
    pages: [109],
    sourceType: "Relato indireto em livro de segurança",
    documented:
      "Uma entrada relata que Stephanie, de seis anos, se perdeu na floresta no Dia das Bruxas de 1994 e disse que uma mulher bonita, de cabelos pretos compridos e vestido preto semelhante ao das empregadas da mansão, a encontrou e a levou para casa; as empregadas disseram estar trabalhando naquela noite.",
    pendingVerification:
      "Procurar relatos independentes semelhantes; a identidade da mulher e a discrepância dos relatos permanecem sem solução.",
    confidence: "medium",
    status: "visually-checked",
    playerInference:
      "É um relato atribuído à criança, registrado por terceiro; a identidade da mulher não está estabelecida.",
  },
  {
    id: "P-010",
    title: "Scott como suspeito da morte de Vivian",
    pages: [82, 83, 90, 104],
    sourceType: "Notícia, relatório policial e carta pessoal",
    documented:
      "Notícias e relatório policial registram Scott como suspeito; uma carta atribuída a Scott nega que ele tenha matado Vivian.",
    pendingVerification:
      "Separar cronologicamente suspeita, depoimentos, investigação e eventual resultado jurídico.",
    confidence: "high",
    status: "unverified",
    playerInference:
      "Suspeita, testemunho indireto e negação pessoal são versões a avaliar, não uma conclusão final.",
  },
  {
    id: "P-011",
    title: "Scott ajuda Andrew e pega uma fotografia",
    pages: [108, 115, 116],
    sourceType: "Livro de segurança e diário",
    documented:
      "Registros atribuem a Scott ajuda a Andrew durante uma crise em 1994; em fevereiro de 1995, Scott pede emprestada uma fotografia do álbum de Dorothy.",
    pendingVerification:
      "Confirmar a sequência dos eventos e se há alguma relação documentada entre eles.",
    confidence: "high",
    status: "unverified",
    playerInference:
      "A proximidade no dossiê não prova relação causal entre os eventos.",
  },
  {
    id: "P-012",
    title: "Wanda Tyler e Derrick",
    pages: [80, 81],
    sourceType: "Diário pessoal",
    documented:
      "Wanda descreve o apoio de Derrick durante seu tratamento e sua preocupação com a saúde e o futuro.",
    pendingVerification:
      "Cruzar com fontes independentes caso essa relação se mostre relevante para a cronologia principal.",
    confidence: "high",
    status: "unverified",
    playerInference:
      "O diário documenta a perspectiva de Wanda; a relevância para a investigação principal ainda não está estabelecida.",
  },

  {
    id: "P-013",
    title: "Fechamento do Hospital Comunitário",
    pages: [84],
    sourceType: "Notícia de jornal",
    documented:
      "Uma notícia datada de 21 de fevereiro de 1956 relata o fechamento do Hospital Comunitário de Painscreek após cerca de 60 anos de serviço. A matéria aponta suspeitas de desvio de fundos como possível fator, mas também descreve declínio populacional e dificuldades de atendimento.",
    pendingVerification:
      "Conferir visualmente a data e os trechos sobre o fechamento; cruzar as alegações financeiras com os documentos de 1993 sem presumir que se trata do mesmo episódio.",
    confidence: "medium",
    status: "unverified",
    playerInference:
      "A notícia oferece contexto histórico do hospital, mas não comprova por si só desvio de fundos nem ligação direta com os eventos posteriores.",
  },
  {
    id: "P-014",
    title: "Tragédia na mina de carvão",
    pages: [86],
    sourceType: "Notícia comemorativa",
    documented:
      "Uma matéria datada de maio de 1993 relembra a morte de trabalhadores em um acidente na mina de carvão vinte anos antes e menciona uma ação beneficente associada à família Roberts.",
    pendingVerification:
      "Conferir a data exata, o número de vítimas e os valores arrecadados na imagem original; verificar se outras fontes documentam o acidente.",
    confidence: "low",
    status: "unverified",
    playerInference:
      "O texto registra memória pública e contexto comunitário; a OCR não é suficiente para fixar todos os números ou inferir relação com o caso principal.",
  },
  {
    id: "P-015",
    title: "Morte de Andrew Reed em incêndio",
    pages: [87],
    sourceType: "Notícia de jornal e relato de investigação",
    documented:
      "A notícia relata que Andrew Reed foi encontrado morto após um incêndio em sua casa. O texto menciona queimaduras graves, uma possível origem do fogo relacionada a álcool derramado e relatos de que Reed havia bebido naquela noite.",
    pendingVerification:
      "Conferir visualmente o endereço, a data e a formulação sobre a causa do incêndio; procurar o restante da matéria e eventuais registros policiais.",
    confidence: "medium",
    status: "unverified",
    playerInference:
      "A matéria contém hipóteses e relatos atribuídos a terceiros; não estabelece definitivamente a causa do incêndio nem se houve crime.",
  },
  {
    id: "P-016",
    title: "Scott declara-se inocente",
    pages: [88],
    sourceType: "Notícia de jornal sobre declaração em tribunal",
    documented:
      "Uma notícia relata que Scott Brooks se declarou inocente da morte de Vivian Roberts e afirmou que a encontrou na floresta, mas foi embora antes do assassinato.",
    pendingVerification:
      "Cruzar a declaração com o relatório policial da página 90 e distinguir a versão de Scott das conclusões da investigação.",
    confidence: "high",
    status: "unverified",
    playerInference:
      "A declaração é a versão atribuída a Scott, não uma confirmação independente de seu relato nem uma conclusão sobre culpa.",
  },
  {
    id: "P-017",
    title: "Realocação do xerife James Howard",
    pages: [89],
    sourceType: "Carta administrativa",
    documented:
      "Uma carta do Departamento do Xerife informa James Howard de sua transferência para Grand County, com data prevista de início em maio de 1998.",
    pendingVerification:
      "Conferir o texto integral, o nome do distrito e as datas na imagem original; procurar referências posteriores à transferência.",
    confidence: "medium",
    status: "unverified",
    playerInference:
      "A carta registra uma mudança de lotação. Sem outras fontes, não se deve inferir que ela tenha relação com a investigação de Vivian.",
  },
  {
    id: "P-018",
    title: "Carta de recuperação endereçada a Daniel",
    pages: [91],
    sourceType: "Carta pessoal",
    documented:
      "Uma carta dirigida a Daniel relata melhora durante a recuperação, acompanhamento do Dr. Johnson e trabalho em tempo integral na mansão. O trecho visível menciona alucinações que teriam passado.",
    pendingVerification:
      "Identificar o remetente pela página completa e conferir o restante da carta; não inferir diagnóstico nem identidade apenas pelo trecho OCR.",
    confidence: "low",
    status: "incomplete",
    playerInference:
      "O fragmento é uma comunicação pessoal sobre recuperação; autoria, contexto clínico e relação com outros registros ainda precisam ser estabelecidos.",
  },
  {
    id: "P-019",
    title: "Contrato de fornecimento do hospital",
    pages: [92],
    sourceType: "Carta comercial",
    documented:
      "Uma carta datada de 16 de outubro de 1973 agradece à Sra. Roberts por designar Jackson & Lewis como fornecedora do Hospital Comunitário e menciona os benefícios comerciais do contrato.",
    pendingVerification:
      "Confirmar visualmente a identidade completa da destinatária, os termos do contrato e se os documentos contratuais citados aparecem em outras páginas.",
    confidence: "medium",
    status: "unverified",
    playerInference:
      "A carta documenta uma relação comercial e uma percepção sobre seus benefícios; não comprova irregularidade por si só.",
  },

];
