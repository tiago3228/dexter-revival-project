import type { StoryDialogueScene } from "./StoryDialogue";

export const PAINSCREEK_DIALOGUES: Record<string, StoryDialogueScene> = {
  "Paul Renner": {
    id: "renner-follow-up",
    title: "Segunda rodada com Paul Renner",
    subtitle: "Posto do xerife · livro de entrada e caixa 19",
    opening: [
      {
        speaker: "Dexter Morgan",
        text: "O livro registra uma segunda assinatura às 22h06. O recibo da caixa 19 põe você de volta no cais depois de dizer que foi embora.",
      },
      {
        speaker: "Paul Renner",
        text: "Um registro diz que alguém entrou. Não diz quem, nem o que essa pessoa fez.",
      },
    ],
    choices: [
      {
        id: "renner-signature",
        label: "Pressionar sobre a segunda assinatura",
        lines: [
          {
            speaker: "Dexter Morgan",
            text: "A assinatura usa a mesma inclinação que a sua. Quer explicar a coincidência?",
          },
          {
            speaker: "Paul Renner",
            text: "Você está comparando tinta e caligrafia de um livro que qualquer funcionário podia consultar.",
          },
          {
            speaker: "Dexter Morgan",
            text: "Então vou comparar também o turno, a chave do posto e a tinta. Uma peça não condena ninguém; o conjunto talvez.",
          },
        ],
      },
      {
        id: "renner-box",
        label: "Perguntar sobre a caixa 19",
        lines: [
          {
            speaker: "Dexter Morgan",
            text: "O recibo mostra retirada e devolução de um pacote na caixa 19. O que havia ali?",
          },
          { speaker: "Paul Renner", text: "Não me lembro de cada encomenda do cais." },
          {
            speaker: "Dexter Morgan",
            text: "A caixa foi alugada usando o endereço do posto. Memória não é a única coisa que deixa registro.",
          },
        ],
      },
    ],
  },
  "Dr. Henry Vale": {
    id: "vale-follow-up",
    title: "Revisão do laudo com Dr. Vale",
    subtitle: "Necrotério · tinta azul e relatório preliminar",
    opening: [
      {
        speaker: "Dexter Morgan",
        text: "A tinta azul sob as unhas de Eleanor não aparece na conclusão do seu relatório preliminar. Por quê?",
      },
      {
        speaker: "Dr. Henry Vale",
        text: "A amostra foi registrada, mas a origem não foi determinada. Eu não podia transformar um vestígio em uma história.",
      },
    ],
    choices: [
      {
        id: "vale-blue",
        label: "Perguntar se a tinta veio do recibo do cais",
        lines: [
          {
            speaker: "Dexter Morgan",
            text: "O recibo da caixa 19 também usa tinta azul. Você comparou as amostras?",
          },
          {
            speaker: "Dr. Henry Vale",
            text: "O laboratório guardou o material, mas a comparação precisa ser feita com controles. Sem isso, a semelhança pode enganar.",
          },
          {
            speaker: "Dexter Morgan",
            text: "Certo. Vou pedir a análise confirmatória, não uma conclusão conveniente.",
          },
        ],
      },
      {
        id: "vale-report",
        label: "Perguntar quem alterou o relatório",
        lines: [
          {
            speaker: "Dexter Morgan",
            text: "A cópia do arquivo não coincide com a versão inicial. Quem teve acesso ao laudo?",
          },
          {
            speaker: "Dr. Henry Vale",
            text: "O sistema registra cada usuário. Se houve alteração, a trilha de auditoria deve mostrar quando e de qual terminal.",
          },
          {
            speaker: "Dexter Morgan",
            text: "Um documento pode ser editado. O histórico de edição é mais difícil de apagar sem deixar marcas.",
          },
        ],
      },
    ],
  },
  "Pastor Matthew Cole": {
    id: "cole-follow-up",
    title: "Uma conversa na capela",
    subtitle: "Fita de áudio · sino quebrado e localização falsa",
    opening: [
      {
        speaker: "Dexter Morgan",
        text: "A fita menciona o sino da capela, mas o sino estava quebrado naquela semana. Você disse que não reconhece as vozes.",
      },
      {
        speaker: "Pastor Matthew Cole",
        text: "Posso reconhecer o som do sino. Não posso dizer quem o colocou numa gravação.",
      },
    ],
    choices: [
      {
        id: "cole-recording",
        label: "Perguntar como o sino entrou na gravação",
        lines: [
          {
            speaker: "Dexter Morgan",
            text: "Se não era o sino real, alguém reproduziu o som ou usou uma gravação antiga.",
          },
          {
            speaker: "Pastor Matthew Cole",
            text: "O toque tem uma reverberação própria. Uma cópia teria de vir de perto da capela ou de alguém que conhecesse a acústica.",
          },
          {
            speaker: "Dexter Morgan",
            text: "Isso reduz a distância, não identifica a pessoa. Vou comparar a fita com os registros de acesso.",
          },
        ],
      },
      {
        id: "cole-log",
        label: "Confrontá-lo com o horário do livro de entrada",
        lines: [
          {
            speaker: "Dexter Morgan",
            text: "O livro do posto tem uma entrada apagada naquela noite. Você passou pelo cais?",
          },
          {
            speaker: "Pastor Matthew Cole",
            text: "Não. Mas ouvi rumores de que alguém usava a capela para deixar mensagens sem ser visto.",
          },
          {
            speaker: "Dexter Morgan",
            text: "Rumor é uma direção para procurar, não um fato para registrar. Vou conferir quem tinha acesso à capela.",
          },
        ],
      },
    ],
  },
};
