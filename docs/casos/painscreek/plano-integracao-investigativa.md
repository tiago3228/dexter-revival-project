# Próximas etapas — integração investigativa de Painscreek

## Objetivo

Conectar ao ciclo jogável de Vivian apenas as referências documentais já marcadas como visualmente conferidas, sem misturar documentos de origem com hipóteses de design e sem alterar inadvertidamente o caso Painscreek já existente. A integração do catálogo completo depende de validação adicional; a auditoria individual de `P-001` a `P-047` continua suspensa até autorização explícita do usuário.

## Estado confirmado

- [x] Organizar documentos e análises das páginas 80–116.
- [x] Consolidar cronologia documental das páginas 80–116.
- [x] Criar registro de pistas P-001–P-012 com fontes e pendências.
- [x] Executar o ciclo autorizado de auditoria individual de P-001–P-047 sem refazer trabalho concluído: P-001/P-002 foram confirmados pelo usuário como concluídos; P-003–P-047 foram processados em relatórios individuais e permanecem parciais.
- [ ] Conferir visualmente cada transcrição que ainda tenha lacunas contra o PDF original, sobretudo páginas com cortes, baixa legibilidade ou OCR ambíguo; não preencher por inferência.
- [x] Cruzar os itens já cobertos pelos artefatos históricos e deduplicar usando IDs estáveis, preservando as pendências e as sobreposições não conclusivas.
- [ ] Definir quais evidências do catálogo completo pertencem ao caso jogável e quais são apenas notas de pesquisa.
- [x] Integrar um subconjunto de sete pistas a registros específicos já marcados `visually-checked`, com detalhes opcionais e limites de interpretação explícitos.
- [x] Adicionar testes automatizados para os vínculos, a ausência de fichas em pistas sem vínculo, a correção da data de fechamento para 1996 e a migração de saves antigos.
- [x] Verificar no Chromium a ficha expandida em 320×700 e 390×844, sem overflow horizontal.
- [ ] Revisar mais vínculos somente a partir de registros com página exata já conferida; não ampliar o escopo para registros não verificados.

## Matriz inicial de integração

| ID | Evidência/linha | Fontes do PDF | Verificação necessária | Possível uso na experiência |
|---|---|---|---|---|
| P-001 | Carta ameaçadora a Vivian | p. 100 | Conferir texto completo, remetente e contexto | Documento examinável; comparação de linguagem |
| P-002 | Incidente de 1975 mencionado por Steven Moss | p. 111; cruzar p. 113–114 | Distinguir relato de Moss de fatos confirmados | Linha de investigação desbloqueada por cronologia |
| P-003 | Código 0318 | p. 102 | Verificar grafia, suporte físico e contexto exato | Referência documental opcional; ainda não é usado como puzzle |
| P-004 | Fita de vigilância ausente de 28/06/1975 | pp. 106–107 | Conferir registros adjacentes e quem documentou a ausência | Contradição documental, não prova automática de culpa |
| P-005 | Fotografia emprestada por Scott | p. 116 | Identificar a fotografia e cruzar com imagens/menções anteriores | Evidência visual, se o arquivo correspondente for localizado |
| P-006 | Gravidez de Sofia e segredo pedido por Charles | pp. 93, 98, 102–103, 112–114 | Conferir cada passagem e registrar divergências | Linha temporal e relações entre personagens |
| P-007 | Alegação sobre desvio de fundos Roberts Relief | p. 97 | Tratar como alegação até corroborar em outra fonte | Hipótese de motivo; nunca fato confirmado isoladamente |
| P-008 | Morte de Henry Johnson | p. 85 | Confirmar detalhes e confrontar outros registros | Evento de cronologia e possível contradição |
| P-009 | Mulher misteriosa na floresta | p. 109 | Separar observação direta, memória e especulação | Depoimento com grau de confiabilidade indicado |
| P-010 | Scott suspeito da morte de Vivian | pp. 82–83, 90 e carta p. 104 | Distinguir suspeita policial, imprensa e prova material | Hipótese de acusação; não revelar como conclusão antecipada |
| P-011 | Scott ajuda Andrew e visita no hospital | pp. 108, 115–116 | Confirmar datas e sequência, sem inferir motivação | Relação entre personagens e cronologia |
| P-012 | Wanda Tyler e Derrick | pp. 80–81 | Conferir entrada completa e identificar o que é observação versus interpretação | Documento contextual e possível cruzamento de relações |

