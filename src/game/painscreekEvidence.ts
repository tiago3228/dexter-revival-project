/**
 * Catálogo documental de Painscreek (PDF, páginas 80–116); o status indica revisão da fonte, não confirmação de todas as alegações.
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
      "A carta de Sylvia ao padre Calvin (página 93) relata que, ao chegar a Painscreek em 4 de julho de 1975, soube do colapso de Vivian após o parto de Trisha e da relação de Charles com a criada Sofia, que teve um menino. Sylvia diz que Sofia e o filho haviam desaparecido e que Magdalene organizou uma busca com ela e Patrick; a carta também menciona a morte de Magdalene após menos de dois meses de busca. Outras páginas registram o segredo e a gravidez.",
    pendingVerification:
      "A página 93 foi cotejada visualmente; as demais referências agrupadas (98, 102, 103, 112–114) ainda precisam de conferência individual para consolidar a cronologia sem duplicar fatos.",
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
      "A carta de Nelson & Brown, datada de 17 de fevereiro de 1993, acusa Henry Johnson de enviar transferências mensais de US$ 9.990 para uma conta offshore em nome de Jefferson Investments, Ltd. O remetente estima o total em cerca de US$ 160.000 ao longo de dezesseis meses.",
    pendingVerification:
      "A carta foi cotejada com a página 97; localizar comprovantes ou fontes independentes que corroborem a acusação financeira.",
    confidence: "high",
    status: "visually-checked",
    playerInference:
      "O relatório registra uma acusação; ela não equivale, por si só, a prova judicial ou motivo confirmado.",
  },
  {
    id: "P-008",
    title: "Morte de Henry Johnson",
    pages: [85],
    sourceType: "Notícia de jornal",
    documented:
      "A notícia de 13 de julho de 1995 relata que Henry Johnson foi encontrado no carro submerso no Lago Cherry Creek; o texto diz que o corpo permaneceu na água entre dez e quinze dias e que o hospital o viu pela última vez em 28 de junho.",
    pendingVerification:
      "A notícia foi cotejada com a página 85; buscar registros oficiais sobre causa e circunstâncias da morte, sem presumir conexão com a alegação financeira.",
    confidence: "high",
    status: "visually-checked",
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
      "Uma notícia de 21 de fevereiro de 1996 relata que o Hospital Comunitário de Painscreek fechou após cerca de 60 anos. O hospital teria sido inaugurado em 1936; a matéria também descreve a iniciativa de Vivian Roberts de apoiar sua renovação no início dos anos 1970 e o declínio populacional posterior.",
    pendingVerification:
      "A página 84 foi cotejada visualmente. Investigar a alegação financeira com fontes independentes e não presumir que ela corresponda ao relatório de 1993.",
    confidence: "medium",
    status: "visually-checked",
    playerInference:
      "A notícia oferece contexto histórico do hospital, mas não comprova por si só desvio de fundos nem ligação direta com os eventos posteriores.",
  },
  {
    id: "P-014",
    title: "Tragédia na mina de carvão",
    pages: [86],
    sourceType: "Notícia comemorativa",
    documented:
      "Uma matéria de 3 de março de 1993 relembra um acidente de demolição na mina de carvão ocorrido vinte anos antes: seis moradores de Painscreek e outros treze de Hillsdale e Old Creek morreram. A Companhia de Mineração Roberts era dona da mina; Vivian organizou uma ação que arrecadou US$ 96.000 e, com US$ 24.000 da própria empresa, resultou em US$ 120.000 de compensação às seis famílias.",
    pendingVerification:
      "A página 86 foi cotejada visualmente. Os números e a data foram conferidos na imagem; buscar fontes independentes se o jogo precisar tratar o evento como fato histórico corroborado.",
    confidence: "high",
    status: "visually-checked",
    playerInference:
      "O texto registra memória pública e contexto comunitário; a OCR não é suficiente para fixar todos os números ou inferir relação com o caso principal.",
  },
  {
    id: "P-015",
    title: "Morte de Andrew Reed em incêndio",
    pages: [87],
    sourceType: "Notícia de jornal e relato de investigação",
    documented:
      "Uma notícia de 7 de junho de 1995 relata que Andrew Reed, funcionário da mansão, foi encontrado morto após um incêndio em sua casa na rua Blackpine, nº 7. A causa não havia sido determinada; garrafas de bebida no local sugeriam uma hipótese acidental, e a matéria afirma que assassinato não havia sido identificado até então.",
    pendingVerification:
      "A página 87 foi cotejada visualmente. Procurar registros posteriores do incêndio; não transformar a hipótese inicial em causa confirmada.",
    confidence: "medium",
    status: "visually-checked",
    playerInference:
      "A matéria contém hipóteses e relatos atribuídos a terceiros; não estabelece definitivamente a causa do incêndio nem se houve crime.",
  },
  {
    id: "P-016",
    title: "Scott declara-se inocente",
    pages: [88],
    sourceType: "Notícia de jornal sobre declaração em tribunal",
    documented:
      "A notícia relata que Scott Brooks se declarou inocente no tribunal. Ele afirmou que encontrou Vivian na floresta, deixou-a viva e voltou para sua cabana, onde diz ter permanecido por dias sem saber do assassinato; estava detido e ainda não tinha fiança definida.",
    pendingVerification:
      "A página 88 foi cotejada com o OCR; comparar a versão atribuída a Scott com o relatório policial da página 90 e distinguir alegação de conclusão judicial.",
    confidence: "high",
    status: "visually-checked",
    playerInference:
      "A declaração é a versão atribuída a Scott, não uma confirmação independente de seu relato nem uma conclusão sobre culpa.",
  },
  {
    id: "P-017",
    title: "Realocação do xerife James Howard",
    pages: [89],
    sourceType: "Carta administrativa",
    documented:
      "Uma carta administrativa do Departamento do Xerife do distrito de NL informa James Howard de que foi realocado para Grand County a partir de 14 de maio de 1998 e pede que se apresente ao escritório antes de 12 de maio.",
    pendingVerification:
      "A página 89 foi cotejada visualmente. Procurar referências posteriores à transferência apenas se sua relevância investigativa for estabelecida.",
    confidence: "medium",
    status: "visually-checked",
    playerInference:
      "A carta registra uma mudança de lotação. Sem outras fontes, não se deve inferir que ela tenha relação com a investigação de Vivian.",
  },
  {
    id: "P-018",
    title: "Carta de recuperação endereçada a Daniel",
    pages: [91],
    sourceType: "Carta pessoal",
    documented:
      "A carta manuscrita começa com “Querido Daniel” e relata melhora durante a recuperação, acompanhamento do Dr. Johnson, trabalho em tempo integral na mansão e o fim das alucinações. O texto termina incompleto no trecho visível da página.",
    pendingVerification:
      "A página 91 foi cotejada visualmente, mas não mostra assinatura nem a conclusão da carta. Identificar o remetente apenas se outra fonte o confirmar; não inferir diagnóstico ou identidade pelo conteúdo clínico.",
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
      "Uma carta de 16 de outubro de 1973, assinada por Eric W. Campbell em nome de Jackson & Lewis, agradece à Sra. Roberts por designar a empresa como fornecedora do Hospital Comunitário. Menciona a candidatura de Charles a prefeito, benefícios para a empresa e fundos de apoio usados em pesquisa e assistência a pacientes idosos; informa que os documentos contratuais seriam enviados em seguida.",
    pendingVerification:
      "A página 92 foi cotejada visualmente; a carta anuncia documentos contratuais futuros, mas esses anexos não estão presentes nesta página.",
    confidence: "high",
    status: "visually-checked",
    playerInference:
      "A carta documenta uma relação comercial e uma percepção sobre seus benefícios; não comprova irregularidade por si só.",
  },


  {
    id: "P-020",
    title: "Laudo médico de Vivian Roberts",
    pages: [94],
    sourceType: "Relatório médico do Hospital Comunitário",
    documented:
      "O relatório assinado pelo Dr. Henry Johnson informa Charles Roberts de que Vivian estava estabilizando, não poderia mais dar à luz e precisava de seis meses de reabilitação. O médico observa que a presença de Charles a estressava e que a expectativa da mãe dele por um herdeiro homem aumentava a tensão.",
    pendingVerification:
      "A página 94 foi cotejada visualmente. Confirmar se outros documentos clínicos contextualizam o relatório; seu conteúdo não estabelece, por si só, causa criminal.",
    confidence: "high",
    status: "visually-checked",
    playerInference:
      "O laudo documenta a avaliação escrita de Johnson e a tensão familiar descrita por ele; não permite diagnosticar retrospectivamente nem provar motivação para um crime.",
  },
  {
    id: "P-021",
    title: "Ficha de funcionário de Bernard Hopkins",
    pages: [95],
    sourceType: "Ficha de funcionário da mansão",
    documented:
      "A ficha identifica Bernard Hopkins como funcionário regular, mordomo responsável pelo gerenciamento dos funcionários e da casa. Registra nascimento em 15 de novembro de 1944, contratação em 8 de maio de 1973 e jornada de oito horas por dia, cinco dias por semana.",
    pendingVerification:
      "A página 95 foi cotejada visualmente. Cruzar cargo e datas com outros registros da mansão antes de atribuir relevância ao caso.",
    confidence: "high",
    status: "visually-checked",
    playerInference:
      "A ficha confirma a função e os dados administrativos registrados; não indica, por si só, envolvimento em eventos investigados.",
  },
  {
    id: "P-022",
    title: "Carta de despedida de Dorothy",
    pages: [96],
    sourceType: "Carta pessoal",
    documented:
      "Em carta datada de 31 de janeiro de 1996 e dirigida a Charles, Dorothy diz ter trabalhado na casa por mais de vinte anos, recorda com afeto Trisha e lamenta deixar o serviço após os acontecimentos em Painscreek, sem detalhá-los.",
    pendingVerification:
      "A página 96 foi cotejada visualmente. Buscar a carta completa ou outras fontes para identificar a que acontecimentos Dorothy se refere, sem preencher a lacuna por inferência.",
    confidence: "high",
    status: "visually-checked",
    playerInference:
      "A carta registra a despedida e o vínculo afetivo de Dorothy com Trisha; a referência a acontecimentos em Painscreek não explica quais foram nem demonstra culpa de alguém.",
  },
];
