export type ThresholdStageId = "program" | "marlon" | "spread" | "final";

export const THRESHOLD_STAGES = [
  {
    id: "program",
    number: "01",
    title: "O Programa Limiar",
    period: "Ashen Creek · junho de 1973",
    brief:
      "Uma propriedade comprada, um aparelho sem relatório final e uma ativação que ninguém consegue explicar por completo.",
    hint: "Separe o que os documentos dizem do que Caleb e Voss apenas interpretam.",
  },
  {
    id: "marlon",
    number: "02",
    title: "As fotografias de Marlon",
    period: "Ashen Creek · julho de 1973",
    brief:
      "Sonhos, lapsos de memória e imagens que registram mais do que o fotógrafo lembrava ter visto.",
    hint: "A fotografia sustenta que havia uma silhueta; não revela sua origem nem sua natureza.",
  },
  {
    id: "spread",
    number: "03",
    title: "O que permaneceu",
    period: "Ashen Creek · julho e agosto de 1973",
    brief:
      "Fechar a passagem não encerrou os sinais. Compare os focos observados com as hipóteses de Voss.",
    hint: "O teste de Iara não conclui imunidade ou infecção; a própria Voss mantém possibilidades em aberto.",
  },
  {
    id: "final",
    number: "04",
    title: "A última abertura",
    period: "Ashen Creek · agosto e setembro de 1973",
    brief:
      "O mapa orienta a operação final. O que acontece depois do desabamento ainda deixa perguntas sem resposta.",
    hint: "A passagem é fechada no relato, mas isso não prova que toda ameaça ou vestígio desapareceu.",
  },
] as const;

export const THRESHOLD_EVIDENCE_CLASSES = [
  {
    id: "record",
    label: "Registro",
    description: "Documento, fotografia ou evidência física descrita na fonte.",
  },
  {
    id: "witness",
    label: "Testemunho",
    description: "Observação direta narrada por quem esteve presente.",
  },
  {
    id: "retelling",
    label: "Relato indireto",
    description: "Informação recebida de outra pessoa, sem confirmação independente.",
  },
  {
    id: "hypothesis",
    label: "Hipótese",
    description: "Interpretação possível, apresentada como incerta no relato.",
  },
  {
    id: "unsupported",
    label: "Não sustentado",
    description: "A fonte não permite afirmar isso ou a contradiz.",
  },
] as const;

export type ThresholdEvidenceClass = (typeof THRESHOLD_EVIDENCE_CLASSES)[number]["id"];

