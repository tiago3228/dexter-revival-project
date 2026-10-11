# Estrutura inicial dos episódios — Prompt Mestre

**Projeto:** Dexter: The Game — Remaster investigativo
**Repositório de trabalho atual:** `tiago3228/dexter-revival-project`
**Protótipo relacionado:** fase jogável “Turno da Noite” em `src/game/`
**Data:** 2026-10-11
**Status:** estruturação inicial; conteúdo narrativo original ainda em validação técnica

> Este documento inicia a organização dos episódios sem transformar nomes de arquivos em fatos narrativos. A campanha original de 2009 continua sendo a fonte principal. O que não estiver comprovado nos arquivos ou na documentação de engenharia reversa permanece marcado como `[PENDENTE]` ou `[HIPÓTESE]`.

## 1. Legenda obrigatória

- **`[CONFIRMADO]`** — sustentado por arquivo, análise técnica ou comportamento observado.
- **`[HIPÓTESE]`** — interpretação plausível que ainda precisa de confirmação.
- **`[SÉRIE]`** — referência criativa do universo televisivo; não pertence automaticamente ao jogo de 2009.
- **`[NOVO]`** — conteúdo criado para o remaster, sem atribuí-lo ao original.
- **`[PENDENTE]`** — informação que ainda depende da extração, inspeção ou teste dos arquivos originais.

## 2. Regras de estruturação

1. A campanha principal deve preservar a história efetivamente presente em `Dexter: The Game (2009)`.
2. Os nomes dos SWFs indicam uma relação estrutural com cenas, locais ou personagens, mas não provam sozinhos uma missão, ordem ou acontecimento.
3. A inspiração de *The Painscreek Killings* será aplicada à exploração, aos documentos, à conexão de pistas e à dedução — nunca à cópia de conteúdo, mapas, personagens ou textos.
4. A fase-piloto pode demonstrar a nova filosofia investigativa, mas deve ser identificada como conteúdo novo até que exista prova de correspondência com o original.
5. Cada episódio deve ter uma cronologia secreta, um mapa de evidências e puzzles justos. Esses elementos só podem ser preenchidos com fatos confirmados ou com conteúdo novo claramente rotulado.
6. A meta de **6 a 10 puzzles por episódio** é uma regra de planejamento do remaster, não uma afirmação sobre a quantidade original.

## 3. O que a pesquisa técnica confirma até agora

### 3.1 Escopo identificado

- **`[CONFIRMADO]`** Existem recursos associados ao episódio 1, incluindo **23 SWFs**, **23 vídeos WMV** e arquivos de áudio em categorias de conversas, narração, frases e sons associados.
- **`[CONFIRMADO]`** A instalação contém sistemas Flash relacionados a conversas, diário, evidências, confronto, GPS, mortes e outros componentes.
- **`[CONFIRMADO]`** Existem **76 XMLs** em `flash/config/`, com parâmetros e regras de gameplay.
- **`[CONFIRMADO]`** `cryptogram_pimp_easy.xml` contém regras de um criptograma e estados de vitória/derrota.
- **`[CONFIRMADO]`** `lockpick_garagenight_easy.xml` contém parâmetros de lockpick, incluindo tempo, dificuldade, tumblers e `LockPick_Win`.
- **`[CONFIRMADO]`** `killroomsetup_donovan.xml` contém eventos e propriedades externas relacionados a Donovan, incluindo referências a evidências e à cisterna.
- **`[CONFIRMADO]`** A análise de `dex001_police_station_master.swf` encontrou `DoInitAction`, chamadas `App::LoadConversation`, IDs `con-101-*` e referência a `conversation.swf`.
- **`[HIPÓTESE]`** Os IDs `con-101-h-01/02/04` têm relação com grupos de áudio `101_h_01/02/04_*.wav`. Como a etiqueta obrigatória não possui `MUITO PROVÁVEL`, este vínculo deve ser tratado operacionalmente como `[HIPÓTESE]` até confirmação pelo loader.
- **`[PENDENTE]`** O texto das falas, a correspondência de cada WAV, a ordem das cenas e o conteúdo integral dos SWFs ainda não estão confirmados.
- **`[PENDENTE]`** O formato de `data.ifs` ainda não foi identificado.
- **`[PENDENTE]`** A quantidade total de episódios/capítulos e a ordem completa da campanha não foram comprovadas na documentação disponível.

