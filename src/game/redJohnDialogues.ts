import type { StoryDialogueScene } from "./StoryDialogue";

export const DEXTER_JANE_DIALOGUE: StoryDialogueScene = {
  id: "dexter-patrick-jane",
  title: "Dois homens lendo a sala",
  subtitle: "Sala de observação do CBI · após a primeira pista de Red John",
  opening: [
    {
      speaker: "Dexter Morgan",
      text: "As pessoas gostam de dizer que não têm nada a esconder. Você gosta de mostrar que sabe o que elas escondem.",
    },
    {
      speaker: "Patrick Jane",
      text: "A diferença é que eu prefiro que acreditem que sou um mágico. É menos ameaçador do que admitir que só presto atenção.",
    },
    {
      speaker: "Dexter Morgan",
      text: "Mágicos não deixam rastros. Assassinos, às vezes, deixam sorrisos.",
    },
    {
      speaker: "Patrick Jane",
      text: "E às vezes deixam um sorriso porque querem que alguém específico o encontre.",
    },
    {
      speaker: "Dexter Morgan",
      text: "Red John voltou. Você fala como se a mensagem fosse para você.",
    },
    { speaker: "Patrick Jane", text: "É. Mas isso não quer dizer que ele controla a conversa." },
    {
      speaker: "Dexter Morgan",
      text: "Você está tentando controlar esta conversa desde que entrou.",
    },
    {
      speaker: "Patrick Jane",
      text: "E você está tentando parecer entediado desde que ouviu o nome dele. Nós dois somos melhores nisso quando ninguém está olhando.",
    },
  ],
  choices: [
    {
      id: "jane-reads-dexter",
      label: "Perguntar o que Jane percebe em Dexter",
      lines: [
        { speaker: "Dexter Morgan", text: "Então leia-me. O que você acha que vê?" },
        {
          speaker: "Patrick Jane",
          text: "Você organiza a sala em detalhes: a porta, as mãos, quem está perto do telefone. Não é curiosidade. É uma maneira de garantir que nada o surpreenda.",
        },
        { speaker: "Dexter Morgan", text: "Isso descreve qualquer bom investigador." },
        {
          speaker: "Patrick Jane",
          text: "Não. Um bom investigador quer descobrir o que aconteceu. Você quer saber se consegue manter tudo sob controle quando descobrir.",
        },
        {
          speaker: "Dexter Morgan",
          text: "E você faz piadas para que ninguém perceba quando acerta.",
        },
        { speaker: "Patrick Jane", text: "Viu? Também estou prestando atenção." },
      ],
    },
    {
      id: "dexter-reads-jane",
      label: "Perguntar por que Jane transforma a dor em espetáculo",
      lines: [
        {
          speaker: "Dexter Morgan",
          text: "Você faz a sala rir antes de fazer a sala falar. É uma técnica ou uma defesa?",
        },
        {
          speaker: "Patrick Jane",
          text: "As duas coisas. Se as pessoas riem, baixam a guarda. Se eu rio, por alguns segundos não preciso lembrar por que comecei.",
        },
        { speaker: "Dexter Morgan", text: "Você está falando de Red John." },
        {
          speaker: "Patrick Jane",
          text: "Estou falando do preço de transformar uma perda em missão. A missão continua depois que a pessoa que você perdeu não pode voltar.",
        },
        { speaker: "Dexter Morgan", text: "E você ainda acha que pode encerrar isso." },
        {
          speaker: "Patrick Jane",
          text: "Acho que posso escolher como termina. Não é a mesma coisa.",
        },
      ],
    },
    {
      id: "methods",
      label: "Comparar a perícia de Dexter com a leitura comportamental de Jane",
      lines: [
        {
          speaker: "Dexter Morgan",
          text: "Você observa um tremor e chama de medo. Eu observo uma mancha e pergunto de onde veio. Qual de nós está mais perto da verdade?",
        },
        {
          speaker: "Patrick Jane",
          text: "Nenhum, se parar no primeiro palpite. Um corpo pode tremer de frio. Uma mancha pode ter sido plantada.",
        },
        {
          speaker: "Dexter Morgan",
          text: "Finalmente, um mentalista que admite que precisa de laboratório.",
        },
        {
          speaker: "Patrick Jane",
          text: "E finalmente um especialista em sangue que admite que uma prova também pode contar uma história falsa.",
        },
        {
          speaker: "Dexter Morgan",
          text: "Então testamos os dois lados: sua leitura escolhe a pergunta; a evidência decide se a resposta fica de pé.",
        },
        {
          speaker: "Patrick Jane",
          text: "É a primeira coisa sensata que você disse. Não conte a ninguém.",
        },
      ],
    },
    {
      id: "red-john-audience",
      label: "Perguntar o que Red John quer ao deixar o sorriso",
      lines: [
        {
          speaker: "Dexter Morgan",
          text: "Um assassino que assina a cena quer atenção. Por que você acha que ele precisa de uma plateia?",
        },
        {
          speaker: "Patrick Jane",
          text: "Porque o sorriso não é só uma assinatura. É uma conversa unilateral: ele escolhe o assunto, o momento e quem deve responder.",
        },
        { speaker: "Dexter Morgan", text: "Você respondeu a ele antes." },
        {
          speaker: "Patrick Jane",
          text: "Respondi. E ele aprendeu que eu apareceria sempre que me chamasse. Não vou repetir o erro.",
        },
        {
          speaker: "Dexter Morgan",
          text: "Então não seguimos o símbolo. Seguimos quem teve acesso à sala, ao uniforme e ao registro.",
        },
        { speaker: "Patrick Jane", text: "Agora você está ouvindo o caso, não o assassino." },
      ],
    },
  ],
};