export const THRESHOLD_TIMELINE = [
  {
    id: "return-home",
    stage: "program",
    when: "Junho de 1973",
    title: "Iara volta a Ashen Creek",
    text: "Iara retorna à casa da mãe por algumas semanas. Priya conta que Caleb comprou a antiga propriedade de Eleanor Voss, junto à represa.",
    source: "Capítulo 1 · Diagnóstico Diferencial",
  },
  {
    id: "program-found",
    stage: "program",
    when: "Junho de 1973",
    title: "O aparelho no celeiro",
    text: "Caleb mostra um aparelho coberto por lona e documentos incompletos do Programa Limiar. Ele conta que já o ativou por trinta segundos; nada visível aconteceu.",
    source: "Capítulo 2 · O Celeiro",
  },
  {
    id: "second-activation",
    stage: "program",
    when: "Junho de 1973 · noite seguinte",
    title: "Uma janela breve",
    text: "Com Voss presente, a segunda ativação abre uma janela com céu desconhecido. O grupo a fecha; o que havia além dela não é identificado.",
    source: "Capítulo 4 · Trinta Segundos, Outra Vez",
  },
  {
    id: "marlon-dreams",
    stage: "marlon",
    when: "Julho de 1973",
    title: "Algo chama nos sonhos",
    text: "Marlon diz que deixou de fotografar e relata sonhos com algo grande e distante que parece chamá-lo.",
    source: "Capítulo 5 · Coisas Pequenas Demais Pra Contar",
  },
  {
    id: "photograph-found",
    stage: "marlon",
    when: "Julho de 1973",
    title: "O rolo esquecido",
    text: "Marlon encontra fotografias da abertura que não lembrava ter tirado. Uma delas mostra uma silhueta voltada para a câmera.",
    source: "Capítulo 6 · O Que as Fotos Não Mostram",
  },
  {
    id: "marlon-changes",
    stage: "marlon",
    when: "Julho de 1973 · três dias depois",
    title: "A casa de Marlon",
    text: "Iara, Priya e Caleb encontram Marlon ferido e em transformação. A criatura emerge; o grupo foge sem conseguir levá-lo ao carro.",
    source: "Capítulos 7 e 8 · O Que os Ossos Sabem / O Que Saiu do Marlon",
  },
  {
    id: "first-sealing",
    stage: "marlon",
    when: "Julho de 1973 · quase amanhecer",
    title: "A primeira contenção",
    text: "A criatura retorna ao celeiro. Voss usa o frasco e o aparelho para fechar a abertura; o ferimento no ombro de Iara parece um corte comum.",
    source: "Capítulos 11 a 13 · Luzes de Natal em Julho / O Que Ela Não Fez",
  },
  {
    id: "spores-remain",
    stage: "spread",
    when: "Agosto de 1973",
    title: "Sinais no celeiro",
    text: "Duas semanas após a contenção, o grupo encontra protuberâncias identificadas por Voss como esporos que permaneceram no local.",
    source: "Capítulo 15 · Coisas que Crescem no Escuro",
  },
  {
    id: "buster",
    stage: "spread",
    when: "Agosto de 1973",
    title: "O caso de Buster",
    text: "O labrador de uma família vizinha torna-se hospedeiro. Priya usa fogo contra a criatura; o relato não transforma isso numa garantia de que todo foco foi eliminado.",
    source: "Capítulo 16 · O Cachorro do Vizinho",
  },
  {
    id: "blood-test",
    stage: "spread",
    when: "Agosto de 1973 · manhã seguinte",
    title: "Um resultado inconclusivo",
    text: "O teste do sangue de Iara é inconsistente. Voss enumera possibilidades, mas não chega a um diagnóstico.",
    source: "Capítulo 19 · O Que o Teste Revelou",
  },
  {
    id: "diana-finds-focus",
    stage: "spread",
    when: "Agosto de 1973",
    title: "Diana fareja o jardim",
    text: "Diana reage a protuberâncias no jardim antes de Iara perceber o foco. Voss é chamada para avaliar o local.",
    source: "Capítulo 21 · Diana",
  },
  {
    id: "boyle-believes",
    stage: "spread",
    when: "Agosto de 1973 · noite",
    title: "Boyle vê a ameaça",
    text: "Depois de receber as fotografias, Boyle é atacado na Mill Road e passa a ajudar o grupo com base no que presenciou.",
    source: "Capítulos 22 e 23 · A Verdade, Parte Dela / A Prova que Ninguém Pediu",
  },
  {
    id: "flower-map",
    stage: "spread",
    when: "Agosto de 1973",
    title: "Seis focos no mapa",
    text: "Os focos conhecidos parecem formar uma flor em torno do celeiro. Voss considera possível haver inteligência, mas admite que o padrão também pode ser natural.",
    source: "Capítulo 24 · O Padrão",
  },
  {
    id: "countdown",
    stage: "final",
    when: "Agosto de 1973 · dois dias depois",
    title: "Uma operação antes do entardecer",
    text: "Boyle reúne voluntários. O plano é queimar cinco focos periféricos e deixar o celeiro para o fim.",
    source: "Capítulo 25 · Contagem Regressiva",
  },
  {
    id: "barn-collapse",
    stage: "final",
    when: "Agosto de 1973 · entardecer",
    title: "A última abertura",
    text: "O grupo empurra a criatura de volta pela abertura. Voss fecha a passagem e o celeiro desaba; o relato não explica a natureza do que havia do outro lado.",
    source: "Capítulos 26 a 28 · O Que Esperava no Celeiro / O Preço de Florescer / O Toque",
  },
  {
    id: "coin-and-shadow",
    stage: "final",
    when: "Setembro de 1973 · três semanas depois",
    title: "A moeda na gaveta",
    text: "Iara encontra uma moeda com pinheiro e o número 217. Ela vê uma silhueta que desaparece quando pisca e decide não contar a ninguém.",
    source: "Capítulo 29 · A Gaveta",
  },
  {
    id: "epilogue",
    stage: "final",
    when: "Depois de 1973",
    title: "O que Iara escolhe guardar",
    text: "Iara continua guardando a moeda. O epílogo deixa perguntas sobre o objeto e sobre o que a família percebe sem responder se a ameaça permanece ativa.",
    source: "Capítulo 30 · O Que Escolhemos Carregar",
  },
] as const;