### 3.2 Fontes internas usadas

- `readme.md`
- `docs/ANALISE_ESTRUTURAL_SWF_2026-10-04.md`
- `docs/ANALISE_SWF_POLICE_STATION_2026-10-04.md`
- `docs/ANALISE_AUDIO_101_2026-10-04.md`
- `docs/ANALISE_DATA_IFS_E_OBJETOS_2026-10-04.md`
- `docs/VIABILIDADE_REMASTER_2026-10-04.md`
- `docs/REMASTER_ARCHITECTURE_2026-10-04.md`
- prompt mestre e dossiês fornecidos pelo autor do projeto

## 4. Estrutura de campanha atualmente possível

### Episódio 1 — identificação estrutural confirmada, narrativa pendente

**Estado:** `[CONFIRMADO]` como agrupamento de arquivos do episódio 1; `[PENDENTE]` quanto à campanha, à ordem e ao significado narrativo de cada cena.

**Arquivos de cena identificados:**

| Arquivo | Leitura estrutural segura | Estado narrativo |
|---|---|---|
| `dex001_apt_dex_master.swf` | Cena associada nominalmente ao apartamento de Dexter | `[HIPÓTESE]` local jogável ou evento; ordem e conteúdo `[PENDENTE]` |
| `dex001_glade_donovan_kr_master.swf` | Variante nominal associada a Glade/Donovan, com sufixo `kr` | `[HIPÓTESE]` variante de cena ou estado; significado de `kr` `[PENDENTE]` |
| `dex001_glade_donovan_master.swf` | Cena associada nominalmente a Glade/Donovan | `[PENDENTE]` conteúdo interno |
| `dex001_hotel_hooker_master.swf` | Cena nominalmente associada a hotel/hooker | `[PENDENTE]` conteúdo e papel na campanha |
| `dex001_hotel_jaw_master.swf` | Cena nominalmente associada a hotel/Jaw | `[PENDENTE]` conteúdo e papel na campanha |
| `dex001_house_jaw_master.swf` | Cena nominalmente associada a casa/Jaw | `[PENDENTE]` conteúdo e papel na campanha |
| `dex001_house_rita_master.swf` | Cena nominalmente associada a casa/Rita | `[PENDENTE]` conteúdo e papel na campanha |
| `dex001_park_band_master.swf` | Cena nominalmente associada a parque/band | `[PENDENTE]` conteúdo e papel na campanha |
| `dex001_park_bayfront_itk_master.swf` | Variante nominalmente associada a parque/bayfront/ITK | `[HIPÓTESE]` variante de estado, minijogo ou evento; confirmar |
| `dex001_park_bayfront_master.swf` | Cena nominalmente associada a parque/bayfront | `[PENDENTE]` conteúdo e papel na campanha |
| `dex001_park_test_master.swf` | Arquivo nominalmente associado a teste de parque | `[HIPÓTESE]` cena de teste/desenvolvimento; confirmar se entra no fluxo final |
| `dex001_pimp_alley_master.swf` | Cena nominalmente associada a beco/Pimp | `[PENDENTE]` conteúdo e papel na campanha |
| `dex001_pimp_apt_master.swf` | Cena nominalmente associada a apartamento/Pimp | `[PENDENTE]` conteúdo e papel na campanha |
| `dex001_pimp_garage_master.swf` | Cena nominalmente associada a garagem/Pimp | `[PENDENTE]` conteúdo e papel na campanha |
| `dex001_pimp_garagenight_kr_master.swf` | Variante nominalmente associada a garagem noturna/Pimp | `[HIPÓTESE]` variante de estado ou evento; confirmar |
| `dex001_pimp_garagenight_master.swf` | Cena nominalmente associada a garagem noturna/Pimp | `[PENDENTE]` conteúdo e papel na campanha |
| `dex001_pimp_sergei_kr_master.swf` | Variante nominalmente associada a Pimp/Sergei | `[HIPÓTESE]` variante de estado ou evento; confirmar |
| `dex001_pimp_sergei_master.swf` | Cena nominalmente associada a Pimp/Sergei | `[PENDENTE]` conteúdo e papel na campanha |
| `dex001_police_morgue_master.swf` | Cena nominalmente associada ao necrotério da polícia | `[PENDENTE]` conteúdo, evidências e ordem |
| `dex001_police_station_master.swf` | Cena nominalmente associada à delegacia | `[CONFIRMADO]` há ligação estrutural com carregamento de conversas; narrativa `[PENDENTE]` |
| `dex001_projects_jawex_master.swf` | Cena nominalmente associada a projetos/Jaw/ex | `[PENDENTE]` significado de `jawex` e conteúdo |
| `dex001_projects_jawin_kr_master.swf` | Variante nominalmente associada a projetos/Jaw/in | `[HIPÓTESE]` variante de estado ou evento; confirmar |
| `dex001_projects_jawin_master.swf` | Cena nominalmente associada a projetos/Jaw/in | `[PENDENTE]` significado e conteúdo |

