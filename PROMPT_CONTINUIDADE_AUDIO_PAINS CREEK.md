# PROMPT DE CONTINUIDADE — ÁUDIOS COMPLETOS DO CASO PAINSCREEK

Você é a próxima IA responsável por continuar o desenvolvimento do repositório `tiago3228/dexter-revival-project`.

Todas as respostas visíveis devem começar exatamente com:

```text
[Zyon]
```

## Objetivo principal

Finalizar a infraestrutura de áudio do caso `Dexter: The Painscreek Case`, gerando e integrando narrações em português brasileiro para **todos os registros documentais e interrogatórios que ainda não possuem áudio**, sem inventar fatos, sem duplicar fontes e sem remover o texto original.

A experiência deve continuar funcionando como investigação documental no estilo de `The Painscreek Killings`: o jogador pode ler, ouvir ou fazer ambos. O áudio é opcional e nunca pode substituir a dedução.

## Estado real do repositório

- Repositório: `https://github.com/tiago3228/dexter-revival-project`
- Branch padrão: `main`
- A `main` é a branch que precisa ser sincronizada pelo Lovable.
- A integração anterior foi mesclada pela PR #22:
  - PR: `https://github.com/tiago3228/dexter-revival-project/pull/22`
  - Merge commit: `fa3e2d2dc320de821b308037ea7bc299e572a31b`
  - Conteúdo: áudio dos cinco registros do arquivo e três interrogatórios complementares.
- A tarefa seguinte está na PR #23:
  - PR: `https://github.com/tiago3228/dexter-revival-project/pull/23`
  - Branch: `feat/painscreek-next-documentary-audio`
  - Commit atual: `d6c8271`
  - Conteúdo: seis novos registros documentais narrados.
- **Não faça merge da PR #23 sem aprovação explícita do operador.** Primeiro conclua a auditoria e o lote de áudios, atualize a PR e confirme CI.
- Não use force push.
- Não publique diretamente em produção.
- Sempre faça commit e push ao finalizar cada lote/tarefa.

## Arquivos principais

- Catálogo documental:
  - `src/game/painscreekEvidence.ts`
- Explorador visual dos registros:
  - `src/game/PainscreekEvidenceExplorer.tsx`
- Catálogo de falas, cartas e trechos já narrados:
  - `src/game/painscreekArchiveVoices.ts`
- Interface das falas documentais:
  - `src/game/PainscreekArchiveVoices.tsx`
- Diálogos investigativos:
  - `src/game/painscreekDialogues.ts`
- Componente reutilizável de diálogo:
  - `src/game/StoryDialogue.tsx`
- Caso jogável com os interrogatórios-base:
  - `src/game/DexterCase.tsx`
- Áudios do caso:
  - `public/audio/painscreek/`
  - `public/audio/dexter/interrogations/`
- Skill obrigatória antes de gerar TTS:
  - `/home/ubuntu/skills/tts-prompter/SKILL.md`

## Cobertura já existente — não duplicar

### Arquivo documental já narrado

Estas entradas já têm `audioSrc` em `src/game/painscreekArchiveVoices.ts`:

- `dorothy-sofia-tea`
- `vivian-press-quote`
- `scott-court-press-report`
- `matthew-birthday-card`
- `scott-letter-trisha`

Arquivos correspondentes em `public/audio/painscreek/archive/`:

- `dorothy-sofia-tea.wav`
- `vivian-press-quote.wav`
- `scott-court-press-report.wav`
- `matthew-birthday-card.wav`
- `scott-letter-trisha.wav`

### Interrogatórios complementares já narrados

Estas cenas já têm `audioSrc` em `src/game/painscreekDialogues.ts`:

- Paul Renner — `paul-renner-follow-up.wav`
- Dr. Henry Vale — `henry-vale-follow-up.wav`
- Pastor Matthew Cole — `matthew-cole-follow-up.wav`

### Registros documentais já narrados na PR #23

Estas entradas já têm `audioSrc` em `src/game/painscreekEvidence.ts`:

- P-006 — Gravidez de Sofia e segredo de Charles
- P-014 — Tragédia na mina de carvão
- P-020 — Laudo médico de Vivian Roberts
- P-025 — Contratação de Steven Moss
- P-032 — Livro da pousada: Steven Moss e o caso Vivian
- P-046 — Notícia sobre a morte de Vivian Roberts

Arquivos:

- `p006-sofia-charles-secret.wav`
- `p014-coal-mine-tragedy.wav`
- `p020-vivian-medical-report.wav`
- `p025-steven-moss-hired.wav`
- `p032-inn-log-moss.wav`
- `p046-vivian-death-news.wav`

### Interrogatórios-base já existentes

O `DexterCase.tsx` já referencia estes arquivos antigos:

- `/audio/dexter/interrogations/paul-renner.mp3`
- `/audio/dexter/interrogations/henry-vale.mp3`
- `/audio/dexter/interrogations/matthew-cole.mp3`

Não substitua esses arquivos sem necessidade. O diálogo complementar em WAV já cobre a versão expandida.

## Escopo completo a auditar

### 1. Registros P-001 a P-047

Audite todos os objetos de `PAINSCREEK_EVIDENCE_001_116` em `src/game/painscreekEvidence.ts`.

Para cada registro:

1. Verifique se já possui `audioSrc`.
2. Verifique se o arquivo referenciado existe em `public/audio/painscreek/archive/`.
3. Se não possui áudio, avalie se o campo `documented` tem conteúdo suficiente para uma leitura documental.
4. Gere áudio usando exatamente o conteúdo de `documented`, com ajustes mínimos apenas para leitura natural de números, siglas e símbolos.
5. Não leia em voz alta os campos `pendingVerification` ou `playerInference` dentro da faixa principal, a menos que seja criado um áudio separado explicitamente rotulado como “ressalvas da fonte”.
6. Preserve a distinção entre:
   - fato documentado pela fonte;
   - relato atribuído a uma pessoa;
   - hipótese;
   - inferência do jogador;
   - lacuna ou contradição documental.

### 2. Duplicatas e registros frágeis

- P-031 é uma duplicata editorial de P-009. Não crie duas narrações idênticas sem necessidade. Se P-009 for narrado, registre no comentário/PR que P-031 aponta para a mesma fonte.
- Registros marcados como `incomplete`, `unverified` ou `contradictory` podem receber áudio, mas a interface deve deixar claro que a gravação é uma leitura do registro, não uma confirmação dos fatos.
- Não transforme um registro incompleto em narrativa fechada.
- Não resolva contradições por conta própria.

### 3. Diálogos e interrogatórios

Audite:

- todas as cenas de `PAINSCREEK_DIALOGUES`;
- todos os interrogatórios listados no `SUSPECTS` de `src/game/DexterCase.tsx`;
- eventuais diálogos adicionais vinculados a `StoryDialogueScene` no caso Painscreek.

Para qualquer diálogo sem áudio:

- gere a faixa completa da cena, incluindo abertura e as escolhas existentes;
- use exatamente as falas já escritas no código;
- não invente respostas, perguntas ou conclusões;
- mantenha as escolhas jogáveis na interface mesmo quando o áudio completo estiver disponível;
- rotule a faixa como `Áudio opcional · diálogo completo`;
- não permita que ouvir o áudio avance automaticamente o puzzle ou valide uma dedução.

## Regras de geração TTS

Antes de qualquer chamada de geração:

1. Leia novamente `/home/ubuntu/skills/tts-prompter/SKILL.md`.
2. Use `language_code: "pt-BR"`.
3. Use vozes de estúdio já aprovadas no projeto.
4. Para narração documental, prefira uma voz informativa, clara e estável, como `Charon`.
5. Para diálogo com dois personagens, use exatamente dois `speaker_voice_configs` e coloque `speaker` em todos os turns.
6. Não coloque instruções, rótulos de personagem ou direções de atuação dentro de `turns[].text`.
7. Coloque direção de entrega apenas em `turns[].style`.
8. Scripts com mais de 6000 caracteres devem ser divididos em chamadas separadas e concatenados com `ffmpeg`.
9. Use sempre caminhos absolutos terminando em `.wav`.
10. Não imite pessoas reais, atores, celebridades ou vozes clonadas.

## Convenção de nomes

Use nomes estáveis e descritivos:

```text
public/audio/painscreek/archive/p001-threat-letter.wav
public/audio/painscreek/archive/p002-1975-incident.wav
public/audio/painscreek/archive/p009-woman-in-forest.wav
```

Para interrogatórios:

```text
public/audio/painscreek/archive/paul-renner-follow-up.wav
```

Antes de criar um arquivo, confirme que o caminho não existe e que não há outro arquivo equivalente com nome diferente.

## Integração de código

Para cada registro novo:

1. Adicione `audioSrc?: string` ao tipo apenas se ainda não existir.
2. Adicione a rota ao objeto correto em `painscreekEvidence.ts`.
3. Não altere o texto de `documented`, `pendingVerification` ou `playerInference` sem necessidade.
4. Mantenha o controle de áudio opcional no `PainscreekEvidenceExplorer.tsx`.
5. Use `preload="none"` para evitar carregar dezenas de arquivos ao abrir o catálogo.
6. Use `aria-label` com ID e título do registro.
7. Mantenha a mensagem de que o áudio é uma reconstituição do texto catalogado.
8. Se houver muitos controles na mesma tela, impeça sobreposição apenas quando isso puder ser feito sem quebrar o controle nativo; não remova os controles do navegador.

Para cada diálogo novo:

1. Adicione `audioSrc?: string` ao `StoryDialogueScene` se necessário.
2. Adicione a rota à cena correta.
3. Renderize o áudio como opcional.
4. Preserve todas as escolhas e textos.
5. Não revele soluções do caso pelo simples fato de existir uma faixa narrada.

## Estratégia de lotes

Não tente gerar dezenas de faixas em uma única etapa sem controle.

Trabalhe em lotes de 5 a 8 áudios:

- Lote A: registros iniciais e correspondências familiares.
- Lote B: notícias, laudos e documentos institucionais.
- Lote C: cadernos, livros de registro e ocorrências de segurança.
- Lote D: registros finais, duplicatas tratadas e diálogos restantes.

Ao terminar cada lote:

1. valide todos os WAVs;
2. integre os caminhos no código;
3. rode lint dos arquivos alterados;
4. rode build;
5. rode typecheck e registre qualquer erro que já existia antes do lote;
6. faça commit;
7. faça push;
8. atualize a PR correspondente;
9. só então continue para o lote seguinte.

## Validação obrigatória

Use comandos equivalentes a:

```bash
find public/audio/painscreek/archive -type f -name '*.wav' -print

for f in public/audio/painscreek/archive/*.wav; do
  ffprobe -v error \
    -show_entries format=duration:stream=codec_name,sample_rate,channels \
    -of default=noprint_wrappers=1 "$f"
done

npx eslint <arquivos-modificados>
npm run build
npm run typecheck
```

O erro conhecido antes desta continuação é:

```text
src/game/Game.tsx(358,12): error TS2304: Cannot find name 'sfxRef'.
src/game/Game.tsx(359,7): error TS2304: Cannot find name 'sfxRef'.
```

Não corrija esse erro dentro da tarefa de áudio sem abrir uma tarefa separada e sem preservar as alterações locais existentes. Informe claramente se ele continuar.

Também existem alterações locais não relacionadas que não devem ser incluídas por acidente:

- `src/game/Game.tsx`
- `PROMPT_CONTINUIDADE_DEXTER_REVIVAL_2026-10-12.md`
- `src/lib/audioManager.ts`
- `src/lib/storage.ts`
- `src/test/storage.test.ts`
- `src/test/vivian-accessibility.test.tsx`

Antes de cada commit, use:

```bash
git status --short --branch
git diff --cached --check
git diff --cached --stat
```

Faça `git add` apenas dos arquivos pertencentes ao lote atual.

## Git e Lovable

- A branch de trabalho deve partir da `origin/main` atualizada.
- Nunca force push.
- Nunca sobrescreva alterações locais não relacionadas.
- Sempre confirme o commit remoto após o push.
- Se uma PR de lote for criada, use base `main`.
- O Lovable só deve exibir o lote depois que a PR for mesclada na `main`.
- Não faça merge automaticamente sem autorização explícita do operador.
- Ao solicitar merge, informe:
  - número da PR;
  - branch de origem;
  - commit exato;
  - validações concluídas;
  - efeito esperado no Lovable.

## Entrega final esperada

Ao concluir todos os lotes, entregue um relatório com:

1. total de registros catalogados;
2. total de registros com áudio;
3. IDs que receberam áudio;
4. IDs deliberadamente não narrados e motivo;
5. total de diálogos/interrogatórios narrados;
6. total e tamanho dos arquivos WAV;
7. commits e PRs criados;
8. resultado do lint, build, typecheck e testes;
9. quais PRs ainda aguardam merge;
10. confirmação de que nenhuma alteração local não relacionada foi incluída.

O áudio deve enriquecer a atmosfera documental do Caso Painscreek, mas nunca substituir a leitura, a exploração, o cruzamento de evidências ou a dedução do jogador.