export type ThresholdRecord = {
  id: string;
  stage: ThresholdStageId;
  title: string;
  text: string;
  source: string;
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
};

export const THRESHOLD_RECORDS: readonly ThresholdRecord[] = [
  {
    id: "program-files",
    stage: "program",
    title: "Rascunhos do Programa Limiar",
    text: "Caleb relata documentos de financiamento federal, encerrado abruptamente em 1968, sem relatório final localizado. Os rascunhos e cálculos são incompletos; a finalidade exata não fica estabelecida pelos papéis que ele encontrou.",
    source: "Capítulo 2 · O Celeiro",
    imageSrc: "/images/threshold-record.webp",
    imageAlt:
      "Ilustração em tons de cinza de uma caixa de arquivo, um frasco, desenhos técnicos e folhas do Programa Limiar; arte de ambientação do romance.",
    imageCaption:
      "Arte do romance, não documento examinado em cena. Alguns rótulos visuais não são confirmados no texto.",
  },
  {
    id: "machine-in-barn",
    stage: "program",
    title: "O aparelho coberto por lona",
    text: "O aparelho de metal fica no celeiro da propriedade Voss. A descrição não oferece especificações suficientes para identificar seu funcionamento sem recorrer às interpretações de Caleb ou Voss.",
    source: "Capítulo 2 · O Celeiro",
    imageSrc: "/images/threshold-machine.webp",
    imageAlt: "Ilustração em preto e branco do aparelho industrial instalado no celeiro.",
    imageCaption:
      "Arte do romance · representação visual do aparelho, não esquema técnico verificado.",
  },
  {
    id: "coin-on-shelf",
    stage: "program",
    title: "Peça prateada na prateleira",
    text: "Iara nota uma peça pequena, do tamanho de uma moeda, que rola ao tocar a estante. Ela a empurra de volta sem examiná-la. Nesse momento, não registra pinheiro, número ou procedência.",
    source: "Capítulo 2 · O Celeiro",
    imageSrc: "/images/threshold-pine-coin.webp",
    imageAlt: "Ilustração do romance de uma moeda com pinheiro no chão de um laboratório antigo.",
    imageCaption: "Arte de ambientação; Iara não identifica o símbolo nesta cena.",
  },
  {
    id: "caleb-activation",
    stage: "program",
    title: "Trinta segundos de zumbido",
    text: "Caleb conta a Iara que ligou o aparelho por trinta segundos. Ele relata um zumbido, luzes no painel e desligamento automático; diz que nada visível aconteceu.",
    source: "Capítulo 2 · O Celeiro",
  },
  {
    id: "voss-warning",
    stage: "program",
    title: "O aviso de Eleanor Voss",
    text: "Voss afirma que o aparelho foi construído para escutar, não transportar pessoas. Ela relata que uma abertura mais longa em 1968 pareceu chamar a atenção de algo, mas ressalva que não pode provar essa interpretação.",
    source: "Capítulo 4 · Trinta Segundos, Outra Vez",
  },
  {
    id: "second-opening",
    stage: "program",
    title: "A janela observada pelo grupo",
    text: "Na segunda ativação, Iara, Caleb, Priya, Marlon e Voss veem uma abertura com céu e estrelas desconhecidos. O grupo fecha o aparelho; ninguém identifica o lugar ou a natureza do que estaria além.",
    source: "Capítulo 4 · Trinta Segundos, Outra Vez",
  },
  {
    id: "marlon-dreams-record",
    stage: "marlon",
    title: "A mudança de Marlon",
    text: "Priya diz que Marlon deixou de fotografar. Quando Iara fala com ele, Marlon relata sonhos com algo grande e distante que parece chamá-lo; ele não sabe explicar o que significa.",
    source: "Capítulo 5 · Coisas Pequenas Demais Pra Contar",
  },
  {
    id: "unremembered-roll",
    stage: "marlon",
    title: "Fotografias que Marlon não lembra",
    text: "Marlon encontra um rolo na mochila e diz não lembrar de tê-lo fotografado. As imagens mostram a abertura; uma registra uma silhueta voltada para a câmera. Uma marca no canto é ilegível e não deve ser decifrada como dado.",
    source: "Capítulo 6 · O Que as Fotos Não Mostram",
  },
  {
    id: "last-call",
    stage: "marlon",
    title: "As ligações sem resposta",
    text: "Marlon para de atender e pede tempo para descansar. Priya e Iara observam uma mudança de comportamento, mas ainda não sabem o que está acontecendo com ele.",
    source: "Capítulo 7 · O Que os Ossos Sabem",
  },
  {
    id: "marlon-transformation",
    stage: "marlon",
    title: "O pedido de ajuda",
    text: "Na casa de Marlon, os amigos observam alterações físicas e ouvem seu pedido para que não o deixem machucá-los. A criatura emerge durante a transformação; o grupo foge. A origem da criatura não é explicada.",
    source: "Capítulos 7 e 8 · O Que os Ossos Sabem / O Que Saiu do Marlon",
  },
  {
    id: "folder-217",
    stage: "marlon",
    title: "A pasta Registro nº 217",
    text: "Voss afasta uma pasta identificada como Registro nº 217. A cena não mostra seu conteúdo; não é possível concluir o que o número significa nem ligá-lo à moeda que aparecerá mais tarde.",
    source: "Capítulo 10 · O Protocolo",
  },
  {
    id: "theoretical-protocol",
    stage: "marlon",
    title: "Um protocolo ainda não testado",
    text: "Voss propõe usar um frasco para interferir na estrutura da criatura e empurrá-la de volta antes que a passagem se feche. Ela descreve o plano como teórico e não garante o resultado.",
    source: "Capítulo 10 · O Protocolo",
  },
  {
    id: "first-closure",
    stage: "spread",
    title: "O frasco e o ferimento de Iara",
    text: "O grupo consegue fazer a criatura voltar pela abertura e Voss fecha a passagem. Iara é atingida no ombro; Voss observa que o ferimento parece comum, sem explicar por que não apresenta as alterações vistas em Marlon.",
    source: "Capítulos 12 e 13 · O Que Espera na Escuridão / O Que Ela Não Fez",
  },
  {
    id: "remaining-spores",
    stage: "spread",
    title: "Protuberâncias no celeiro",
    text: "Duas semanas depois, Voss identifica focos como esporos que permaneceram após o primeiro fechamento. Isso demonstra que a contenção inicial não removeu todos os vestígios conhecidos.",
    source: "Capítulo 15 · Coisas que Crescem no Escuro",
  },
  {
    id: "buster-host",
    stage: "spread",
    title: "A criatura de Buster",
    text: "Buster, um labrador vizinho, torna-se hospedeiro. Priya usa gasolina e fósforo para queimar a criatura; o episódio é uma observação do grupo, não uma garantia de erradicação geral.",
    source: "Capítulo 16 · O Cachorro do Vizinho",
  },
  {
    id: "ira-test",
    stage: "spread",
    title: "Sangue com resultado inconsistente",
    text: "O exame de Iara produz resultados inconsistentes. Voss apresenta possibilidades, mas não escolhe entre elas nem declara que Iara está imune ou infectada.",
    source: "Capítulo 19 · O Que o Teste Revelou",
  },
  {
    id: "diana-focus",
    stage: "spread",
    title: "O alerta de Diana",
    text: "A cadela da mãe de Iara fareja protuberâncias no jardim e se posiciona diante delas. Voss verifica o foco. A descoberta localiza um perigo, mas não prova que os focos formem um plano intencional.",
    source: "Capítulo 21 · Diana",
  },
  {
    id: "boyle-attack",
    stage: "spread",
    title: "As fotografias e o ataque a Boyle",
    text: "Priya apresenta a Boyle as fotografias de Marlon. Mais tarde, Iara encontra Boyle ferido por uma criatura na Mill Road; a experiência o convence a cooperar.",
    source: "Capítulos 22 e 23 · A Verdade, Parte Dela / A Prova que Ninguém Pediu",
  },
  {
    id: "six-focus-map",
    stage: "spread",
    title: "O desenho no mapa",
    text: "Voss marca seis focos que parecem formar uma flor ao redor do celeiro. Ela considera a possibilidade de inteligência, mas reconhece que a forma também pode ser um padrão natural.",
    source: "Capítulo 24 · O Padrão",
  },
  {
    id: "volunteer-plan",
    stage: "final",
    title: "Cinco focos antes do celeiro",
    text: "Boyle reúne ajudantes e bombeiros voluntários. O plano é queimar os cinco focos periféricos e deixar o celeiro para o fim.",
    source: "Capítulo 25 · Contagem Regressiva",
  },
  {
    id: "passage-sealed",
    stage: "final",
    title: "Fechamento e desabamento",
    text: "Na operação final, o grupo empurra a criatura de volta pela abertura. Voss fecha a passagem; a estrutura do celeiro desaba. O resultado não revela o que existe do outro lado nem prova que todos os esporos sumiram.",
    source: "Capítulos 26 a 28 · O Que Esperava no Celeiro / O Preço de Florescer / O Toque",
  },
  {
    id: "coin-217",
    stage: "final",
    title: "A moeda que reaparece",
    text: "Três semanas depois, Iara encontra uma moeda com um pinheiro e o número 217. O texto não confirma que seja a peça vista no celeiro ou que esteja ligada à pasta de Voss.",
    source: "Capítulo 29 · A Gaveta",
    imageSrc: "/images/threshold-coin-217.webp",
    imageAlt: "Ilustração de uma mão segurando uma moeda com pinheiro e o número 217.",
    imageCaption: "Arte do epílogo · relação com a pasta Registro nº 217 permanece sem explicação.",
  },
  {
    id: "silhouette-after",
    stage: "final",
    title: "Uma silhueta depois do incêndio",
    text: "Iara relata ver uma silhueta que desaparece quando ela pisca. É uma experiência da narradora; o livro não confirma se era uma criatura, uma lembrança ou outra coisa.",
    source: "Capítulo 29 · A Gaveta",
  },
];

