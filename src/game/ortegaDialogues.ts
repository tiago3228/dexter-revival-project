import type { StoryDialogueScene } from "./StoryDialogue";

export const ORTEGA_DIALOGUE: StoryDialogueScene = {
  id: "ortega-witness-follow-up",
  title: "O que a câmera não viu",
  subtitle: "Porto de Miami · conversa de reconstituição com Teresa e Tellez",
  opening: [
    {
      speaker: "Dexter Morgan",
      text: "Teresa, você disse que viu alguém sair do armazém. No primeiro depoimento, o nome de Tellez apareceu antes de você descrever o rosto.",
    },
    {
      speaker: "Teresa",
      text: "Eu vi o uniforme do porto e uma silhueta. Achei que fosse ele porque Tellez estava trabalhando naquela noite.",
    },
    {
      speaker: "Tellez",
      text: "Eu estava no cais. O ponto e a câmera confirmam isso. Não confirmam que entrei no armazém.",
    },
    {
      speaker: "Dexter Morgan",
      text: "Então vamos separar presença de autoria. A luva encontrada na cena pode tentar misturar as duas coisas.",
    },
  ],
  choices: [
    {
      id: "ortega-timing",
      label: "Reconstruir o horário com Teresa",
      lines: [
        { speaker: "Dexter Morgan", text: "O que você ouviu antes de ver a silhueta?" },
        {
          speaker: "Teresa",
          text: "Um motor acelerou no canal. Depois ouvi a porta metálica fechar. Não consigo dizer se foi a mesma pessoa que saiu.",
        },
        {
          speaker: "Tellez",
          text: "O registro do meu turno me põe no cais quando o motor passou. Eu não estava perto daquela porta.",
        },
        {
          speaker: "Dexter Morgan",
          text: "O som fixa uma sequência, não um rosto. Vou comparar o motor com o registro de saída do barco.",
        },
      ],
    },
    {
      id: "ortega-glove",
      label: "Confrontar Tellez com a luva plantada",
      lines: [
        {
          speaker: "Dexter Morgan",
          text: "A luva estava posicionada para ser encontrada. A câmera mostra você entrando no porto, mas não mostra a luva nas suas mãos.",
        },
        {
          speaker: "Tellez",
          text: "Não é minha. Eu trabalho com as mãos; o tamanho e o corte estão errados. Alguém queria que a polícia parasse de procurar depois de achar isso.",
        },
        {
          speaker: "Teresa",
          text: "Eu vi outra pessoa carregando algo escuro, mas não era possível saber o que era.",
        },
        {
          speaker: "Dexter Morgan",
          text: "Uma descrição imperfeita não absolve ninguém. Mas a luva também não transforma uma suspeita em prova.",
        },
      ],
    },
    {
      id: "ortega-ruiz",
      label: "Perguntar o que Teresa sabe sobre Ruiz",
      lines: [
        {
          speaker: "Dexter Morgan",
          text: "Você mencionou Ruiz no segundo depoimento. O que mudou?",
        },
        {
          speaker: "Teresa",
          text: "Depois que ouvi a gravação, lembrei de um homem que conhecia o armazém e não usava uniforme. Não quero afirmar que era ele sem ver o rosto.",
        },
        {
          speaker: "Tellez",
          text: "Ruiz sabia quais câmeras estavam desligadas. Ele dizia que era por causa das manutenções.",
        },
        {
          speaker: "Dexter Morgan",
          text: "Isso nos dá uma pergunta verificável: quem tinha acesso ao armazém nove e ao sistema das câmeras?",
        },
      ],
    },
  ],
};
