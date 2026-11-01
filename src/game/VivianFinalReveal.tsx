import { useState } from "react";
import { BookOpen, LockKeyhole, X } from "lucide-react";

const REVELATION_SECTIONS = [
  {
    title: "O segredo que antecedeu a morte",
    paragraphs: [
      "A reconstrução usada neste capítulo liga a morte de Vivian Roberts a um segredo atribuído a 1975: Sofia teria morrido depois de um confronto relacionado à gravidez e ao bebê que teve com Charles Roberts. Andrew Reed é associado ao encobrimento em relatos de pesquisa; a criança teria sido levada para fora da cidade e registrada como Scott Brooks. A sequência exata e o destino de Sofia continuam sujeitos às fontes primárias.",
      "Décadas depois, Scott começou a investigar quem era Sofia. A carta do orfanato, o cobertor de bebê e a fotografia associada a Sofia e ao bebê formam a cadeia que, na reconstrução narrativa, o leva a reconhecer a própria origem. A identificação de Scott com Vincent é tratada como revelação do arco do caso, mas permanece uma questão documental aberta no registro central.",
    ],
  },
  {
    title: "A vingança de Matthew",
    paragraphs: [
      "Matthew Brooks é apresentado no arco do caso como pai adotivo de Scott e como alguém com forte ligação afetiva com Sofia, identificada nas fontes de pesquisa como a mulher que amava. Quando Scott contou o que descobrira, Matthew passou a acreditar que Vivian estava envolvida na morte de Sofia. Em vez de recorrer às autoridades, decidiu fazer justiça com as próprias mãos e passou a eliminar os responsáveis, conforme a reconstrução usada pelo capítulo.",
      "A reconstrução atribui a Matthew a morte de Andrew Reed e do Dr. Henry Johnson, além da de Vivian. A prova mais importante é uma gravação de 19 de julho de 1995: Matthew relata que Vivian foi encontrá-lo, não demonstrou arrependimento pela morte de Sofia e ainda a insultou. Ele afirma que, depois de ouvi-la, matou Vivian com um machado e levou o corpo para a frente da mansão Roberts. O questionário final do jogo confirma o machado como arma; a faca ensanguentada encontrada na casa de Bernard pertence a outra linha de investigação e não deve ser confundida com a arma do crime de Vivian.",
      "Assim, Scott tornou-se um suspeito plausível aos olhos da comunidade por ter discutido com Vivian e sido visto na região. A suspeita, porém, não era prova. A informação atribuída a Derrick e a falta de evidência suficiente contribuíram para que a acusação contra Scott não se sustentasse. Dentro do gabarito final do capítulo, a autoria da morte de Vivian é Matthew.",
    ],
  },
  {
    title: "O que a investigação permite afirmar",
    paragraphs: [
      "As três respostas do encerramento são: Matthew Brooks; machado; vingança pela morte de Sofia, mulher que Matthew amava. A gravação aponta que a falta de arrependimento de Vivian e o insulto a Sofia foram o estopim imediato, dentro dessa motivação de vingança. A investigação não transforma automaticamente cada suspeita sobre 1975 em fato: a intenção exata de cada pessoa no confronto e a participação individual de Vivian e Henry devem ser lidas à luz das fontes originais.",
      "Há divergência de um dia entre os registros comunitários sobre a morte de Vivian: uma cronologia indica 18 de julho de 1995, enquanto a gravação de Matthew está datada de 19 de julho. A gravação é a prova central da autoria e do motivo; o questionário final confirma o machado. As fontes consultadas não detalham aqui a hora exata nem a natureza precisa dos ferimentos.",
      "A morte de Vivian não encerrou o ciclo. A reconstrução de pesquisa atribui a Matthew outras mortes e tentativas de impedir que Steven Moss e, depois, Janet Kelly expusessem o passado. A cadeia de violência nasceu do encobrimento, mas a decisão de Matthew de retaliar criou novas vítimas e não reparou o crime original.",
    ],
  },
];