export type ThresholdInterview = {
  id: string;
  stage: ThresholdStageId;
  name: string;
  role: string;
  prompt: string;
  answer: string;
  source: string;
};

export const THRESHOLD_INTERVIEWS: readonly ThresholdInterview[] = [
  {
    id: "caleb-machine",
    stage: "program",
    name: "Caleb",
    role: "Proprietário do celeiro",
    prompt: "O que aconteceu quando você ligou o aparelho sozinho?",
    answer:
      "Por cerca de trinta segundos houve um zumbido, as luzes do painel acenderam e o aparelho desligou. Não vi uma abertura nem qualquer outra coisa acontecer.",
    source: "Capítulo 2 · relato de Caleb a Iara",
  },
  {
    id: "voss-program",
    stage: "program",
    name: "Dra. Eleanor Voss",
    role: "Pesquisadora do Programa Limiar",
    prompt: "Para que o aparelho foi construído?",
    answer:
      "Voss diz que pretendiam escutar, não transportar pessoas. Sobre o episódio de 1968, ela relata uma impressão e declara que não consegue prová-la.",
    source: "Capítulo 4 · conversa na casa de Voss",
  },
  {
    id: "marlon-dream",
    stage: "marlon",
    name: "Marlon Ashford",
    role: "Fotógrafo",
    prompt: "O que você lembra dos sonhos?",
    answer:
      "Marlon diz que acorda sentindo que viu algo grande, distante e chamando; ele não sabe explicar o significado nem a origem dessa sensação.",
    source: "Capítulo 5 · conversa com Iara",
  },
  {
    id: "marlon-photo",
    stage: "marlon",
    name: "Marlon Ashford",
    role: "Fotógrafo",
    prompt: "Você sabia que havia fotografado a abertura?",
    answer:
      "Ele diz que não lembrava de ter fotografado. Depois de ver a imagem, afirma lembrar da silhueta olhando de volta, mas isso não esclarece o que ela era.",
    source: "Capítulo 6 · fotografias encontradas na mochila",
  },
  {
    id: "voss-protocol",
    stage: "spread",
    name: "Dra. Eleanor Voss",
    role: "Pesquisadora",
    prompt: "O frasco e o aparelho garantem que a criatura será contida?",
    answer:
      "Não. Voss apresenta um protocolo teórico, admite que não foi testado daquela forma e não pode garantir o resultado.",
    source: "Capítulo 10 · O Protocolo",
  },
  {
    id: "ira-testimony",
    stage: "spread",
    name: "Iara",
    role: "Narradora e sobrevivente",
    prompt: "O que o exame de sangue concluiu sobre você?",
    answer:
      "Nada conclusivo. O resultado é inconsistente e Voss lista possibilidades sem afirmar infecção, imunidade ou outra condição.",
    source: "Capítulo 19 · O Que o Teste Revelou",
  },
  {
    id: "boyle-testimony",
    stage: "spread",
    name: "Frank Boyle",
    role: "Investigador local",
    prompt: "Por que você passou a cooperar com o grupo?",
    answer:
      "Boyle primeiro vê as fotografias, mas sua mudança de posição ocorre depois de ser atacado e testemunhar a criatura na Mill Road.",
    source: "Capítulos 22 e 23 · delegacia e Mill Road",
  },
  {
    id: "boyle-operation",
    stage: "final",
    name: "Frank Boyle",
    role: "Investigador e aliado",
    prompt: "Qual era o plano para os focos?",
    answer:
      "O grupo organizou uma operação para queimar cinco focos periféricos e enfrentar o foco central no celeiro por último.",
    source: "Capítulo 25 · Contagem Regressiva",
  },
  {
    id: "ira-epilogue",
    stage: "final",
    name: "Iara",
    role: "Narradora",
    prompt: "A moeda ou a silhueta explicam o que restou do caso?",
    answer:
      "Não. Iara guarda a moeda e relata uma silhueta, mas a narrativa deixa em aberto sua origem e qualquer relação com a passagem fechada.",
    source: "Capítulos 29 e 30 · A Gaveta / O Que Escolhemos Carregar",
  },
];

