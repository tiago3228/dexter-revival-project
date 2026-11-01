import { useState } from "react";
import { Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GRID_CLUES, GRID_PEOPLE, GRID_RECORDS, checkGrid, nextMark, type Mark } from "./vivianLogicGrid";

export function VivianLogicGrid({ found, solved, onSolve }: { found: string[]; solved: boolean; onSolve: () => void }) {
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [feedback, setFeedback] = useState("");
  const missing = GRID_RECORDS.filter((r) => !found.includes(r.id)).length;
  return (
    <section className="space-y-4 border border-border p-4" aria-label="Grade de dedução">
      <h3 className="flex items-center gap-2 font-display text-xl"><Grid3x3 size={18} /> Grade de dedução</h3>
      {missing > 0 ? (
        <p className="text-sm text-muted-foreground">Encontre mais {missing} registro(s) para abrir a grade.</p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">Clique numa casa: 1× marca ✗ (descartado), 2× marca ● (confirmado), 3× limpa. Ligue cada pessoa ao registro que a cita.</p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">{GRID_CLUES.map((c) => <li key={c}>{c}</li>)}</ol>
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs">
              <thead><tr><th />{GRID_RECORDS.map((r) => <th key={r.id} className="p-2 font-mono font-normal text-muted-foreground">{r.label}</th>)}</tr></thead>
              <tbody>{GRID_PEOPLE.map((p) => (
                <tr key={p}><th className="pr-3 text-left font-normal">{p}</th>
                  {GRID_RECORDS.map((r) => { const k = `${p}|${r.id}`; const m = marks[k] ?? ""; return (
                    <td key={r.id} className="border border-border p-0">
                      <button type="button" disabled={solved} aria-label={`${p} e ${r.label}`} onClick={() => { setFeedback(""); setMarks((c) => ({ ...c, [k]: nextMark(m) })); }}
                        className="h-11 w-full min-w-11 text-lg hover:bg-accent">{m === "x" ? "✗" : m === "o" ? "●" : ""}</button>
                    </td>); })}
                </tr>))}</tbody>
            </table>
          </div>
          {solved ? <p className="text-sm text-primary">Grade resolvida. CONFIRMADO: cada pessoa aparece no registro indicado — isso não estabelece culpa.</p> : (
            <Button type="button" variant="outline" onClick={() => { if (checkGrid(marks)) onSolve(); else setFeedback("Ainda há uma contradição com as pistas. Revise os ✗ e ●."); }}>Conferir grade</Button>)}
          {feedback && <p className="text-sm text-destructive">{feedback}</p>}
        </>
      )}
    </section>
  );
}
