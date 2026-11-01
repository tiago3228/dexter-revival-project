# Handoff — Dexter Revival Project / Capítulo 06

**Atualizado:** 01/11/2026  
**Repositório:** `tiago3228/dexter-revival-project`, branch `main`  
**Ponto de partida publicado para esta etapa:** `94e6bdb` (`docs: registrar quinta conferência das páginas 70-116`). A triagem central e este handoff ficam no commit subsequente desta etapa.

## Já concluído

- Implementada a lógica de vitória real do Capítulo 06: acusação correta **Matthew Brooks**, arma **machado**, motivação **vingança pelo assassinato de Sofia**. A conclusão persiste em `localStorage`; “Arquivo confidencial · Revelação final” permanece bloqueado até a vitória. O plano registra testes automatizados, build e fluxo de vitória aprovados.
- Consolidada a narrativa final em `revelacao-final-vivian.md`, mantendo datas divergentes e limites das fontes.
- As 116 capturas do ZIP original foram mapeadas por conteúdo/data para as páginas de referência. Houve quatro passadas abrangentes e uma quinta revisão focalizada das páginas 70–116 (47 imagens, sete grupos).
- Na quinta revisão, “Roland Brown” foi confirmado na camada inglesa subjacente de `doc9.png` (p. 97) e harmonizado em `transcricoes-imagens-zip/15-documents.md`. Quatro leituras abaixo do limiar 0,90 foram mantidas como candidatas, não como transcrição confirmada. Sobreposições, cortes e fragmentos ambíguos continuam preservados sem inferência.
- O registro central `contradicoes-e-lacunas.md` foi classificado em sete seções: **32 questões distintas** — 10 com correção/cautela já adequada, **20 lacunas abertas**, **1 contradição aberta** (“Mathew”/“Matthew”) e **1 decisão de design sem confirmação** (rota pelo dreno/esgoto). As duas menções à ameaça da p. 100 foram identificadas como duplicata e consolidadas.
- A revisão editorial seguinte foi concluída em `VivianInvestigationGame.tsx`, `VivianFinalReveal.tsx` e `revelacao-final-vivian.md`: relações Scott/Vincent, destino e sobrenome de Sofia, fita de Magdalene e rota secreta/esgotos agora aparecem como relatos, hipóteses ou design não confirmado. O gabarito Matthew–machado–vingança e o bloqueio do arquivo final foram preservados.

## Ainda falta — prioridades para a próxima IA

1. ~~**Revisão editorial do jogo contra as fontes atualizadas:** conferir `src/game/VivianInvestigationGame.tsx`, os textos de evidência e `revelacao-final-vivian.md` para garantir consistência com as transcrições e evitar transformar testemunhos, suspeitas ou hipóteses em fatos canônicos. Preservar a condição de vitória e o bloqueio do arquivo final.**~~ **Concluída nesta etapa; validações automatizadas aprovadas.**
2. **Continuar a transcrição diplomática:** a revisão integral palavra por palavra das 116 imagens ainda não terminou. A prioridade imediata é resolver, se a imagem permitir, os fragmentos listados em `transcricoes-imagens-zip/quinta-conferencia-paginas-070-116.md`; manter EM REVISÃO o que estiver encoberto/cortado.
3. **Investigar as 20 lacunas abertas** no registro central sem inferir: identidade Scott/Vincent, datas e cronologia de 1975, destino de Sofia, relação Matthew/Father Matthew/Father Calvin, remetente da carta p. 91, ameaça p. 100, médico legista p. 82, circunstâncias da morte de Henry, cronologia/foto de Andrew, sala secreta (mansão vs. cabana), pintura/clique, cápsula do tempo e lacunas de transcrição em diferentes intervalos.
4. **Resolver ou preservar como contradição a grafia “Mathew”/“Matthew”** apenas após localizar leitura primária suficiente; não normalizar automaticamente.
5. **Manter a rota do dreno/esgoto como design não confirmado** até haver fonte pertinente ou decisão explícita de design. Não fechar essa lacuna por ausência de menção.
6. **Após futuras alterações**, executar lint, testes, build e `git diff --check`; atualizar o checklist, plano, registro central e referências por página. Fazer commit/push apenas quando a etapa estiver revisada.

## Regras de proveniência

- Distinguir texto literal, tradução impressa, manuscrito subjacente, interface e resumo.
- Usar atribuição (“o relatório alega”, “a testemunha relata”, “Scott afirma”), não converter relatos em fatos independentes.
- Não reconstruir texto oculto por contexto, tradução, narrativa do jogo ou OCR; registrar `[ilegível]`, corte ou candidato incerto.
- Não tratar auditoria visual como sinônimo de transcrição diplomática integral nem imagens repetidas como testemunhos independentes.
