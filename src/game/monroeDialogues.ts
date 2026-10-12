import type { StoryDialogueScene } from "./StoryDialogue";

export const MONROE_DIALOGUES: Record<string, StoryDialogueScene> = {
  monica: {
    id: "monica-follow-up",
    title: "Segunda conversa com Monica",
    subtitle: "Hotel Luxe · viagem de negócios e casamento",
    opening: [
      {
        speaker: "Detetive Johnson",
        text: "Quero voltar à sua viagem. O registro do Luxe confirma sua estadia, mas há perguntas sobre o que aconteceu antes de partir.",
      },
      {
        speaker: "Monica Monroe",
        text: "Eu entendo. Depois que Jonathan morreu, cada detalhe da nossa vida parece suspeito.",
      },
    ],
    choices: [
      {
        id: "monica-trip",
        label: "Confrontá-la com o recibo do hotel",
        lines: [
          {
            speaker: "Detetive Johnson",
            text: "A fatura registra a suíte em seu nome na noite do crime. Quem pode confirmar que você ficou lá?",
          },
          {
            speaker: "Monica Monroe",
            text: "A recepção e as câmeras do hotel. Viajei para organizar um evento; não tinha motivo para voltar a Greenfield.",
          },
          {
            speaker: "Detetive Johnson",
            text: "Vou cruzar esse horário com as chamadas e com o deslocamento até a casa.",
          },
        ],
      },
      {
        id: "monica-money",
        label: "Perguntar sobre o cofre e as dívidas",
        lines: [
          {
            speaker: "Detetive Johnson",
            text: "A combinação era a data do casamento. Jonathan mudou alguma coisa no cofre antes de morrer?",
          },
          {
            speaker: "Monica Monroe",
            text: "Não que eu saiba. Tínhamos dificuldades financeiras, mas as economias eram nossas. Ele não me contou que havia dinheiro faltando.",
          },
          {
            speaker: "Detetive Johnson",
            text: "Uma resposta que vou comparar com o extrato, não com a memória de ninguém.",
          },
        ],
      },
    ],
  },
  richard: {
    id: "richard-follow-up",
    title: "Segunda conversa com Richard",
    subtitle: "Escritório Monroe · sociedade e mensagem apagada",
    opening: [
      {
        speaker: "Detetive Johnson",
        text: "Sua primeira versão descreveu uma sociedade tranquila. Um SMS apagado sugere uma cobrança de cinquenta mil dólares.",
      },
      {
        speaker: "Richard Stevens",
        text: "Jonathan e eu tínhamos divergências. Isso não significa que eu o tenha ameaçado.",
      },
    ],
    choices: [
      {
        id: "richard-text",
        label: "Perguntar sobre a mensagem das 20h",
        lines: [
          {
            speaker: "Detetive Johnson",
            text: "A mensagem diz 'você sabe onde' e marca um encontro às oito. Onde era esse lugar?",
          },
          {
            speaker: "Richard Stevens",
            text: "Eu não reconheço esse texto. Se fosse meu, o telefone ainda teria a conversa.",
          },
          {
            speaker: "Detetive Johnson",
            text: "O horário coincide com o que foi apagado. Vou verificar os registros da operadora e a localização.",
          },
        ],
      },
      {
        id: "richard-amara",
        label: "Perguntar pelo álibi de Amara",
        lines: [
          {
            speaker: "Detetive Johnson",
            text: "Você disse que jantou e viu um filme com Amara. A foto do jornal mostra que ela estava numa gala em Nova York.",
          },
          {
            speaker: "Richard Stevens",
            text: "Então meu álibi não pode depender dela. Eu estava em casa; procure o recibo do jantar e as câmeras do prédio.",
          },
          {
            speaker: "Detetive Johnson",
            text: "Isso é verificável. Vou pedir os registros antes de aceitar a versão.",
          },
        ],
      },
    ],
  },
  daniel: {
    id: "daniel-follow-up",
    title: "Segunda conversa com Daniel",
    subtitle: "Clube de criptografia · rivalidade e deslocamento",
    opening: [
      {
        speaker: "Detetive Johnson",
        text: "Você diz que a rivalidade era profissional. A mensagem cifrada de Jonathan fala de uma viagem e de alguém que deve permanecer anônimo.",
      },
      {
        speaker: "Daniel Thompson",
        text: "Éramos membros do mesmo clube. Uma cifra não prova que eu sabia de um crime.",
      },
    ],
    choices: [
      {
        id: "daniel-cipher",
        label: "Perguntar sobre o cliente secreto",
        lines: [
          {
            speaker: "Detetive Johnson",
            text: "Quando Jonathan lhe pediu para guardar o nome do cliente, você sabia quem era?",
          },
          {
            speaker: "Daniel Thompson",
            text: "Não. Ele queria que eu tivesse a informação caso algo acontecesse, mas a mensagem que recebi não trazia o nome.",
          },
          {
            speaker: "Detetive Johnson",
            text: "A cifra ainda pode revelar quando o pedido foi feito. Vou comparar a chave com os documentos do clube.",
          },
        ],
      },
      {
        id: "daniel-hotel",
        label: "Confrontá-lo com a fatura do Hotel Carvelle",
        lines: [
          {
            speaker: "Detetive Johnson",
            text: "A fatura põe você no Carvelle na noite do crime. Você afirma que foi à conferência de carro.",
          },
          {
            speaker: "Daniel Thompson",
            text: "A estrada leva pouco mais de quatro horas. A conferência tem uma lista de presença; peça a gravação da entrada.",
          },
          {
            speaker: "Detetive Johnson",
            text: "O álibi fica de pé se os horários também ficarem.",
          },
        ],
      },
    ],
  },
  emily: {
    id: "emily-follow-up",
    title: "Segunda conversa com Emily",
    subtitle: "Arquivo da secretária · demissão e última noite",
    opening: [
      {
        speaker: "Detetive Johnson",
        text: "Você foi demitida no dia 18 e foi às compras na noite do assassinato. O recibo situa essa saída às 20h20.",
      },
      {
        speaker: "Emily Parker",
        text: "Eu estava magoada, mas não queria que Jonathan morresse. Queria que ele explicasse por que me dispensou.",
      },
    ],
    choices: [
      {
        id: "emily-route",
        label: "Perguntar sobre o trajeto até a casa",
        lines: [
          {
            speaker: "Detetive Johnson",
            text: "O mercado fica a trinta e cinco minutos da casa dos Monroe. Quanto tempo levou para voltar ao seu apartamento?",
          },
          {
            speaker: "Emily Parker",
            text: "Não fui à casa naquela noite. O recibo mostra quando comprei; as câmeras do mercado podem confirmar quando saí.",
          },
          {
            speaker: "Detetive Johnson",
            text: "O recibo fixa um horário, mas não o trajeto. Vou procurar outra confirmação independente.",
          },
        ],
      },
      {
        id: "emily-dismissal",
        label: "Perguntar pelos documentos confidenciais",
        lines: [
          {
            speaker: "Detetive Johnson",
            text: "Jonathan a acusou de lidar mal com documentos confidenciais. Você viu o nome do cliente secreto?",
          },
          {
            speaker: "Emily Parker",
            text: "Havia uma pasta que não podia sair do escritório. Eu nunca li o conteúdo, mas vi Jonathan levá-la para casa.",
          },
          {
            speaker: "Detetive Johnson",
            text: "Isso explica sua demissão ou só fornece outra pista. Preciso encontrar a pasta.",
          },
        ],
      },
    ],
  },
  jacob: {
    id: "jacob-follow-up",
    title: "Segunda conversa com Jacob",
    subtitle: "Casa de Jonathan · visita e processo arquivado",
    opening: [
      {
        speaker: "Detetive Johnson",
        text: "Você visitou Jonathan quatro dias antes do crime para falar de um processo. Disse que não voltou a procurá-lo.",
      },
      {
        speaker: "Jacob Kline",
        text: "O processo foi arquivado. Não havia razão para continuar a conversa.",
      },
    ],
    choices: [
      {
        id: "jacob-case",
        label: "Perguntar por que o processo era delicado",
        lines: [
          {
            speaker: "Detetive Johnson",
            text: "Você disse que o processo por lesão corporal era delicado. Quem mais sabia dele?",
          },
          {
            speaker: "Jacob Kline",
            text: "Jonathan, eu e a pessoa envolvida. Eu não queria que o caso voltasse aos jornais.",
          },
          {
            speaker: "Detetive Johnson",
            text: "Um motivo para manter silêncio não é prova de assassinato. Vou verificar o processo arquivado.",
          },
        ],
      },
      {
        id: "jacob-safe",
        label: "Perguntar como sabia do dinheiro no cofre",
        lines: [
          {
            speaker: "Detetive Johnson",
            text: "Você mencionou o dinheiro do cofre antes de saber que havia dinheiro desaparecido. Como sabia que Jonathan guardava valores em casa?",
          },
          {
            speaker: "Jacob Kline",
            text: "Eu já tinha estado na casa. Vi o cofre, mas não sabia a combinação nem quanto havia dentro.",
          },
          {
            speaker: "Detetive Johnson",
            text: "Essa informação é específica demais para ser ignorada, mas ainda precisa de confirmação.",
          },
        ],
      },
    ],
  },
};