export type ThresholdClaim = {
  id: string;
  stage: ThresholdStageId;
  statement: string;
  correctClass: ThresholdEvidenceClass;
  rationale: string;
};

export const THRESHOLD_CLAIMS: readonly ThresholdClaim[] = [
  {
    id: "federal-program",
    stage: "program",
    statement:
      "Os documentos localizados por Caleb citam financiamento federal e encerramento em 1968, sem relatório final encontrado.",
    correctClass: "record",
    rationale: "Isso é descrito como informação dos documentos incompletos encontrados no celeiro.",
  },
  {
    id: "caleb-first-activation",
    stage: "program",
    statement:
      "Caleb relata um zumbido e luzes por trinta segundos, sem abertura visível na primeira ativação.",
    correctClass: "witness",
    rationale: "É o relato direto de Caleb sobre a ativação anterior.",
  },
  {
    id: "voss-listening",
    stage: "program",
    statement: "Voss afirma que a intenção do aparelho era escutar, não transportar pessoas.",
    correctClass: "witness",
    rationale:
      "É uma declaração atribuída diretamente a Voss, não uma especificação técnica verificada.",
  },
  {
    id: "first-activation-portal",
    stage: "program",
    statement: "A primeira ativação de Caleb comprovadamente abriu uma passagem.",
    correctClass: "unsupported",
    rationale: "Caleb relata apenas zumbido, luzes e desligamento; diz que nada visível aconteceu.",
  },
  {
    id: "voss-proved-1968",
    stage: "program",
    statement: "Voss provou que uma criatura percebeu a abertura de 1968.",
    correctClass: "unsupported",
    rationale: "Voss relata sua impressão, mas diz explicitamente que não consegue prová-la.",
  },
  {
    id: "marlon-dreams-claim",
    stage: "marlon",
    statement: "Marlon relata sonhos com algo grande e distante que parecia chamá-lo.",
    correctClass: "witness",
    rationale:
      "O conteúdo é apresentado por Marlon como sua própria experiência; sua causa continua desconhecida.",
  },
  {
    id: "silhouette-photo",
    stage: "marlon",
    statement:
      "Uma fotografia revelada por Marlon mostra uma silhueta voltada para a câmera através da abertura.",
    correctClass: "record",
    rationale: "A imagem é evidência fotográfica no relato, embora não identifique a silhueta.",
  },
  {
    id: "marlon-memory",
    stage: "marlon",
    statement: "Marlon diz não lembrar de ter fotografado o rolo encontrado na mochila.",
    correctClass: "witness",
    rationale: "É uma declaração direta dele; não explica por que o rolo estava lá.",
  },
  {
    id: "photo-origin-known",
    stage: "marlon",
    statement: "A fotografia prova a origem, espécie e intenção da silhueta.",
    correctClass: "unsupported",
    rationale: "A imagem registra uma forma voltada à câmera, mas não revela essas informações.",
  },
  {
    id: "marlon-transformed",
    stage: "marlon",
    statement: "Os amigos observam uma criatura emergir durante a transformação de Marlon.",
    correctClass: "witness",
    rationale: "A transformação e a fuga são narradas pelos amigos presentes.",
  },
  {
    id: "217-file-opened",
    stage: "marlon",
    statement: "O grupo lê a pasta Registro nº 217 e confirma que ela explica a moeda.",
    correctClass: "unsupported",
    rationale: "A pasta é afastada sem ser aberta; a relação com a moeda nunca é confirmada.",
  },
  {
    id: "protocol-guaranteed",
    stage: "marlon",
    statement: "Antes da primeira contenção, Voss garante que o protocolo funcionará.",
    correctClass: "unsupported",
    rationale: "Voss descreve um plano teórico e não garante o resultado.",
  },
  {
    id: "first-closure-seen",
    stage: "spread",
    statement:
      "O grupo vê a passagem ser fechada, mas Voss não explica por que o ferimento de Iara parece comum.",
    correctClass: "witness",
    rationale:
      "Ambos são fatos observados na primeira contenção; a causa do resultado de Iara permanece aberta.",
  },
  {
    id: "spores-remain",
    stage: "spread",
    statement:
      "Duas semanas depois, Voss identifica protuberâncias que permaneceram como focos de esporos.",
    correctClass: "witness",
    rationale:
      "O grupo observa os focos e Voss os identifica; a contenção anterior não eliminou esses vestígios.",
  },
  {
    id: "fire-total-solution",
    stage: "spread",
    statement: "O caso de Buster prova que o fogo eliminou todos os focos da região.",
    correctClass: "unsupported",
    rationale: "O fogo é usado contra aquela criatura; outros focos ainda são encontrados depois.",
  },
  {
    id: "ira-immune",
    stage: "spread",
    statement: "O teste de sangue prova que Iara é imune à contaminação.",
    correctClass: "unsupported",
    rationale: "O resultado é inconsistente e Voss não escolhe entre as possibilidades.",
  },
  {
    id: "diana-finds-focus",
    stage: "spread",
    statement: "Diana reage às protuberâncias no jardim antes que Iara as perceba.",
    correctClass: "witness",
    rationale: "Iara observa a reação da cadela e o foco que ela fareja.",
  },
  {
    id: "flower-hypothesis",
    stage: "spread",
    statement:
      "Voss considera possível que o padrão floral seja guiado por inteligência, sem descartar uma formação natural.",
    correctClass: "hypothesis",
    rationale: "É uma interpretação explicitamente incerta de Voss.",
  },
  {
    id: "boyle-saw-creature",
    stage: "spread",
    statement: "Boyle passa a cooperar depois de ser atacado e ver a criatura na Mill Road.",
    correctClass: "witness",
    rationale: "A mudança decorre da experiência direta de Boyle, não apenas das fotografias.",
  },
  {
    id: "six-focus-design",
    stage: "final",
    statement:
      "O romance confirma que os seis focos foram deliberadamente dispostos como uma flor inteligente.",
    correctClass: "unsupported",
    rationale:
      "A forma aparece no mapa, mas Voss mantém abertas a hipótese de inteligência e a possibilidade de padrão natural.",
  },
  {
    id: "five-peripheral-sites",
    stage: "final",
    statement: "O plano prevê queimar cinco focos periféricos antes de enfrentar o celeiro.",
    correctClass: "record",
    rationale: "O plano da operação é descrito antes do confronto final.",
  },
  {
    id: "passage-closed",
    stage: "final",
    statement:
      "No confronto final, o grupo empurra a criatura de volta e Voss fecha a passagem; o celeiro desaba.",
    correctClass: "witness",
    rationale: "Esses acontecimentos são narrados por Iara, que está presente na operação.",
  },
  {
    id: "marlon-conscious",
    stage: "final",
    statement: "Está provado que Marlon permaneceu consciente dentro da criatura até o fim.",
    correctClass: "unsupported",
    rationale:
      "Há um instante que pode parecer uma manifestação de Marlon, mas a narrativa não confirma o que ocorreu.",
  },
  {
    id: "coin-file-link",
    stage: "final",
    statement:
      "A moeda com pinheiro e 217 é comprovadamente a mesma peça ou registro que a pasta nº 217.",
    correctClass: "unsupported",
    rationale:
      "O número e o símbolo reaparecem, mas a narrativa não confirma origem nem identidade comum.",
  },
  {
    id: "threat-ended",
    stage: "final",
    statement:
      "O fechamento da passagem prova que todos os esporos e qualquer ameaça desapareceram para sempre.",
    correctClass: "unsupported",
    rationale:
      "Esporos persistiram após a primeira contenção e o epílogo deixa questões abertas após o desabamento.",
  },
];

