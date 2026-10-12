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
      "A página 100 foi cotejada visualmente, mas a carta de ameaça anexada não aparece no documento consultado. Identificar o remetente anônimo apenas se outra fonte o confirmar.",
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
      "As páginas 98–99 foram cotejadas visualmente; as demais referências agrupadas (102, 103, 111) ainda precisam de conferência individual para consolidar cronologia e identidade sem duplicar fatos.",
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
      "As páginas 106–107 foram conferidas visualmente. Cruzar inventários e referências posteriores sem presumir que a fita foi destruída ou escondida.",
    confidence: "high",
    status: "visually-checked",
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
      "Notícias e relatório policial registram Scott como suspeito; uma carta atribuída a Scott nega que tenha matado Vivian. Na carta a Trisha (p. 104), Scott também afirma que não matou Vivian e associa sua descoberta sobre os pais biológicos à oposição do padre Matthew ao relacionamento entre eles.",
    pendingVerification:
      "As páginas 82–83, 90 e 104 foram cotejadas visualmente; separar cronologicamente suspeita, depoimentos, investigação e eventual resultado jurídico, e não tratar a negação de Scott como prova independente.",
    confidence: "high",
    status: "visually-checked",
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
      "As páginas 108, 115 e 116 foram conferidas visualmente. Confirmar a sequência dos eventos e se há alguma relação documentada entre eles; não inferir causalidade entre os episódios.",
    confidence: "high",
    status: "visually-checked",
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
    pages: [59, 86],
    sourceType: "Notícia comemorativa e nota biográfica",
    documented:
      "A matéria de 3 de março de 1993 na página 86 relembra um acidente de demolição na mina de carvão ocorrido vinte anos antes: seis moradores de Painscreek e outros treze de Hillsdale e Old Creek morreram. A Companhia de Mineração Roberts era dona da mina; Vivian organizou uma ação que arrecadou US$ 96.000 e, com US$ 24.000 da própria empresa, resultou em US$ 120.000 de compensação às seis famílias. A nota biográfica da página 59 também associa um acidente de mineração de 1973 à crise da companhia, mas serve como contexto e não confirma independentemente todos os detalhes da notícia.",
    pendingVerification:
      "A página 86 foi cotejada visualmente. A página 59 menciona um acidente de mineração de 1973; a correspondência temporal e temática é plausível, mas não presumir que ambas as fontes forneçam detalhes idênticos.",
    confidence: "medium",
    status: "incomplete",
    playerInference:
      "O texto registra memória pública e contexto comunitário. A nota biográfica da página 59 pode apontar para o mesmo acidente, mas não estabelece relação com o caso principal nem permite inferir responsabilidade criminal.",
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
    title: "Ficha de Bernard Hopkins com anotação investigativa",
    pages: [61, 95],
    sourceType: "Ficha de funcionário com anotação manuscrita de investigação",
    documented:
      "A ficha administrativa identifica Bernard Hopkins como mordomo, registra seu nascimento em 15 de novembro de 1944, contratação em 8 de maio de 1973, jornada de trabalho e endereço na Avenida Silverlake, n.º 31. A página 61 mostra anotações investigativas sobre a morte do pai em acidente na mina e a afirmação de que Bernard estava em casa na noite da morte de Vivian, acompanhada da nota 'Sem álibi'.",
    pendingVerification:
      "A página 95 foi cotejada visualmente e a página 61 apresenta escrita manuscrita parcialmente encoberta pelo texto impresso. A correspondência do nome e endereço sustenta que se trata da mesma ficha; preservar separadamente os campos impressos e as notas do investigador. A expressão 'Sem álibi' é uma anotação, não prova de envolvimento.",
    confidence: "medium",
    status: "incomplete",
    playerInference:
      "O registro permite relacionar a ficha administrativa à linha investigativa, mas não demonstra que Bernard tenha participado da morte de Vivian. A anotação não deve ser apresentada como conclusão policial confirmada.",
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

  {
    id: "P-023",
    title: "Conselho de Henry sobre Sofia e o bebê",
    pages: [98],
    sourceType: "Carta pessoal com conteúdo médico e familiar",
    documented:
      "Em carta datada de 18 de junho de 1975, Henry Johnson escreve a Vivian como amigo e a aconselha a fazer Sofia e o bebê deixarem Charles e Painscreek, oferecendo compensação. Ele alerta que a divulgação do caso poderia prejudicar a carreira política de Charles e menciona a possibilidade de Charles registrar o menino.",
    pendingVerification:
      "A página 98 foi cotejada visualmente. Comparar a carta com outros documentos sobre Sofia, o bebê e a pressão familiar; o conselho não prova que a proposta foi executada.",
    confidence: "high",
    status: "visually-checked",
    playerInference:
      "A carta evidencia o conselho dado por Henry e sua preocupação com as consequências públicas; não demonstra, isoladamente, o destino de Sofia e da criança.",
  },
  {
    id: "P-024",
    title: "Carta de Rachel Davis sobre a origem de Scott",
    pages: [99],
    sourceType: "Carta do orfanato São Patrício",
    documented:
      "Em carta datada de 2 de fevereiro de 1994, Rachel Davis escreve a Scott que ele foi levado ao orfanato pelo padre Calvin em 4 de julho de 1975, ainda bebê, e que lhe disseram que perdera os pais. Ela também relata que o padre Matthew o visitava depois de assumir a Igreja da Trindade de Painscreek e deixava dinheiro para ele e para o orfanato.",
    pendingVerification:
      "A página 99 foi cotejada visualmente. Os fatos sobre a chegada de Scott são relatados por Rachel; procurar registros independentes do orfanato e da adoção.",
    confidence: "high",
    status: "visually-checked",
    playerInference:
      "A carta fornece a versão de Rachel sobre a infância de Scott, mas não identifica seus pais biológicos nem confirma de forma independente as circunstâncias de sua chegada.",
  },
  {
    id: "P-025",
    title: "Contratação de Steven Moss",
    pages: [100],
    sourceType: "Carta de contratação de investigador particular",
    documented:
      "Em 13 de março de 1997, uma pessoa anônima contrata Steven Moss para investigar o assassinato de Vivian Roberts. O remetente diz que Scott foi detido como suspeito e depois solto por falta de evidências, que o caso foi arquivado como não solucionado e que incluiu uma cópia da carta de ameaça recebida por Vivian no dia de sua morte.",
    pendingVerification:
      "A página 100 foi cotejada visualmente. A carta de ameaça mencionada como anexo não está visível neste documento; a identidade do contratante permanece desconhecida.",
    confidence: "high",
    status: "visually-checked",
    playerInference:
      "A carta registra a versão do contratante sobre a investigação e indica um anexo ausente; não comprova, por si só, a história processual ou o conteúdo da ameaça.",
  },
  {
    id: "P-026",
    title: "Advogado aceita representar Scott",
    pages: [101],
    sourceType: "Carta jurídica",
    documented:
      "Brendan O’Mally informa ao Sr. Brooks que seu escritório aceitou representar Scott no tribunal e está preparando um recurso para sua libertação. Pede que o pai não faça declarações públicas antes de consultar os advogados e solicita cópias de documentos governamentais relacionados ao filho.",
    pendingVerification:
      "A página 101 foi cotejada visualmente. A carta não informa o resultado do recurso; localizar documentos judiciais posteriores se forem necessários para completar a cronologia.",
    confidence: "high",
    status: "visually-checked",
    playerInference:
      "A carta confirma a contratação de representação jurídica conforme o remetente, mas não estabelece o resultado do recurso nem a culpa ou inocência de Scott.",
  },


  {
    id: "P-027",
    title: "Carta de Scott para Trisha",
    pages: [104],
    sourceType: "Carta pessoal",
    documented:
      "Scott escreve a Trisha que saber sobre seus pais biológicos mudou sua compreensão da oposição do padre Matthew ao relacionamento deles. Ele nega ter matado Vivian, diz não saber quem a matou e pede perdão pela dor que causou.",
    pendingVerification:
      "A página 104 foi cotejada visualmente. Comparar a carta com os documentos sobre a origem de Scott e a relação com Trisha; a negação é uma declaração do próprio Scott, não confirmação independente.",
    confidence: "high",
    status: "visually-checked",
    playerInference:
      "A carta revela o que Scott diz compreender sobre o parentesco e o relacionamento, mas não identifica seus pais biológicos nem resolve a morte de Vivian.",
  },
  {
    id: "P-028",
    title: "Registro de enfermagem com ocorrências de 1993–1994",
    pages: [105],
    sourceType: "Registro interno de enfermagem",
    documented:
      "O registro reúne anotações datadas de 19 de maio de 1993, 4 e 20 de junho de 1993 e 26 de junho de 1994. Inclui uma tentativa frustrada de contatar o Dr. Johnson após Nora Jefferson ser levada ao hospital, uma ausência por doença e falta de pessoal, a morte por afogamento de Timothy Scott, de seis anos, e a observação de uma jovem perto do consultório do Dr. Johnson após o horário de visitas.",
    pendingVerification:
      "A página 105 foi lida com apoio de OCR, mas a transcrição integral e alguns detalhes precisam de conferência visual cuidadosa. Não presumir que os eventos estejam relacionados entre si.",
    confidence: "medium",
    status: "incomplete",
    playerInference:
      "As notas registram incidentes distintos em datas diferentes; a proximidade na mesma página não prova conexão causal ou participação de qualquer personagem.",
  },