A matriz acima continua sendo uma especificação inicial; não indica que cada item foi auditado ou integrado.

## Vínculos jogáveis implementados

Em 2026-10-13, foram adicionadas somente estas referências de página e catálogo ao ciclo de Vivian:

| Pista do jogo | Registro do catálogo | Página de origem usada | Apresentação ao jogador |
|---|---|---:|---|
| Relatório policial sobre Vivian | P-010 | 90 | Ficha opcional após a coleta, com ressalva sobre suspeita versus prova |
| Scott nega ter matado Vivian | P-016 | 88 | Ficha opcional após a coleta, sem tratar negação como prova conclusiva |
| Fechamento do Hospital Comunitário | P-013 | 84 | Ficha opcional; cronologia corrigida para 1996, com migração do ID antigo |
| Morte do Dr. Henry Johnson | P-008 | 85 | Ficha opcional, preservando pendências e limites |
| Investigação sobre fundos da Roberts Relief | P-007 | 97 | Ficha opcional; alegação permanece atribuída, não fato confirmado |
| Relatório médico de Vivian | P-020 | 94 | Ficha opcional após a coleta, com o limite interpretativo do registro |
| Código 0318 | P-003 | 102 | Referência opcional; não desbloqueia nem valida uma solução de puzzle |

A função de vínculo só exibe a ficha quando o registro está marcado `visually-checked` e contém exatamente a página associada à pista. Os demais indícios não recebem ficha por inferência. A p. 43, em particular, não foi convertida em pista independente nem atribuída como referência cruzada; essa decisão permanece pendente de validação específica.

## Regras de implementação

1. Cada evidência exibida deve ter ID interno, página de origem, tipo de fonte, resumo fiel e estado de revisão.
2. Estados permitidos: **não conferida**, **conferida**, **contraditória**, **incompleta**. Não converter alegação em fato por repetição.
3. A interface deve diferenciar documento original, transcrição, interpretação e hipótese do jogador.
4. Trechos ilegíveis permanecem marcados; não preencher lacunas por plausibilidade narrativa.
5. Nenhum puzzle deve depender de uma palavra/código cuja leitura visual ainda não tenha sido confirmada; P-003 está conectado apenas como referência documental, não como solução.
6. A integração já implementada limita-se a páginas e registros previamente marcados como conferidos; os vínculos restantes não podem ser deduzidos por similaridade de tema.
7. Só descrever como integrada a parte exata que tenha mudança real no código, testes e verificação de funcionamento. O catálogo completo não está integrado.
8. O ciclo de auditoria de `P-001`–`P-047` foi autorizado explicitamente em 2026-10-13. Seus resultados devem permanecer separados entre concluído, parcial, pendente e inconclusivo; `visually-checked` não equivale a auditoria integral.

## Próxima sequência de trabalho

1. Concluir revisão técnica, testes, commit, push e abertura de PR para este subconjunto validado.
2. Acompanhar o CI remoto e corrigir eventuais falhas sem ampliar o escopo documental.
3. Manter sem vínculo as pistas sem correspondência de página já conferida; registrar pendências sem resolver divergências por inferência.
4. Trabalhar apenas nas pendências dos relatórios individuais de `P-003`–`P-047`; não refazer `P-001`/`P-002` nem cotejos já concluídos sem motivo documental específico.
5. Após a autorização, validar as fontes e decidir separadamente se a p. 43 de Scott Brooks funciona como pista independente, referência cruzada ou permanece sem uso.

## Limitação atual

O explorador `/painscreek-evidence` continua separado da maior parte da progressão jogável. Sete ligações específicas alimentam fichas documentais opcionais no ciclo de Vivian; isso não significa que os 47 registros tenham sido auditados, conectados ao jogo, nem que o caso tenha sido publicado.