> **Cuidado:** `jaw`, `pimp`, `Donovan`, `Rita`, `Sergei`, `hooker`, `bayfront`, `ITK`, `jawin` e `jawex` são pistas dos nomes de arquivos. Não serão tratados como personagens, culpados, vítimas, capítulos ou objetivos confirmados até que os bytes dos SWFs, XMLs, vídeos, diálogos ou comportamento executado sustentem essa conclusão.

## 5. Organização provisória do episódio 1 por locais

Esta é uma **organização de pesquisa**, não uma ordem de campanha.

| Bloco de investigação | Arquivos candidatos | O que pode ser investigado | Estado |
|---|---|---|---|
| Delegacia e perícia | `police_station`, `police_morgue` | entrada narrativa, evidências, conversas, laudos e transições | locais `[HIPÓTESE]`; conteúdo `[PENDENTE]` |
| Apartamento e residência | `apt_dex`, `house_rita`, `house_jaw` | exploração doméstica, documentos, conversas e pistas pessoais | conteúdo `[PENDENTE]` |
| Parque/bayfront | `park_band`, `park_bayfront`, `park_bayfront_itk`, `park_test` | espaço externo, investigação ambiental e variantes | conteúdo `[PENDENTE]` |
| Hotel | `hotel_hooker`, `hotel_jaw` | cenas de hotel, personagens e possíveis eventos | conteúdo `[PENDENTE]` |
| Pimp e garagem | `pimp_alley`, `pimp_apt`, `pimp_garage`, `pimp_garagenight`, variantes `kr` | cadeia de locais, minijogos e possíveis confrontos | conteúdo `[PENDENTE]` |
| Projetos e Jaw | `projects_jawex`, `projects_jawin`, variante `kr` | área/estado ligado a Jaw | significado narrativo `[PENDENTE]` |
| Glade/Donovan | `glade_donovan`, variante `kr` | eventos associados a Donovan; cisterna indicada no XML | eventos de gameplay parcialmente confirmados; narrativa `[PENDENTE]` |

## 6. Fase-piloto “Turno da Noite”

**Classificação:** `[NOVO]` — conteúdo criado no prompt mestre para demonstrar a abordagem investigativa do remaster. Não deve ser apresentado como missão original de 2009 sem uma correspondência documental futura.

**Finalidade:** prototipar exploração, documentos, caderno, dedução, relógio de turno e consequências sem depender da campanha original ainda não reconstruída.

### 6.1 Estrutura da fase