export type ThresholdClaimAnswers = Partial<
  Record<(typeof THRESHOLD_CLAIMS)[number]["id"], ThresholdEvidenceClass>
>;

export const THRESHOLD_VERDICTS = [
  {
    id: "supported-containment",
    title:
      "A passagem foi aberta e depois fechada; a origem e o fim de todos os riscos continuam sem prova.",
    text: "O grupo presencia duas ativações, a transformação de Marlon, focos posteriores e o fechamento da passagem. A narrativa não explica o que havia do outro lado, a condição de Iara ou se todo vestígio desapareceu.",
    correct: true,
  },
  {
    id: "farm-accident",
    title:
      "Foi apenas um acidente no celeiro, e as fotografias e os ataques são interpretações sem valor.",
    text: "Essa leitura ignora observações compartilhadas, fotografias, focos posteriores e o ataque testemunhado por Boyle.",
    correct: false,
  },
  {
    id: "complete-immunity",
    title:
      "Iara é imune, a criatura foi destruída por completo e o Programa Limiar explica sua origem.",
    text: "O teste de Iara é inconclusivo, a origem da criatura não é explicada e o fechamento da passagem não prova que todo risco terminou.",
    correct: false,
  },
  {
    id: "marlon-returned",
    title: "Marlon atravessou a passagem vivo e a moeda 217 confirma que ele voltou depois.",
    text: "A narrativa não comprova que Marlon sobreviveu ou voltou. A moeda e a pasta numerada não têm vínculo explicado.",
    correct: false,
  },
] as const;

