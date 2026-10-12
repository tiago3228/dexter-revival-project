# Grafo provisório de dependências — O Caso Vivian Roberts

> **Estado:** mapa de trabalho derivado de resumos das páginas 1–69 e OCR das páginas 70–116. Nenhuma ligação abaixo foi confirmada visualmente no PDF. Este documento não define culpado, motivação ou arma e não deve ser usado como solução final.

## Regras do grafo

- **Fonte → pergunta de investigação** não significa que a afirmação da fonte seja verdadeira.
- **Candidato** significa que os itens parecem relacionados e precisam ser conferidos nas imagens.
- Nenhum local, senha, mecanismo ou objeto deve ser implementado apenas porque aparece como hipótese em um diário.
- IDs EV referem-se à matriz preliminar de pistas das páginas 70–116. Itens das páginas 1–69 sem ID EV são citados por página/entrada e devem receber IDs estáveis após revisão.
- A progressão deve permitir que o jogador encontre documentos antes de interpretar seu conteúdo; conclusões não devem ser automáticas.

## Caminhos candidatos

### 1. Identidade e história de Scott; Sofia e Vincent

`Diários de Scott, pp. 41–48 (resumo de trabalho)`
→ comparar as versões dadas por Andrew, Wanda e Dorothy sobre Sofia
→ `EV-070-01` e `EV-071-01` (Trisha pergunta sobre Vincent; pp. 70–71)
→ `EV-093-01` (carta atribuída a Sylvia; p. 93)
→ `EV-098-01` (carta de Henry para Vivian; p. 98)
→ `EV-099-01` (carta de Sister Rachel a Scott; p. 99)
→ `EV-102-01` + `EV-103-01` (cartas/cartão atribuídos a Matthew; pp. 102–103)
→ `EV-104-01` (carta de Scott a Trisha; p. 104).

**Pergunta que o jogador pode formular:** quais documentos apoiam ou contradizem as versões sobre Sofia, o bebê e a origem de Scott?

**Limites:** não equiparar Vincent a Scott sem ligação explícita e independente; não tratar cartas retrospectivas ou lembranças como confirmação automática. `EV-104-01` aparece duas vezes na matriz para documentos diferentes na mesma página; corrigir para IDs únicos antes da implementação.

### 2. Relação Scott–Trisha e acesso à cabana

`Entradas de Scott sobre a cabana (pp. 43–44, resumo de trabalho)`
→ `EV-072-01` (Trisha procura Scott na cabana; p. 72)
→ comparar com `EV-077-01` (Vivian não quer Trisha próxima de Scott; p. 77)
→ cruzar com registros independentes de horário e presença, caso confirmados.

**Limites:** a suspeita de uma sala secreta em `EV-072-01` não confirma que a sala exista. Não criar sala, acesso ou item desbloqueável até localizar suporte documental ou marcar claramente como hipótese de design.

### 3. Morte de Vivian: relatos, horários e investigação

`EV-082-01` (notícia da descoberta do corpo e janela estimada; p. 82)
↔ `EV-083-01` (testemunha anônima e declaração de Scott; p. 83)
↔ `EV-088-01` (declaração atribuída a Scott; p. 88)
↔ `EV-090-01` (relatório do xerife sobre gritos/discussão; p. 90)
↔ `EV-100-01` (carta anônima menciona carta de ameaça não transcrita; p. 100)
↔ `EV-104-01` (carta de Scott negando o assassinato; p. 104)
↔ `EV-110-01` (registro da pousada ligado à investigação de Steven Moss; p. 110).

**Perguntas:** quais são as janelas de horário? Quais fontes são independentes? O que cada testemunha viu diretamente e o que apenas ouviu dizer?

**Limites:** testemunho anônimo, notícia, relatório e declaração do suspeito têm pesos e origens diferentes. A carta de ameaça mencionada em `EV-100-01` não foi transcrita no OCR deste lote; não inventar remetente ou conteúdo. Resolver conflitos de horário apenas depois da conferência visual e da cronologia completa.

### 4. Henry Johnson e a situação financeira do hospital

`EV-085-01` (notícia sobre corpo encontrado no lago; p. 85)
↔ `EV-084-01` (notícia sobre fechamento do hospital; p. 84)
↔ `EV-097-01` (alegação de investigação financeira; p. 97)
↔ `EV-092-01` (carta comercial de fornecedor; p. 92)
↔ `EV-094-01` (documento médico atribuído a Henry; p. 94).

**Perguntas:** o que é registro contemporâneo, o que é alegação financeira e o que é contexto clínico/comercial?

**Limites:** suspeita de desvio não prova desvio; relação comercial não prova fraude; encontrar um corpo não determina causa ou autoria da morte.

### 5. Andrew Reed: tentativas anteriores, incêndio e registros

`EV-115-01` e `EV-116-01` (entradas atribuídas a Dorothy; pp. 115–116)
↔ `EV-108-01` (livro de segurança; p. 108)
↔ `EV-087-01` (notícia sobre morte após incêndio; p. 87).

**Perguntas:** que eventos estão documentados antes do incêndio? As datas e a ordem das colunas podem ser confirmadas? Que fatos são apenas relatos de terceiros?

**Limites:** tentativas anteriores de suicídio não provam causa da morte posterior; incêndio de causa indeterminada não deve ser descrito como homicídio confirmado. A fotografia mencionada em `EV-116-01` permanece não identificada.

### 6. Pessoas, empregos e movimentação na mansão

`EV-095-01` (ficha de Bernard; p. 95)
↔ `EV-096-01` (carta atribuída a Dorothy; p. 96)
↔ `EV-106-01` (registro de intruso não identificado; p. 106)
↔ `EV-108-01` (livro de segurança; p. 108)
↔ `EV-110-01` (registro da pousada; p. 110).

**Perguntas:** quem tinha acesso formal, quem aparece apenas em um registro e quais horários precisam ser comparados?

**Limites:** uma descrição física genérica ou um registro de presença não identifica uma pessoa por si só. Confirmar leitura dos nomes, horas e datas antes de usar como requisito de puzzle.

## Dependências de implementação — ainda não autorizadas

| Elemento de jogo | Pré-requisito documental necessário | Estado |
|---|---|---|
| Cartão de personagem | Nome confirmado em fonte e distinção de homônimos | Pendente |
| Documento no inventário | Fonte, página, transcrição e legibilidade registradas | Pendente |
| Senha/código | Evidência explícita que permita deduzi-lo e teste de unicidade | Pendente |
| Sala ou passagem secreta | Referência confirmada ou etiqueta interna de hipótese de design | Pendente |
| Horário de álibi | Duas ou mais fontes comparadas, com origem e precisão registradas | Pendente |
| Conclusão final | Cadeia de evidências suficiente para cada componente exigido | Pendente |

## Critérios para converter em grafo de produção

1. Conferir as páginas originais e estabilizar os IDs duplicados.
2. Registrar cada aresta como `origem → ação/pergunta → destino`, com justificativa e estado.
3. Marcar dependências opcionais e caminhos alternativos para evitar bloqueios.
4. Fazer teste de alcançabilidade: cada item obrigatório deve ser alcançável sem depender de si mesmo.
5. Separar as pistas da rota original das pistas novas da rota alternativa.
6. Não publicar o grafo técnico completo na interface do jogador.