- **Cenário:** `[NOVO]` delegacia de Miami, com laboratório, corredor da Homicídios, sala de evidências e apartamento de Dexter.
- **Janela temporal:** `[NOVO]` 23h–6h.
- **Caso:** `[NOVO]` morte de Lucía Ortega e arquivamento prematuro.
- **Suspeitos:** `[NOVO]` Carlos Ruiz, Marco Tellez e Teresa Vidal.
- **Narração interna e Passageiro Sombrio:** `[SÉRIE]` como referência tonal; textos específicos da fase são `[NOVO]`.
- **Doakes:** `[NOVO]` pressão comportamental e janelas de circulação; a existência do personagem no jogo original precisa ser confirmada separadamente.

### 6.2 Os sete puzzles encadeados

| Nº | Puzzle | Tipo | Dificuldade | Pistas necessárias | Solução prevista | Consequência |
|---:|---|---|---|---|---|---|
| 1 | Ordem das gotas e caminho da vítima | forense/investigação | fácil | foto da cena e verso marcado | reconstruir o trajeto até o armário 17 | libera a busca documental seguinte |
| 2 | Hora real da morte | cálculo forense | intermediária | dados de temperatura e relatório | `(37 − 30,4) ÷ 1,5 ≈ 22h30`; relatório aponta 01h00 | revela adulteração do laudo |
| 3 | Contradição de Ruiz | dedução/documentos | fácil | depoimento e livro de detenção | Ruiz não poderia estar no bar às 21h | ele passa a ser suspeito verificável |
| 4 | Janela de circulação de Doakes | exploração/furtividade | intermediária | rotina e registros do café | reconhecer janelas aproximadas de 00h40, 02h40 e 04h40 | ações arriscadas elevam a pressão narrativa |
| 5 | Fechadura do armário | mecanismo | intermediária | regra visual dos pinos e soma | ordem decrescente sem repetição, total 14: 5-4-3-2 | abre o acesso ao próximo documento |
| 6 | Mensagem cifrada | criptografia | intermediária | data do primeiro crime | cifra de César com chave 7 | indica o armazém nove das docas |
| 7 | Luva plantada | prova plantada/dedução | difícil | tamanho da luva e ponto do porto | tamanho M não corresponde a Tellez; ponto do porto contradiz a acusação | separa culpado real de bode expiatório |

### 6.3 Finais da fase-piloto

Todos são `[NOVO]` e servem para testar o sistema de consequências:

1. **Final justo:** cadeia de evidências coerente e alvo correto.
2. **Final com ponta solta:** caso encerrado com evidência insuficiente.
3. **Final “inocente na mesa”:** jogador acusa ou captura a pessoa errada.
4. **Final “testemunha errada”:** a informação decisiva é interpretada de forma equivocada.

**Regras de consequência:**

- `[NOVO]` erros consomem tempo do turno;
- `[NOVO]` ações arriscadas aumentam a desconfiança observável de Doakes;
- `[NOVO]` na terceira falha grave, Doakes pode interromper a investigação;
- `[NOVO]` o amanhecer encerra o caso incompleto.

## 7. Ficha-padrão para cada episódio confirmado

A ficha abaixo será preenchida somente após a evidência correspondente ser encontrada.

### Episódio [número e nome a confirmar]

- **Classificação do conteúdo:** `[CONFIRMADO]` / `[PENDENTE]` / `[NOVO]`
- **Nome original confirmado:** `[PENDENTE]`
- **Posição na campanha:** `[PENDENTE]`
- **Locais e ambientação:** `[PENDENTE]`
- **Incidente inicial:** `[PENDENTE]`
- **Personagens presentes:** `[PENDENTE]`
- **Suspeitos, vítimas e alvos:** `[PENDENTE]`
- **Objetivo explícito do jogo original:** `[PENDENTE]`
- **Objetivo oculto do remaster:** só criar depois da confirmação do caso; se for novo, marcar `[NOVO]`
- **Documentos e evidências:** `[PENDENTE]`
- **Cronologia secreta hora a hora:** `[PENDENTE]`
- **Diálogos e narração:** `[PENDENTE]`; não transcrever sem áudio/texto confirmado
- **Puzzles originais identificados:** `[PENDENTE]`
- **Puzzles adicionais do remaster:** 6–10 metas `[NOVO]`, após conhecer a estrutura real
- **Furtividade e confrontos:** `[PENDENTE]`
- **Condições de conclusão:** `[PENDENTE]`
- **Finais e consequências:** `[PENDENTE]` para o original; `[NOVO]` apenas em ramificações criadas
- **Áudios e vídeos associados:** `[PENDENTE]` até mapear IDs e conteúdo
- **Arquivos técnicos relacionados:** listar SWF/XML/WMV/WAV com hash e evidência
- **Melhorias propostas:** separar em `[NOVO]` e manter rastreabilidade