export type ThresholdVerdictId = (typeof THRESHOLD_VERDICTS)[number]["id"];

export function checkThresholdStageClaims(
  stage: ThresholdStageId,
  answers: ThresholdClaimAnswers,
): boolean {
  const claims = THRESHOLD_CLAIMS.filter((claim) => claim.stage === stage);
  return claims.length > 0 && claims.every((claim) => answers[claim.id] === claim.correctClass);
}

export function getThresholdActionCounts(input: {
  recordsOpened: number;
  interviewsOpened: number;
  claimsCorrect: number;
  stagesCompleted: number;
  verdictCorrect: boolean;
}) {
  const correctActions =
    Math.min(THRESHOLD_RECORDS.length, Math.max(0, input.recordsOpened)) +
    Math.min(THRESHOLD_INTERVIEWS.length, Math.max(0, input.interviewsOpened)) +
    Math.min(THRESHOLD_CLAIMS.length, Math.max(0, input.claimsCorrect)) +
    Math.min(THRESHOLD_STAGES.length, Math.max(0, input.stagesCompleted)) +
    (input.verdictCorrect ? 1 : 0);
  const totalActions =
    THRESHOLD_RECORDS.length +
    THRESHOLD_INTERVIEWS.length +
    THRESHOLD_CLAIMS.length +
    THRESHOLD_STAGES.length +
    1;
  return { correctActions, totalActions };
}

export function getThresholdScore(input: {
  recordsOpened: number;
  interviewsOpened: number;
  claimsCorrect: number;
  stagesCompleted: number;
  verdictCorrect: boolean;
  mistakes: number;
  hints: number;
}): number {
  const recordScore =
    (Math.min(THRESHOLD_RECORDS.length, Math.max(0, input.recordsOpened)) /
      THRESHOLD_RECORDS.length) *
    25;
  const interviewScore =
    (Math.min(THRESHOLD_INTERVIEWS.length, Math.max(0, input.interviewsOpened)) /
      THRESHOLD_INTERVIEWS.length) *
    10;
  const claimScore =
    (Math.min(THRESHOLD_CLAIMS.length, Math.max(0, input.claimsCorrect)) /
      THRESHOLD_CLAIMS.length) *
    35;
  const stageScore =
    (Math.min(THRESHOLD_STAGES.length, Math.max(0, input.stagesCompleted)) /
      THRESHOLD_STAGES.length) *
    20;
  const verdictScore = input.verdictCorrect ? 10 : 0;
  const penalty = Math.max(0, input.mistakes) * 5 + Math.max(0, input.hints) * 3;
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(recordScore + interviewScore + claimScore + stageScore + verdictScore - penalty),
    ),
  );
}