,

  {
    id: "P-029",
    title: "Registro de segurança: intruso no jardim",
    pages: [106],
    sourceType: "Livro de segurança da mansão",
    documented:
      "Uma anotação datada de 18 de março de 1994 relata que um homem de cerca de 1,70 m, usando moletom com capuz, escalou a cerca, atravessou o jardim e pulou o muro. A câmera não registrou seu rosto; o Sr. Roberts pediu a instalação de mais câmeras.",
    pendingVerification:
      "O conteúdo visível da página 106 foi conferido com a digitalização. A identidade do intruso e a relação do episódio com outros eventos não estão estabelecidas.",
    confidence: "high",
    status: "visually-checked",
    playerInference:
      "O registro documenta uma invasão e uma limitação da vigilância; não identifica o intruso nem demonstra ligação com a morte de Vivian.",
  },
  {
    id: "P-030",
    title: "Mudanças na equipe e ocorrência com Andrew",
    pages: [107, 108],
    sourceType: "Livro de segurança da mansão",
    documented:
      "O registro informa a chegada de novas fitas VHS em 25 de março de 1994 e a contratação de Samuel Green como novo segurança em 28 de maio. Em 4 de julho, Andrew teria chegado muito embriagado à mansão por volta das 23h, e Scott foi chamado para levá-lo para casa. Uma anotação de 12 de agosto registra vinte anos de serviço de Tom Parker e sua saída prevista para cuidar da esposa doente.",
    pendingVerification:
      "As páginas 107–108 foram conferidas visualmente. Confirmar grafias e cruzar os horários com outros registros, sem presumir que os episódios estejam relacionados.",
    confidence: "high",
    status: "visually-checked",
    playerInference:
      "Os registros fornecem contexto sobre segurança e rotina da mansão; não provam que Andrew ou Scott estivessem envolvidos em um crime.",
  },
  {
    id: "P-031",
    title: "Referência duplicada ao desaparecimento de Stephanie — ver P-009",
    pages: [109],
    sourceType: "Referência editorial duplicada; mesma fonte de P-009",
    documented:
      "Esta entrada repete o episódio já catalogado em P-009: a anotação de 2 de novembro de 1994 relata que Stephanie, de seis anos, se perdeu na floresta na noite de Halloween e disse que uma mulher de cabelos pretos compridos, vestida como uma empregada da mansão, a ajudou. Não é uma segunda fonte nem uma confirmação independente.",
    pendingVerification:
      "A página 109 foi conferida visualmente. Manter este ID apenas para rastreabilidade histórica do catálogo; não contar P-031 como evidência independente nem como novo achado. Consolidar referências futuras em P-009.",
    confidence: "low",
    status: "incomplete",
    playerInference:
      "P-031 é uma duplicata editorial de P-009, não um segundo evento. A descrição da mulher continua sem identificação confirmada."
  },
  {
    id: "P-032",
    title: "Livro da pousada: Steven Moss e o caso Vivian",
    pages: [110, 111],
    sourceType: "Livro de registro da pousada",
    documented:
      "Em 20 de março de 1997, o autor do registro anota rumores de que Steven Moss foi contratado para investigar a morte de Vivian depois que a polícia encerrou as buscas. Em 9 de abril, Matthew diz que pretende deixar Painscreek e que os serviços dele não serão mais necessários; o autor questiona se Scott matou Vivian ou foi acusado injustamente. Em 14 de abril, Moss pergunta ao autor sobre o que sabe e menciona um incidente de 1975 como possível avanço; o autor pergunta se isso tem relação com a empregada que deixou a cidade.",
    pendingVerification:
      "As páginas 110–111 foram conferidas visualmente. A referência ao incidente de 1975 também aparece em P-002; manter as entradas cruzadas sem contar o mesmo relato como confirmação independente.",
    confidence: "high",
    status: "visually-checked",
    playerInference:
      "O registro documenta rumores e conversas sobre a investigação; a pista de 1975 é uma hipótese de Moss e não identifica, por si só, a empregada ou o responsável pela morte.",
  },
  {
    id: "P-033",
    title: "Anotações de Dorothy sobre Sofia e a gravidez",
    pages: [112, 113, 114],
    sourceType: "Diário ou anotações pessoais de Dorothy Patterson",
    documented:
      "As anotações datadas de 20 de junho e 24 de setembro de 1973 descrevem visitas de Matthew a Sofia e uma conversa em que Sofia diz não saber como é ser amada por pais. Em 2 e 6 de fevereiro de 1975, Dorothy registra que Charles pediu que cuidasse de Sofia em uma casa afastada da mansão e que os dois combinaram manter a gravidez em segredo. Em 6 de abril de 1975, Dorothy escreve que Sofia estava no oitavo mês, esperançosa com o futuro e pensando que seria melhor se o bebê fosse menino.",
    pendingVerification:
      "As páginas 112–114 foram conferidas visualmente. Os registros são a versão escrita por Dorothy; cruzar com cartas de Henry, Rachel e outros documentos antes de fixar todos os detalhes da cronologia.",
    confidence: "high",
    status: "visually-checked",
    playerInference:
      "As anotações sustentam que a gravidez de Sofia foi ocultada e que Charles participou dos preparativos descritos por Dorothy; não provam que todos os planos tenham sido executados como previsto.",
  },
  {
    id: "P-034",
    title: "Anotações sobre Andrew, Scott e a fotografia emprestada",
    pages: [115, 116],
    sourceType: "Diário ou livro de memórias",
    documented:
      "Uma anotação de 23 de setembro de 1994 relata outra tentativa de suicídio de Andrew e atribui a Scott o ato de salvá-lo; a de 10 de outubro descreve melhora de Andrew e visitas frequentes de Scott. Em 13 de fevereiro de 1995, Scott visita o autor para consertar uma pia, conversa sobre Charles e Vivian e pede emprestada uma fotografia de um álbum. Em 19 de junho de 1995, o autor registra a morte de Andrew e o reencontro de Laura e Daniel no funeral, lamentando não ter ligado para Laura antes.",
    pendingVerification:
      "As páginas 115–116 foram conferidas visualmente. A identificação exata do autor dessas anotações e a fotografia emprestada ainda precisam ser confirmadas com outras páginas; não presumir que a fotografia seja uma prova específica.",
    confidence: "medium",
    status: "visually-checked",
    playerInference:
      "As anotações estabelecem uma sequência relatada sobre Andrew e o empréstimo de uma foto; a identidade da foto e sua relevância para a investigação permanecem em aberto.",
  },
];
