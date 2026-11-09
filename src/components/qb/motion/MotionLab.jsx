import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import "./motion.css";

const media = "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/aaaf/";
const cards = [
  { to: "/questoes", title: "Banco\nQuestões", caption: "Câmara e Fiscal\nCatálogo", video: "oraciteslArea.mp4", tags: ["Questões", "Câmara", "Fiscal", "Inéditas"] },
  { to: "/rankings", title: "Incidência\nRankings", caption: "Por assunto e cargo\nProvas", video: "facet-glass-hero.mp4", tags: ["Provas", "Incidência", "Pegadinhas"] },
  { to: "/arquivos", title: "Acervo\nFontes", caption: "Documentos\nImportação", video: "stellarmind-hero.mp4", tags: ["Fontes", "Provas", "Exportação"] },
  { to: "/estudar", title: "Treino\nEstudar", caption: "Ambiente de estudo\nRevisão", video: "thedropthroughArea.mp4", tags: ["Questões", "Câmara", "Fiscal", "Estudo"] },
];
const tags = ["Tudo", "Questões", "Câmara", "Fiscal", "Provas", "Inéditas", "Incidência", "Pegadinhas", "Fontes", "Estudo"];

function Mark() {
  return <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
    <circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M20 5.5 22.9 13.7 30.3 9.7 26.3 17.1 34.5 20 26.3 22.9 30.3 30.3 22.9 26.3 20 34.5 17.1 26.3 9.7 30.3 13.7 22.9 5.5 20 13.7 17.1 9.7 9.7 17.1 13.7Z" fill="currentColor"/>
  </svg>;
}

function Video({ file, moving }) {
  const video = useRef(null);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (moving) element.play()?.catch(() => {});
    else element.pause();
  }, [moving]);
  return <video ref={video} src={media + file} autoPlay={moving} muted loop playsInline preload="metadata" aria-hidden="true"/>;
}

export default function MotionLab() {
  const canvas = useRef(null);
  const [filter, setFilter] = useState("Tudo");
  const [moving, setMoving] = useState(false);
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 761px) and (min-height: 501px)");
    const syncMotion = () => setMoving(!motion.matches);
    const syncWidth = () => setDesktop(wide.matches);
    syncMotion();
    syncWidth();
    motion.addEventListener("change", syncMotion);
    wide.addEventListener("change", syncWidth);
    return () => {
      motion.removeEventListener("change", syncMotion);
      wide.removeEventListener("change", syncWidth);
    };
  }, []);
  useEffect(() => {
    if (!moving) return;
    let stop, cancelled = false;
    import("./simulation").then(({ startMotion }) => {
      if (!cancelled && canvas.current) stop = startMotion(canvas.current);
    }).catch(() => { /* Static background remains available. */ });
    return () => { cancelled = true; stop?.(); };
  }, [moving]);
  const shown = cards.filter(card => filter === "Tudo" || card.tags.includes(filter));

  return <div className="qbm">
    <canvas id="bg" ref={canvas} aria-hidden="true"/>
    <div className="qbm-ui">
      <Link className="qbm-brand" to="/questoes" aria-label="Voltar ao Laboratório de Questões">
        <Mark/><span><strong>Quebrando a Banca</strong><small>Laboratório de questões</small></span>
      </Link>
      <div className="qbm-tools">
        <button type="button" className="qbm-motion-toggle" onClick={() => setMoving(!moving)}>
          {moving ? "Pausar movimento" : "Ativar movimento"}
        </button>
        <span className="qbm-counter" aria-label={shown.length + " atalhos visíveis"}>{String(shown.length).padStart(2, "0")}</span>
      </div>
      {desktop && <>
        <div className="qbm-tags" aria-label="Filtrar atalhos do Laboratório">
          {tags.map(tag => <button type="button" key={tag} aria-pressed={filter === tag} onClick={() => setFilter(tag)}>{tag}</button>)}
        </div>
        <nav className="qbm-list" aria-label="Atalhos do Laboratório">
          {shown.map(card => <Link className="qbm-card" key={card.to} to={card.to}>
            <div className="qbm-thumb"><Video file={card.video} moving={moving}/></div>
            <div className="qbm-meta"><span>{card.title}</span><span>{card.caption}</span></div>
          </Link>)}
        </nav>
      </>}
      <main className="qbm-about">
        <section>
          <h2>[info]</h2>
          <p>O Laboratório reúne questões inéditas e provas analisadas da Câmara e da Área Fiscal.</p>
        </section>
        <section>
          <h2>[objetivo]</h2>
          <p>Use as provas da CEBRASPE para entender o que cai, como a banca formula os itens e onde aparecem as pegadinhas.</p>
          <p>Consulte a incidência por matéria, assunto e cargo. Cada índice informa o tamanho da amostra.</p>
        </section>
        <section>
          <h2>[explorar]</h2>
          <ul><li>Questões inéditas</li><li>Provas de referência</li><li>Mecanismos de falsificação</li><li>Exportação de questões</li></ul>
        </section>
        <section>
          <h2>[acesso]</h2>
          <Link to="/questoes">Índice → Laboratório</Link>
          <Link to="/estudar">Treino → Ambiente de estudo</Link>
        </section>
      </main>
    </div>
  </div>;
}