export function VivianFinalReveal({ unlocked }: { unlocked: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section
        aria-label="Arquivo confidencial: revelação final"
        className={`border p-4 sm:p-5 ${unlocked ? "border-[#9a8058] bg-[#1b1a17]" : "border-[#4b4439] bg-[#171614]"}`}
      >
        <div className="flex items-start gap-3">
          <div className="border border-[#79664c] p-2 text-[#c4a779]" aria-hidden="true">
            {unlocked ? <BookOpen size={20} /> : <LockKeyhole size={20} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4a779]">
              Arquivo confidencial · Revelação final
            </p>
            <h2 className="mt-1 font-display text-2xl">O que aconteceu com Vivian Roberts</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#bdb5a8]">
              {unlocked
                ? "A acusação foi concluída. O relato completo do caso está disponível neste arquivo."
                : "Conteúdo lacrado. Conclua a investigação, reúna as provas necessárias e acerte a acusação final para acessar a narrativa."}
            </p>
            <button
              type="button"
              disabled={!unlocked}
              onClick={() => setOpen(true)}
              className="mt-4 inline-flex min-h-11 items-center gap-2 border border-[#79664c] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#ead8b8] transition enabled:hover:border-[#c4a779] enabled:hover:bg-[#c4a779]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {unlocked ? <BookOpen size={15} /> : <LockKeyhole size={15} />}
              {unlocked ? "Abrir revelação" : "Bloqueado até concluir o caso"}
            </button>
          </div>
        </div>
      </section>
      {open && unlocked && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-3 sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <article
            role="dialog"
            aria-modal="true"
            aria-labelledby="vivian-final-title"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-[#9a8058] bg-[#171614] p-5 text-[#eee9df] shadow-2xl sm:p-8"
          >
            <header className="flex items-start justify-between gap-4 border-b border-[#4b4439] pb-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a779]">
                  Arquivo confidencial · Capítulo 06
                </p>
                <h2 id="vivian-final-title" className="mt-2 font-display text-3xl sm:text-4xl">
                  O Caso Vivian Roberts
                </h2>
                <p className="mt-2 text-xs uppercase tracking-wider text-[#a9a092]">
                  Revelação final · Spoilers do desfecho
                </p>
              </div>
              <button
                type="button"
                aria-label="Fechar revelação final"
                onClick={() => setOpen(false)}
                className="min-h-10 min-w-10 border border-[#4b4439] p-2 text-[#c4a779] hover:border-[#c4a779]"
              >
                <X size={18} />
              </button>
            </header>
            <p className="mt-5 border-l-2 border-[#c4a779] pl-4 text-sm leading-relaxed text-[#d5c9b5]">
              Conclusão do gabarito: Matthew Brooks matou Vivian Roberts com um machado, por
              vingança pela morte de Sofia, mulher que amava. Na gravação de 19 de julho de 1995,
              Matthew relata que Vivian não demonstrou arrependimento e insultou Sofia antes de ele
              matá-la. Os registros consultados divergem em detalhes de data; onde não há
              confirmação suficiente, esta narrativa preserva a incerteza em vez de completar as
              lacunas.
            </p>
            <div className="mt-6 space-y-7">
              {REVELATION_SECTIONS.map((section, index) => (
                <section key={section.title}>
                  <h3 className="font-display text-2xl text-[#ead8b8]">
                    {String(index + 1).padStart(2, "0")} · {section.title}
                  </h3>
                  <div className="mt-3 space-y-3 text-sm leading-7 text-[#c9c1b5]">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <footer className="mt-7 border-t border-[#4b4439] pt-4 text-xs leading-relaxed text-[#a9a092]">
              Este epílogo resume a reconstrução narrativa do projeto. A data exata e os detalhes
              materiais da morte de Vivian permanecem sujeitos às divergências apontadas nas fontes
              comunitárias e nos documentos do caso.
            </footer>
          </article>
        </div>
      )}
    </>
  );
}