## 8. Mapa de puzzles do remaster — meta inicial

A meta inicial é generosa, mas não definitiva:

| Categoria | Meta por episódio | Regra de uso |
|---|---:|---|
| Investigação ambiental | 1–2 | observar cenário sem marcador brilhante |
| Documentos e camadas escondidas | 1–2 | verso, últimas páginas, objetos dentro de objetos |
| Dedução/contradição | 1–2 | exigir duas fontes independentes |
| Cronologia/cálculo forense | 1 | registrar premissas no caderno |
| Criptografia ou mecanismo | 1 | chave dedutível no mundo |
| Puzzle encadeado | 1–2 | desbloquear pista em outro local |
| Forense/minijogo original | 1 | preservar apenas quando fizer sentido |

Isso produz aproximadamente **6–10 desafios por episódio**, mas a contagem final só será fixada quando a duração e o número real de episódios forem confirmados.

## 9. Próxima etapa de validação

### Prioridade técnica

1. Extrair `flash/scriptcontroller.swf`.
2. Extrair `flash/conversation.swf`.
3. Inspecionar `dex001_police_station_master.swf` e `dex001_police_morgue_master.swf` em profundidade.
4. Inspecionar os XMLs ligados aos nomes das cenas e minijogos.
5. Mapear `con-101-*` para WAVs e, depois, para texto.
6. Catalogar os 23 WMVs por conteúdo visual e possíveis transições.
7. Testar o significado das variantes `_kr_`.
8. Só então confirmar a ordem das missões e preencher a cronologia.

### Critério de promoção de informação

Uma afirmação só pode sair de `[PENDENTE]`/`[HIPÓTESE]` para `[CONFIRMADO]` quando houver pelo menos uma destas evidências:

- string ou evento extraído do arquivo correspondente;
- comportamento observado no jogo original;
- associação repetível entre cena, script, diálogo, áudio ou vídeo;
- documentação técnica com arquivo, caminho, hash e contexto;
- confirmação cruzada por mais de uma fonte independente.

## 10. Estado atual e limites

- `[CONFIRMADO]` Este repositório contém um protótipo web jogável da fase “Turno da Noite”, implementado em React/TanStack Start.
- `[CONFIRMADO]` A implementação atual da fase “Turno da Noite” está em `src/game/Game.tsx` e `src/game/data.ts`; a fase deve continuar marcada como `[NOVO]` até provar correspondência com o jogo original.
- `[PENDENTE]` Não há base suficiente para escrever a campanha completa, falas completas ou documentos do jogo original.
- `[PENDENTE]` Não há base suficiente para declarar quantos episódios a campanha original possui.
- `[NOVO]` A estrutura deste documento é a fundação para registrar os episódios sem misturar pesquisa, inspiração e criação.

## Referências

- `docs/ANALISE_ESTRUTURAL_SWF_2026-10-04.md`
- `docs/ANALISE_SWF_POLICE_STATION_2026-10-04.md`
- `docs/ANALISE_AUDIO_101_2026-10-04.md`
- `docs/ANALISE_DATA_IFS_E_OBJETOS_2026-10-04.md`
- `docs/VIABILIDADE_REMASTER_2026-10-04.md`
- `docs/REMASTER_ARCHITECTURE_2026-10-04.md`
- `readme.md`
- `Prompt_Mestre_Dexter_Remaster.md` fornecido pelo usuário
- Repositório de pesquisa relacionado: `tiago3228/dexter`
