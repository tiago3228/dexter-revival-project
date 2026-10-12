# Próximas etapas — integração investigativa de Painscreek

## Objetivo
Transformar o dossiê das páginas 80–116 em requisitos verificáveis para a experiência investigativa, sem misturar documentos de origem com hipóteses de design e sem alterar inadvertidamente o caso Painscreek já existente.

## Estado confirmado
- [x] Organizar documentos e análises das páginas 80–116.
- [x] Consolidar cronologia documental das páginas 80–116.
- [x] Criar registro de pistas P-001–P-012 com fontes e pendências.
- [ ] Conferir visualmente cada transcrição contra o PDF original, sobretudo páginas com cortes, baixa legibilidade ou OCR ambíguo.
- [ ] Cruzar os novos itens com os lotes 1–79 e deduplicar usando IDs estáveis.
- [ ] Definir quais evidências pertencem ao caso jogável e quais são apenas notas de pesquisa.
- [ ] Implementar e testar a interface depois da validação documental.

## Matriz inicial de integração

| ID | Evidência/linha | Fontes do PDF | Verificação necessária | Possível uso na experiência |
|---|---|---|---|---|
| P-001 | Carta ameaçadora a Vivian | p. 100 | Conferir texto completo, remetente e contexto | Documento examinável; comparação de linguagem |
| P-002 | Incidente de 1975 mencionado por Steven Moss | p. 111; cruzar p. 113–114 | Distinguir relato de Moss de fatos confirmados | Linha de investigação desbloqueada por cronologia |
| P-003 | Código 0318 | p. 102 | Verificar grafia, suporte físico e contexto exato | Puzzle somente após validar função e solução |
| P-004 | Fita de vigilância ausente de 28/06/1975 | pp. 106–107 | Conferir registros adjacentes e quem documentou a ausência | Contradição documental, não prova automática de culpa |
| P-005 | Fotografia emprestada por Scott | p. 116 | Identificar a fotografia e cruzar com imagens/menções anteriores | Evidência visual, se o arquivo correspondente for localizado |
| P-006 | Gravidez de Sofia e segredo pedido por Charles | pp. 93, 98, 102–103, 112–114 | Conferir cada passagem e registrar divergências | Linha temporal e relações entre personagens |
| P-007 | Alegação sobre desvio de fundos Roberts Relief | p. 97 | Tratar como alegação até corroborar em outra fonte | Hipótese de motivo; nunca fato confirmado isoladamente |
| P-008 | Morte de Henry Johnson | p. 85 | Confirmar detalhes e confrontar outros registros | Evento de cronologia e possível contradição |
| P-009 | Mulher misteriosa na floresta | p. 109 | Separar observação direta, memória e especulação | Depoimento com grau de confiabilidade indicado |
| P-010 | Scott suspeito da morte de Vivian | pp. 82–83, 90 e carta p. 104 | Distinguir suspeita policial, imprensa e prova material | Hipótese de acusação; não revelar como conclusão antecipada |
| P-011 | Scott ajuda Andrew e visita no hospital | pp. 108, 115–116 | Confirmar datas e sequência, sem inferir motivação | Relação entre personagens e cronologia |
| P-012 | Wanda Tyler e Derrick | pp. 80–81 | Conferir entrada completa e identificar o que é observação versus interpretação | Documento contextual e possível cruzamento de relações |

## Regras de implementação
1. Cada evidência exibida deve ter ID interno, página de origem, tipo de fonte, resumo fiel e estado de revisão.
2. Estados permitidos: **não conferida**, **conferida**, **contraditória**, **incompleta**. Não converter alegação em fato por repetição.
3. A interface deve diferenciar documento original, transcrição, interpretação e hipótese do jogador.
4. Trechos ilegíveis permanecem marcados; não preencher lacunas por plausibilidade narrativa.
5. Nenhum puzzle deve depender de uma palavra/código cuja leitura visual ainda não foi confirmada.
6. Não modificar diálogos, mapa, rota de solução ou estado do caso existente nesta etapa documental.
7. A integração ao jogo só pode ser marcada como concluída após mudança real no código, testes e verificação de que o caso existente continua funcionando.

## Próxima sequência de trabalho
1. Conferência visual das páginas com maior impacto investigativo (100–107 e 111–116).
2. Comparação com os documentos das páginas 1–79 e atualização dos IDs duplicados.
3. Produção de um catálogo de evidências normalizado em formato de dados para a interface, ainda sem o conectar ao jogo.
4. Integração incremental em componente isolado e testes automatizados.
5. Revisão de navegação, responsividade, acessibilidade e prevenção de spoilers.

## Limitação atual
Este documento é uma especificação de trabalho. Ele não significa que as pistas já foram integradas à interface nem que o caso foi publicado ou testado.
