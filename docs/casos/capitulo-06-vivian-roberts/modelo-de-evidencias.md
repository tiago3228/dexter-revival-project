# Modelo de evidências e dependências

Este arquivo define como catalogar cada elemento encontrado durante a revisão documental.

## Ficha padrão
Para cada item, registrar:
- **ID estável:** identificador curto, sem reutilização.
- **Título de exibição:** nome visível ao jogador.
- **Tipo:** diário, carta, foto, relatório, objeto, gravação, depoimento, mapa, mecanismo etc.
- **Fonte:** arquivo, página e, se aplicável, número/identificação da imagem.
- **Transcrição:** texto integral quando possível; preservar parágrafos, datas, assinaturas e rasuras relevantes.
- **Leitura incerta:** palavras duvidosas marcadas sem completar por adivinhação.
- **Autor / origem:** apenas quando indicado pela fonte.
- **Data do documento:** separar data escrita no documento da data em que o item foi encontrado.
- **Local de descoberta:** lugar e sublocal exatos.
- **Estado de acesso:** disponível desde o início, exige chave, exige código, exige outra pista ou exige evento.
- **Estado de revisão:** confirmado, pendente, ilegível, contraditório.
- **Afirmações explícitas:** o que o documento literalmente diz.
- **Inferências possíveis:** interpretações com links para os itens que as sustentam.
- **Limites:** o que o item, isoladamente, não prova.
- **Rotas:** original, alternativa ou compartilhada; não revelar a escolha ao jogador.
- **Notas de implementação:** UI, imagem, áudio, interação ou puzzle necessário.

## Grafo de dependências
Representar cada dependência como uma ligação explícita:
pista de origem -> ação/decodificação -> item ou local desbloqueado -> nova evidência

Não usar um código como requisito sem registrar a pista que permite deduzi-lo. Não criar dependências circulares que impeçam a progressão. Se um item pode ser encontrado por mais de um caminho, documentar cada caminho.

## Separar descoberta de interpretação
Uma evidência encontrada deve entrar no inventário antes de o jogador precisar interpretá-la. A conclusão investigativa pode depender de cruzar duas ou mais evidências, mas a interface não deve declarar culpabilidade automaticamente por uma única coincidência.

## Diários e documentos multipágina
- Cada diário é um único item no inventário, com páginas/entradas preservadas.
- Ao abrir, exibir leitura em modal/painel com navegação de páginas e texto integral conferido.
- Registrar no inventário que o documento foi encontrado; não exigir reler para manter o progresso.
- Manter paginação e quebras significativas quando isso afetar datas, autoria ou interpretação.
- Não resumir o conteúdo no lugar da transcrição.
- Se o texto original não puder ser lido, mostrar um marcador de trecho ilegível na versão de produção interna, nunca uma reconstrução inventada.

## Duas rotas investigativas
### Rota original
Preservar a solução original conforme comprovada pela fonte. Não modificar autoria, motivação, cronologia, arma ou evidências da solução original sem justificativa explícita e rastreável.

### Rota alternativa
Construir uma solução nova, com responsável, motivação, cronologia, meio e evidências próprios. A rota alternativa não pode ser apresentada como conteúdo do jogo original. As pistas exclusivas devem ser marcadas internamente como HIPÓTESE DE DESIGN até aprovação.

### Validação de justiça
Para cada rota, conferir que:
1. Há evidências acessíveis suficientes para deduzir quem, por quê e com qual arma/meio.
2. O jogador pode compreender as ligações sem depender de adivinhação.
3. Os álibis e horários não se contradizem sem explicação.
4. Os documentos não entregam a resposta cedo demais.
5. O formulário final exige suspeito, motivação e arma/meio.
6. Os feedbacks de resposta errada não revelam diretamente a solução.

## Formato sugerido de ID
- char-vivian-roberts
- loc-roberts-mansion-study
- doc-vivian-diary-1972
- ev-photo-001
- puzzle-clock-001
- dep-doc-001-to-loc-002

Os exemplos são ilustrativos; não afirmam que os itens existam com esses títulos exatos.
