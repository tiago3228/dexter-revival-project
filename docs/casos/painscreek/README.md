# Dossiê documental — The Painscreek Killings

## Transcrições
- [Páginas 80–89](./transcricao-paginas-080-089.md) — transcrição com observações de legibilidade e trechos incompletos assinalados.
- [Análise das páginas 90–99](./analise-paginas-090-099.md) — resumo documental, pistas a cruzar e pendências de legibilidade.
- [Análise das páginas 100–109](./analise-paginas-100-109.md) — resumo documental, notas de segurança e novas linhas de investigação.
- [Análise das páginas 110–116](./analise-paginas-110-116.md) — lote final do PDF, com entradas do livro de registro e diário de Dorothy Patterson.
- [Cronologia documental 80–116](./cronologia-documental-080-116.md) — eventos organizados por data, com páginas de origem e questões em aberto.
- [Registro de pistas 80–116](./registro-de-pistas-080-116.md) — catálogo de evidências, fontes, incertezas e cruzamentos pendentes.
- [Plano de integração investigativa](./plano-integracao-investigativa.md) — matriz inicial das pistas, regras de validação e sequência segura para implementação.
- [Revisão visual das páginas 100–107 e 111–116](./revisao-visual-paginas-100-107-111-116.md) — conferência das evidências prioritárias, limites de interpretação e pendências restantes (inclui adendo sobre 108–110).
- [Auditoria de cruzamento das páginas 80–99](./auditoria-cruzamento-paginas-080-099.md) — deduplicação das fontes e distinção entre alegações, relatos e fatos documentados.
- [Auditoria de cruzamento das páginas 100–116](./auditoria-cruzamento-paginas-100-116.md) — cruzamento dos registros P-001–P-047, com atenção às possíveis duplicatas e às alegações que não podem ser tratadas como fatos confirmados.
- [Auditoria de cruzamento das páginas 51–79](./auditoria-cruzamento-paginas-051-079.md) — relações candidatas entre diários, anotações investigativas e catálogo, com separação de códigos, fotografias e relatos indiretos.
- [Auditoria documental dos personagens](./auditoria-personagens.md) — revisão dos perfis da interface contra as fontes primárias, com estados liberados e incertezas preservadas.
- [Auditoria preliminar das páginas 1–79](./auditoria-cruzamento-paginas-001-079.md) — OCR preliminar; duplicatas de conteúdo nas páginas 49–51 comparadas visualmente com as páginas 46–48 e confirmadas; auditoria integral do catálogo ainda pendente.
- [Auditoria de cruzamento das páginas 1–50](./auditoria-cruzamento-paginas-001-050.md) — conferência visual já concluída; registra as duas entradas omitidas da página 43 e as duplicatas das páginas 49–50.
- [Adendo de transcrição da página 43](./transcricao-pagina-043-adendo.md) — preserva a transcrição mais completa das duas entradas impressas de Scott Brooks.

## Interface interativa
- [Catálogo de evidências no jogo](/painscreek-evidence) — componente isolado com busca textual, filtro por estado de revisão e detalhes de fonte/ressalvas. O catálogo documental tem 47 registros estáveis (P-001–P-047) em `src/game/painscreekEvidence.ts`, incluindo referências das páginas 1–116; esse arquivo de dados continua separado da mecânica de solução do caso e não altera o caso Painscreek já presente na tela principal.

**Limite atual:** a interface apresenta 47 registros documentais das páginas 1–116; a deduplicação e a conferência integral de cada registro ainda continuam pendentes. O PDF original está dentro de `IMAGENS DE PAINSCREEK.zip` e tem 116 páginas digitalizadas como imagem. A Galeria de imagens das fontes é a referência visual acessível; OCR e transcrição servem apenas como apoio.

## Critérios de documentação
1. Manter a paginação conforme o PDF de origem.
2. Separar manchetes e alegações jornalísticas dos fatos documentais confirmados.
3. Não completar trechos cortados por inferência; marcar explicitamente as lacunas.
4. Revisar duplicatas contra os lotes anteriores antes de consolidar o índice geral.
5. Não considerar uma transcrição parcial como confirmação de integração de pistas na interface do jogo.
