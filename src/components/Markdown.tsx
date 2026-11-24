import { Fragment, type ReactNode } from "react";

// Convierte un texto en Markdown sencillo (títulos, listas, negritas) en HTML
function enLinea(t: string): ReactNode[] {
  return t.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : <Fragment key={i}>{p}</Fragment>,
  );
}

export default function Markdown({ texto }: { texto: string }) {
  const out: ReactNode[] = [];
  const lineas = texto.replace(/\r/g, "").split("\n");
  let i = 0, k = 0;
  while (i < lineas.length) {
    const l = lineas[i];
    if (!l.trim()) { i++; continue; }
    if (l.startsWith("### ")) { out.push(<h3 key={k++}>{enLinea(l.slice(4))}</h3>); i++; continue; }
    if (l.startsWith("## ")) { out.push(<h2 key={k++}>{enLinea(l.slice(3))}</h2>); i++; continue; }
    if (l.startsWith("# ")) { out.push(<h1 key={k++}>{enLinea(l.slice(2))}</h1>); i++; continue; }
    if (l.trim() === "---") { out.push(<hr key={k++} />); i++; continue; }
    if (/^- /.test(l) || /^\d+\. /.test(l)) {
      const ordenada = /^\d+\. /.test(l);
      const items: string[] = [];
      while (i < lineas.length && (ordenada ? /^\d+\. /.test(lineas[i]) : /^- /.test(lineas[i]))) {
        items.push(lineas[i].replace(/^(- |\d+\. )/, "")); i++;
      }
      const lis = items.map((t, j) => <li key={j}>{enLinea(t)}</li>);
      out.push(ordenada ? <ol key={k++}>{lis}</ol> : <ul key={k++}>{lis}</ul>);
      continue;
    }
    const parrafo: string[] = [];
    while (i < lineas.length && lineas[i].trim() && !/^(#|- |\d+\. |---)/.test(lineas[i])) { parrafo.push(lineas[i].replace(/\s+$/, "")); i++; }
    out.push(<p key={k++}>{parrafo.map((t, j) => <Fragment key={j}>{j > 0 && <br />}{enLinea(t)}</Fragment>)}</p>);
  }
  return <>{out}</>;
}