export const RED_JOHN_SUSPECT_DIALOGUES: Record<string, StoryDialogueScene> = {
  mcallister: {
    id: "mcallister-follow-up",
    title: "Pressão sobre o xerife McAllister",
    subtitle: "Livro de acesso · autoridade e versão oficial",
    opening: [
      {
        speaker: "Patrick Jane",
        text: "O livro foi alterado depois do plantão. Isso exige acesso e tempo. O senhor tinha os dois.",
      },
      {
        speaker: "Thomas McAllister",
        text: "Eu tinha uma delegacia inteira para administrar. Isso não me coloca naquela sala.",
      },
    ],
    choices: [
      {
        id: "mc-entry",
        label: "Confrontar o horário apagado",
        lines: [
          {
            speaker: "Dexter Morgan",
            text: "A pressão do lápis ainda está no papel. A rubrica começa com T. Mc. Quem mais podia corrigir o livro?",
          },
          { speaker: "Thomas McAllister", text: "Vários agentes tinham acesso ao balcão." },
          {
            speaker: "Patrick Jane",
            text: "Mas poucos teriam motivo para apagar uma entrada e depois mudar o horário. Vou querer a lista de chaves.",
          },
        ],
      },
      {
        id: "mc-fiber",
        label: "Perguntar sobre o uniforme na cena",
        lines: [
          {
            speaker: "Dexter Morgan",
            text: "Uma fibra do uniforme do condado ficou na fita que isolava a porta. O senhor quer explicar isso antes que o laboratório identifique o lote?",
          },
          {
            speaker: "Thomas McAllister",
            text: "Uniformes circulam. Uma fibra não prova que eu estive lá.",
          },
          {
            speaker: "Patrick Jane",
            text: "Concordo. Mas a fibra, o acesso e o horário juntos começam a contar uma história bem menos confortável.",
          },
        ],
      },
    ],
  },
  bertram: {
    id: "bertram-follow-up",
    title: "Conversa reservada com Bertram",
    subtitle: "Linha interna · rede de contatos do CBI",
    opening: [
      {
        speaker: "Dexter Morgan",
        text: "Um aparelho descartável ligou para a linha interna do gabinete quatro minutos depois da chamada à vítima.",
      },
      {
        speaker: "Gale Bertram",
        text: "Uma central recebe dezenas de chamadas. Você está transformando coincidência em acusação.",
      },
    ],
    choices: [
      {
        id: "bertram-routing",
        label: "Perguntar quem recebeu a ligação interna",
        lines: [
          {
            speaker: "Patrick Jane",
            text: "Não estou perguntando quem tinha o número. Estou perguntando quem sabia qual ramal atenderia depois do expediente.",
          },
          { speaker: "Gale Bertram", text: "O gabinete tem protocolos para chamadas externas." },
          {
            speaker: "Dexter Morgan",
            text: "Então o registro completo deve mostrar o ramal, o horário e quem estava de plantão.",
          },
        ],
      },
      {
        id: "bertram-photo",
        label: "Confrontá-lo com a fotografia do arquivo",
        lines: [
          {
            speaker: "Dexter Morgan",
            text: "O senhor aparece na foto antiga ao lado dos outros investigadores. No verso, alguém escreveu que quem controla o arquivo controla a versão oficial.",
          },
          {
            speaker: "Gale Bertram",
            text: "A foto prova que estive numa reunião. Não que controlei esta investigação.",
          },
          {
            speaker: "Patrick Jane",
            text: "Certo. Agora precisamos descobrir quem teve acesso ao arquivo depois daquela reunião.",
          },
        ],
      },
    ],
  },
  stiles: {
    id: "stiles-follow-up",
    title: "Stiles testa os investigadores",
    subtitle: "Arquivo do CBI · influência e informação",
    opening: [
      {
        speaker: "Bret Stiles",
        text: "Vocês vieram procurar um homem ou a história que contam sobre ele? São investigações bem diferentes.",
      },
      {
        speaker: "Patrick Jane",
        text: "O senhor sempre faz uma pergunta quando não quer responder à anterior.",
      },
    ],
    choices: [
      {
        id: "stiles-source",
        label: "Perguntar como soube da investigação",
        lines: [
          {
            speaker: "Dexter Morgan",
            text: "O que o senhor sabe sobre a vítima e quem lhe contou?",
          },
          {
            speaker: "Bret Stiles",
            text: "Pessoas falam quando acreditam que alguém está ouvindo. Às vezes, deixo que continuem.",
          },
          {
            speaker: "Patrick Jane",
            text: "Isso descreve uma rede de informantes. Não responde se alguém lhe entregou o registro telefônico.",
          },
        ],
      },
      {
        id: "stiles-fear",
        label: "Perguntar por que ele teme o conteúdo da fotografia",
        lines: [
          {
            speaker: "Patrick Jane",
            text: "O senhor olhou para o verso da foto antes de olhar para os rostos. O que reconheceu?",
          },
          {
            speaker: "Bret Stiles",
            text: "Reconheci uma frase conveniente. Arquivos são controlados por quem os escreve, não por quem os lê.",
          },
          {
            speaker: "Dexter Morgan",
            text: "E alguém escreveu essa frase para direcionar a investigação. Vamos descobrir quem tinha acesso.",
          },
        ],
      },
    ],
  },
};
