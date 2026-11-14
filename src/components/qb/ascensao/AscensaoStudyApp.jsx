import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Flame,
  HelpCircle,
  Layers,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  X,
  XCircle,
} from "lucide-react";
import {
  AchievementEmblem,
  Badge,
  BrandHeader,
  Button,
  HeroAscension,
  IconButton,
  Panel,
  ProgressBar,
  RadialNavigation,
} from "./AscensaoPrimitives";
import {
  extractFlashcardsFromRevisao,
  extractMindMapsFromRevisao,
  saveAnswerRecord,
  summarizeStudyState,
} from "@/lib/ascensao-study";

const NAV_ITEMS = [
  { id: "hoje", label: "Hoje", icon: Compass },
  { id: "questoes", label: "Questões", icon: Target },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "mapas", label: "Mapas", icon: Brain },
];

export default function AscensaoStudyApp({
  listDocumentsFn,
  writeDocumentFn,
  askTutorFn,
  correctFlashcardFn,
  onSwitchClassic,
  readOnlyPreview = false,
  userName = "Estudante",
}) {
  const [activeTab, setActiveTab] = useState("hoje");
  const [tutorOpen, setTutorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedCap, setSelectedCap] = useState("");

  const [data, setData] = useState({
    edital: [],
    questoes: [],
    respostas: [],
    revisao: [],
    pegadinhas: [],
    diario: [],
  });

  useEffect(() => {
    let alive = true;
    async function hydrate() {
      setLoading(true);
      setLoadError("");
      try {
        const [edital, questoes, respostas, revisao, pegadinhas, diario] =
          await Promise.all([
            listDocumentsFn("edital"),
            listDocumentsFn("questoes"),
            listDocumentsFn("respostas"),
            listDocumentsFn("revisao"),
            listDocumentsFn("pegadinhas"),
            listDocumentsFn("diario"),
          ]);
        if (!alive) return;
        setData({
          edital: Array.isArray(edital) ? edital : [],
          questoes: Array.isArray(questoes) ? questoes : [],
          respostas: Array.isArray(respostas) ? respostas : [],
          revisao: Array.isArray(revisao) ? revisao : [],
          pegadinhas: Array.isArray(pegadinhas) ? pegadinhas : [],
          diario: Array.isArray(diario) ? diario : [],
        });
      } catch (err) {
        if (!alive) return;
        setLoadError(err?.message || "Não foi possível carregar os dados de estudo.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    hydrate();
    return () => {
      alive = false;
    };
  }, [listDocumentsFn]);

  const stats = useMemo(() => summarizeStudyState(data), [data]);
  const flashcards = useMemo(
    () => extractFlashcardsFromRevisao(data.revisao),
    [data.revisao]
  );
  const mindMaps = useMemo(
    () => extractMindMapsFromRevisao(data.revisao),
    [data.revisao]
  );

  const navItemsWithBadges = useMemo(
    () =>
      NAV_ITEMS.map((item) => {
        if (item.id === "questoes" && stats.dueReviews > 0) {
          return { ...item, badge: stats.dueReviews };
        }
        if (item.id === "flashcards" && flashcards.length > 0) {
          return { ...item, badge: flashcards.length };
        }
        return item;
      }),
    [stats.dueReviews, flashcards.length]
  );

  function handleAnswerSaved(qid, newRecord) {
    setData((prev) => {
      const rest = prev.respostas.filter((r) => (r.qid || r.id) !== qid);
      return { ...prev, respostas: [...rest, newRecord] };
    });
  }

  function startChapterPractice(capId = "") {
    setSelectedCap(capId);
    setActiveTab("questoes");
  }

  return (
    <div className="qb-ascensao-shell">
      <BrandHeader
        navItems={navItemsWithBadges}
        activeNav={activeTab}
        onSelectNav={setActiveTab}
        onOpenTutor={() => setTutorOpen(true)}
        onSwitchClassic={onSwitchClassic}
        readOnlyPreview={readOnlyPreview}
      />

      <main className="qb-main-container">
        {loadError ? (
          <Panel
            variant="ornate"
            style={{ padding: 20, marginBottom: 20, borderColor: "var(--state-incorrect)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldAlert size={20} style={{ color: "var(--state-incorrect)" }} />
              <strong>Erro ao carregar Controle de Estudo:</strong>
              <span>{loadError}</span>
            </div>
          </Panel>
        ) : null}

        {loading ? (
          <Panel style={{ padding: 36, textAlign: "center" }}>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Carregando seu progresso, questões e revisões...
            </p>
          </Panel>
        ) : null}

        {!loading && activeTab === "hoje" ? (
          <DashboardView
            userName={userName}
            stats={stats}
            edital={data.edital}
            pegadinhas={data.pegadinhas}
            onNavigate={setActiveTab}
            onStartPractice={startChapterPractice}
            onOpenTutor={() => setTutorOpen(true)}
          />
        ) : null}

        {!loading && activeTab === "questoes" ? (
          <QuestionsSessionView
            questoes={data.questoes}
            respostas={data.respostas}
            edital={data.edital}
            selectedCap={selectedCap}
            onSelectCap={setSelectedCap}
            writeDocumentFn={writeDocumentFn}
            readOnlyPreview={readOnlyPreview}
            onAnswerSaved={handleAnswerSaved}
            onAskTutor={() => setTutorOpen(true)}
          />
        ) : null}

        {!loading && activeTab === "flashcards" ? (
          <FlashcardsView
            flashcards={flashcards}
            correctFlashcardFn={correctFlashcardFn}
          />
        ) : null}

        {!loading && activeTab === "mapas" ? (
          <MindMapsView mindMaps={mindMaps} />
        ) : null}
      </main>

      <TutorDrawer
        open={tutorOpen}
        onClose={() => setTutorOpen(false)}
        askTutorFn={askTutorFn}
        context={{
          activeTab,
          selectedCap,
          stats,
        }}
      />
    </div>
  );
}

function DashboardView({
  userName,
  stats,
  edital,
  pegadinhas,
  onNavigate,
  onStartPractice,
  onOpenTutor,
}) {
  const radialItems = [
    {
      id: "questoes",
      label: "Treinar C/E",
      meta: stats.dueReviews > 0 ? `${stats.dueReviews} para revisar` : `${stats.totalQuestions} itens`,
      icon: Target,
    },
    {
      id: "flashcards",
      label: "Flashcards",
      meta: `${stats.flashcardsCount} cartões`,
      icon: Layers,
    },
    {
      id: "mapas",
      label: "Mapas Mentais",
      meta: `${stats.mindMapsCount} mapas`,
      icon: Brain,
    },
    {
      id: "tutor",
      label: "Tutor IA",
      meta: "Omni integrado",
      icon: MessageSquare,
    },
    {
      id: "caderno",
      label: "Caderno de Erros",
      meta: `${stats.notebookCount} itens`,
      icon: Flame,
    },
  ];

  const topicsToStudy = useMemo(() => {
    return edital.slice(0, 6);
  }, [edital]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <HeroAscension
        eyebrow="A Ascensão · Controle de Estudo"
        title={`Bom estudo, ${userName}`}
        subtitle={
          stats.dueReviews > 0
            ? `Você tem ${stats.dueReviews} revisão(ões) vencida(s) hoje e ${stats.notebookCount} item(ns) no caderno de erros.`
            : "Seu progresso real, retenção de 7+ dias e calibração Cebraspe estão sincronizados."
        }
        progress={stats.masteryPercent}
        primaryAction={
          <Button
            variant="primary"
            size="lg"
            icon={Target}
            onClick={() => onStartPractice("")}
          >
            {stats.dueReviews > 0 ? "Fazer revisões de hoje" : "Treinar questões C/E"}
          </Button>
        }
        secondaryAction={
          <Button variant="secondary" size="lg" icon={MessageSquare} onClick={onOpenTutor}>
            Consultar Tutor IA
          </Button>
        }
        metrics={[
          {
            label: "Acerto geral",
            value: `${stats.accuracyPercent}%`,
            accent: "var(--state-correct)",
          },
          {
            label: "Retenção 7+ dias",
            value: `${stats.retainedCount}`,
            accent: "var(--qb-gold-bright)",
          },
          {
            label: "Calibração certeza",
            value: stats.calibrationPercent !== null ? `${stats.calibrationPercent}%` : "—",
            accent:
              stats.calibrationPercent !== null && stats.calibrationPercent >= 90
                ? "var(--state-correct)"
                : "var(--state-attention)",
          },
          {
            label: "Caderno de erros",
            value: `${stats.notebookCount}`,
            accent: stats.notebookCount > 0 ? "var(--state-incorrect)" : "var(--qb-ivory)",
          },
        ]}
      />

      <div className="qb-dash-grid">
        <Panel style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <span className="qb-overline">Bússola de Sessão</span>
            <h2 style={{ margin: "6px 0 0", fontFamily: "var(--font-heading)", fontSize: 22 }}>
              Escolha sua frente de recuperação
            </h2>
          </div>
          <RadialNavigation
            items={radialItems}
            activeId="questoes"
            onSelect={(id) => {
              if (id === "tutor") onOpenTutor();
              else if (id === "caderno") onStartPractice("__CADERNO__");
              else onNavigate(id);
            }}
          />
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Panel variant="ornate" style={{ padding: 20 }}>
            <span className="qb-overline">Marcos da Jornada</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
              <AchievementEmblem
                id="soldado"
                title="Disciplina Diária"
                subtitle={`${stats.answeredCount} questões respondidas`}
                unlocked={stats.answeredCount >= 1}
              />
              <AchievementEmblem
                id="sabio"
                title="Retenção Comprovada"
                subtitle={`${stats.retainedCount} itens retidos por 7+ dias`}
                unlocked={stats.retainedCount >= 5}
              />
              <AchievementEmblem
                id="estrategista"
                title="Calibração 90%+"
                subtitle={
                  stats.calibrationPercent !== null
                    ? `Atual: ${stats.calibrationPercent}% em certeza`
                    : "Marque certeza (3) para calibrar"
                }
                unlocked={stats.calibrationPercent !== null && stats.calibrationPercent >= 90}
              />
            </div>
          </Panel>

          <Panel style={{ padding: 20 }}>
            <span className="qb-overline">Tópicos do Edital</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {topicsToStudy.length === 0 ? (
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
                  Nenhum tópico cadastrado no edital ainda.
                </p>
              ) : (
                topicsToStudy.map((topic) => (
                  <div
                    key={topic.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: "var(--surface-sunken)",
                      border: "var(--border-hairline)",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "var(--qb-ivory)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {topic.titulo || topic.nome || topic.id}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {topic.materia || "Edital"} · {topic.status || "pendente"}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onStartPractice(
                          Array.isArray(topic.caps) && topic.caps[0] ? topic.caps[0] : topic.id
                        )
                      }
                    >
                      Treinar
                    </Button>
                  </div>
                ))
              )}
            </div>
            {pegadinhas.length > 0 ? (
              <div style={{ marginTop: 14, fontSize: 13, color: "var(--text-muted)" }}>
                {pegadinhas.length} pegadinha(s) catalogada(s) no seu caderno.
              </div>
            ) : null}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function QuestionsSessionView({
  questoes,
  respostas,
  edital,
  selectedCap,
  onSelectCap,
  writeDocumentFn,
  readOnlyPreview,
  onAnswerSaved,
  onAskTutor,
}) {
  const respMap = useMemo(
    () => new Map(respostas.map((r) => [r.qid || r.id, r])),
    [respostas]
  );

  const chapters = useMemo(() => {
    const set = new Set();
    for (const q of questoes) {
      if (q.cap) set.add(q.cap);
    }
    return Array.from(set).sort();
  }, [questoes]);

  const queue = useMemo(() => {
    if (selectedCap === "__CADERNO__") {
      return questoes.filter((q) => respMap.get(q.id)?.noCaderno);
    }
    if (selectedCap) {
      return questoes.filter((q) => q.cap === selectedCap);
    }
    return questoes.filter((q) => !String(q.cap || "").startsWith("SIM-"));
  }, [questoes, selectedCap, respMap]);

  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState("");

  useEffect(() => {
    setIndex(0);
    setChoice(null);
    setConfidence(null);
    setSubmitted(null);
    setSaveNote("");
  }, [selectedCap]);

  const current = queue[index] || null;
  const prevResp = current ? respMap.get(current.id) : null;

  async function handleConfirm() {
    if (!current || !choice) return;
    if (choice !== "B" && !confidence) return;
    setSaving(true);
    setSaveNote("");
    try {
      const result = await saveAnswerRecord({
        writeFn: writeDocumentFn,
        preview: readOnlyPreview,
        question: current,
        prev: prevResp || {},
        marked: choice,
        confidence,
      });
      setSubmitted(result);
      onAnswerSaved?.(current.id, result.record);
      if (result.readOnly) {
        setSaveNote("Prévia somente leitura: resposta avaliada localmente sem gravar no banco.");
      }
    } catch (err) {
      setSaveNote(err?.message || "Falha ao gravar resposta.");
    } finally {
      setSaving(false);
    }
  }

  function nextQuestion() {
    if (index + 1 < queue.length) {
      setIndex(index + 1);
      setChoice(null);
      setConfidence(null);
      setSubmitted(null);
      setSaveNote("");
    }
  }

  const editalTitle = useMemo(() => {
    if (!selectedCap || selectedCap === "__CADERNO__") return "";
    const match = edital.find(
      (t) => t.id === selectedCap || (Array.isArray(t.caps) && t.caps.includes(selectedCap))
    );
    return match?.titulo || match?.nome || "";
  }, [edital, selectedCap]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Panel style={{ padding: 18 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <span className="qb-overline">Treino Certo / Errado · Cebraspe</span>
            <h2 style={{ margin: "4px 0 0", fontFamily: "var(--font-heading)", fontSize: 22 }}>
              {selectedCap === "__CADERNO__"
                ? "Caderno de Erros"
                : editalTitle || selectedCap || "Todas as questões"}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <label htmlFor="qb-cap-select" style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Capítulo:
            </label>
            <select
              id="qb-cap-select"
              className="qb-input"
              style={{ width: "auto", minWidth: 220, minHeight: 38, padding: "6px 12px" }}
              value={selectedCap}
              onChange={(e) => onSelectCap(e.target.value)}
            >
              <option value="">Todos os capítulos ({questoes.length})</option>
              <option value="__CADERNO__">Caderno de erros</option>
              {chapters.map((cap) => (
                <option key={cap} value={cap}>
                  {cap}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Panel>

      {!current ? (
        <Panel style={{ padding: 32, textAlign: "center" }}>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            Nenhuma questão encontrada neste filtro.
          </p>
        </Panel>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Panel variant="ornate" style={{ padding: 26 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Badge tone="gold">
                  Item {index + 1} de {queue.length}
                </Badge>
                {current.cap ? <Badge tone="neutral">{current.cap}</Badge> : null}
                {current.origem ? <Badge tone="neutral">{current.origem}</Badge> : null}
                {prevResp?.noCaderno ? <Badge tone="attention">No caderno</Badge> : null}
              </div>
              <Button variant="ghost" size="sm" icon={HelpCircle} onClick={onAskTutor}>
                Tirar dúvida com Tutor
              </Button>
            </div>

            {current.contexto ? (
              <p
                style={{
                  margin: "0 0 14px",
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "var(--surface-sunken)",
                  borderLeft: "3px solid var(--qb-bronze)",
                  color: "var(--text-secondary)",
                  fontSize: 15,
                }}
              >
                {current.contexto}
              </p>
            ) : null}

            <p
              style={{
                margin: "0 0 22px",
                fontSize: 18,
                lineHeight: 1.65,
                color: "var(--qb-ivory)",
              }}
            >
              {current.enunciado || current.texto || current.assertiva}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
              <button
                type="button"
                className={`qb-choice ${
                  submitted
                    ? current.gabarito === "C"
                      ? "is-correct"
                      : choice === "C"
                        ? "is-incorrect"
                        : ""
                    : ""
                }`}
                aria-pressed={choice === "C"}
                disabled={Boolean(submitted)}
                onClick={() => setChoice("C")}
              >
                <span className="qb-choice__key">C</span>
                <span>Certo</span>
              </button>

              <button
                type="button"
                className={`qb-choice ${
                  submitted
                    ? current.gabarito === "E"
                      ? "is-correct"
                      : choice === "E"
                        ? "is-incorrect"
                        : ""
                    : ""
                }`}
                aria-pressed={choice === "E"}
                disabled={Boolean(submitted)}
                onClick={() => setChoice("E")}
              >
                <span className="qb-choice__key">E</span>
                <span>Errado</span>
              </button>

              <button
                type="button"
                className="qb-choice"
                style={{ flex: "0.7 1 160px" }}
                aria-pressed={choice === "B"}
                disabled={Boolean(submitted)}
                onClick={() => {
                  setChoice("B");
                  setConfidence(null);
                }}
              >
                <span className="qb-choice__key">—</span>
                <span>Deixar em branco</span>
              </button>
            </div>

            {!submitted ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  paddingTop: 14,
                  borderTop: "var(--border-hairline)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    Confiança antes do gabarito:
                  </span>
                  <div className="qb-seg" role="group" aria-label="Nível de confiança">
                    {[
                      { val: 1, label: "1 · Chute" },
                      { val: 2, label: "2 · Dúvida" },
                      { val: 3, label: "3 · Certeza" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        className="qb-seg__opt"
                        aria-pressed={confidence === opt.val}
                        disabled={choice === "B"}
                        onClick={() => setConfidence(opt.val)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="primary"
                  loading={saving}
                  disabled={!choice || (choice !== "B" && !confidence)}
                  onClick={handleConfirm}
                >
                  Confirmar e ver gabarito
                </Button>
              </div>
            ) : null}
          </Panel>

          {submitted ? (
            <Panel
              style={{
                padding: 24,
                borderColor: submitted.acertou
                  ? "var(--state-correct)"
                  : submitted.isBlank
                    ? "var(--state-attention)"
                    : "var(--state-incorrect)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {submitted.acertou ? (
                    <CheckCircle2 size={22} style={{ color: "var(--state-correct)" }} />
                  ) : (
                    <XCircle size={22} style={{ color: "var(--state-incorrect)" }} />
                  )}
                  <strong style={{ fontSize: 18 }}>
                    {submitted.acertou
                      ? "Você acertou!"
                      : submitted.isBlank
                        ? "Item deixado em branco"
                        : "Você errou este item"}
                  </strong>
                  <Badge tone={current.gabarito === "C" ? "correct" : "incorrect"}>
                    Gabarito: {current.gabarito === "C" ? "CERTO" : "ERRADO"}
                  </Badge>
                </div>

                <Button
                  variant="primary"
                  icon={ChevronRight}
                  disabled={index + 1 >= queue.length}
                  onClick={nextQuestion}
                >
                  {index + 1 >= queue.length ? "Fim da fila" : "Próxima questão"}
                </Button>
              </div>

              {current.comentario || current.justificativa ? (
                <p style={{ margin: "0 0 12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {current.comentario || current.justificativa}
                </p>
              ) : null}

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {current.mecanismo ? <Badge tone="gold">Mecanismo: {current.mecanismo}</Badge> : null}
                {current.fonte ? <Badge tone="neutral">Fonte: {current.fonte}</Badge> : null}
                <Badge tone="neutral">
                  Próxima revisão: {submitted.record.proxRevisao}
                </Badge>
              </div>

              {current.vacina ? (
                <p style={{ margin: "12px 0 0", fontSize: 14, color: "var(--qb-gold)" }}>
                  <strong>Vacina:</strong> {current.vacina}
                </p>
              ) : null}

              {saveNote ? (
                <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                  {saveNote}
                </p>
              ) : null}
            </Panel>
          ) : null}
        </div>
      )}
    </div>
  );
}

function FlashcardsView({ flashcards, correctFlashcardFn }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const card = flashcards[idx] || null;

  async function handleCheckWithAI() {
    if (!card || !userAnswer.trim() || !correctFlashcardFn) return;
    setAiLoading(true);
    setAiFeedback("");
    try {
      const res = await correctFlashcardFn({
        front: card.front,
        back: card.back,
        userAnswer: userAnswer.trim(),
      });
      setAiFeedback(
        typeof res === "string"
          ? res
          : res?.feedback || res?.avaliacao || JSON.stringify(res)
      );
      setFlipped(true);
    } catch (err) {
      setAiFeedback(err?.message || "Não foi possível consultar a correção por IA.");
    } finally {
      setAiLoading(false);
    }
  }

  function go(delta) {
    const next = (idx + delta + flashcards.length) % flashcards.length;
    setIdx(next);
    setFlipped(false);
    setUserAnswer("");
    setAiFeedback("");
  }

  if (!card) {
    return (
      <Panel style={{ padding: 32, textAlign: "center" }}>
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>
          Nenhum flashcard encontrado na coleção `revisao`.
        </p>
      </Panel>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <span className="qb-overline">Recuperação Ativa</span>
          <h2 style={{ margin: "4px 0 0", fontFamily: "var(--font-heading)", fontSize: 22 }}>
            Flashcards ({idx + 1} / {flashcards.length})
          </h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <IconButton icon={ChevronLeft} label="Cartão anterior" variant="outline" onClick={() => go(-1)} />
          <IconButton icon={ChevronRight} label="Próximo cartão" variant="outline" onClick={() => go(1)} />
        </div>
      </div>

      <div className="qb-flash" style={{ minHeight: 260 }}>
        <div className={`qb-flash__inner ${flipped ? "is-flipped" : ""}`} style={{ minHeight: 260 }}>
          <Panel
            variant="ornate"
            className="qb-flash__face"
            style={{ padding: 28, justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Badge tone="gold">{card.topicId}</Badge>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Frente</span>
            </div>
            <p style={{ fontSize: 20, lineHeight: 1.5, margin: "16px 0" }}>{card.front}</p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="secondary" icon={RotateCcw} onClick={() => setFlipped(true)}>
                Virar cartão
              </Button>
            </div>
          </Panel>

          <Panel
            className="qb-flash__face qb-flash__face--back"
            style={{
              padding: 28,
              justifyContent: "space-between",
              background: "var(--surface-sunken)",
              borderColor: "var(--qb-gold)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Badge tone="correct">Verso / Gabarito</Badge>
              {card.reference ? (
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{card.reference}</span>
              ) : null}
            </div>
            <p style={{ fontSize: 18, lineHeight: 1.6, margin: "16px 0", color: "var(--qb-ivory)" }}>
              {card.back}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <Button variant="ghost" icon={RotateCcw} onClick={() => setFlipped(false)}>
                Ver frente
              </Button>
              <Button variant="primary" icon={ChevronRight} onClick={() => go(1)}>
                Próximo cartão
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      <Panel style={{ padding: 20 }}>
        <label htmlFor="qb-flash-answer" className="qb-overline" style={{ display: "block", marginBottom: 8 }}>
          Escreva sua evocação antes de virar
        </label>
        <textarea
          id="qb-flash-answer"
          className="qb-input"
          rows={3}
          placeholder="Digite o que você lembra antes de conferir o verso..."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 10, flexWrap: "wrap" }}>
          <Button variant="ghost" onClick={() => setFlipped((v) => !v)}>
            {flipped ? "Ocultar resposta" : "Comparar com o verso"}
          </Button>
          {correctFlashcardFn ? (
            <Button
              variant="secondary"
              icon={Sparkles}
              loading={aiLoading}
              disabled={!userAnswer.trim()}
              onClick={handleCheckWithAI}
            >
              Corrigir com IA
            </Button>
          ) : null}
        </div>
        {aiFeedback ? (
          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 12,
              background: "var(--surface-sunken)",
              border: "var(--border-hairline)",
              fontSize: 14,
              color: "var(--text-secondary)",
            }}
          >
            {aiFeedback}
          </div>
        ) : null}
      </Panel>
    </div>
  );
}

function MindMapsView({ mindMaps }) {
  const [selectedMapIdx, setSelectedMapIdx] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);

  const currentMap = mindMaps[selectedMapIdx] || null;

  useEffect(() => {
    setSelectedNode(currentMap ? { label: currentMap.title, x: currentMap.explanation } : null);
  }, [selectedMapIdx, currentMap]);

  if (!currentMap) {
    return (
      <Panel style={{ padding: 32, textAlign: "center" }}>
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>
          Nenhum mapa mental encontrado na coleção `revisao`.
        </p>
      </Panel>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Panel style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <span className="qb-overline">Mapas Mentais Estruturados</span>
          <h2 style={{ margin: "4px 0 0", fontFamily: "var(--font-heading)", fontSize: 22 }}>
            {currentMap.title}
          </h2>
        </div>
        <select
          aria-label="Selecionar mapa mental"
          className="qb-input"
          style={{ width: "auto", minWidth: 240, minHeight: 38, padding: "6px 12px" }}
          value={selectedMapIdx}
          onChange={(e) => setSelectedMapIdx(Number(e.target.value))}
        >
          {mindMaps.map((m, i) => (
            <option key={m.id} value={i}>
              {m.title}
            </option>
          ))}
        </select>
      </Panel>

      <div className="qb-dash-grid">
        <Panel style={{ padding: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {currentMap.branches.map((branch, idx) => (
              <BranchItem
                key={branch.id || branch.label || branch.t || idx}
                node={branch}
                depth={0}
                onSelect={setSelectedNode}
              />
            ))}
          </div>
        </Panel>

        <Panel variant="ornate" style={{ padding: 22 }}>
          <span className="qb-overline">Explicação do Nó</span>
          <h3 style={{ margin: "8px 0 10px", fontFamily: "var(--font-heading)", fontSize: 20 }}>
            {selectedNode?.label || selectedNode?.t || selectedNode?.titulo || currentMap.title}
          </h3>
          <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.65 }}>
            {selectedNode?.x ||
              selectedNode?.explicacao ||
              "Selecione um ramo ou folha para visualizar a decodificação dos termos-chave."}
          </p>
        </Panel>
      </div>
    </div>
  );
}

function BranchItem({ node, depth, onSelect }) {
  const label = node.label || node.t || node.titulo || "Nó";
  const children = node.children || node.ramos || node.microtopicos || node.folhas || node.nos || [];

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <button
        type="button"
        className="qb-radial__row"
        style={{ minHeight: 44, padding: "8px 12px" }}
        onClick={() => onSelect({ label, x: node.x || node.explicacao || "" })}
      >
        <BookOpen size={15} style={{ color: "var(--qb-gold)", flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: depth === 0 ? 600 : 400 }}>{label}</span>
      </button>
      {Array.isArray(children) && children.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
          {children.map((child, idx) => (
            <BranchItem
              key={child.id || child.label || child.t || idx}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TutorDrawer({ open, onClose, askTutorFn, context }) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Olá! Sou o Tutor IA integrado ao seu Controle de Estudo. Como posso ajudar agora?",
    },
  ]);

  if (!open) return null;

  async function sendQuestion(e) {
    e?.preventDefault?.();
    const prompt = input.trim();
    if (!prompt || busy || !askTutorFn) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setBusy(true);
    try {
      const answer = await askTutorFn(prompt, context);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: answer || "Sem resposta do Tutor no momento." },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: err?.message || "Erro ao consultar o Tutor IA.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tutor IA"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: "var(--z-drawer)",
        background: "rgba(8, 10, 15, 0.65)",
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        className="qb-panel"
        style={{
          width: "min(440px, 100vw)",
          height: "100%",
          borderRadius: 0,
          borderLeft: "var(--border-ornament)",
          boxShadow: "var(--shadow-drawer)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "var(--border-hairline)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={18} style={{ color: "var(--qb-gold-bright)" }} />
            <strong style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}>
              Tutor IA
            </strong>
          </div>
          <IconButton icon={X} label="Fechar Tutor" onClick={onClose} />
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "88%",
                padding: "10px 14px",
                borderRadius: 14,
                background: m.role === "user" ? "var(--qb-navy-hover)" : "var(--surface-sunken)",
                border: "var(--border-hairline)",
                fontSize: 14,
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.text}
            </div>
          ))}
        </div>

        <form
          onSubmit={sendQuestion}
          style={{
            padding: 16,
            borderTop: "var(--border-hairline)",
            display: "flex",
            gap: 8,
          }}
        >
          <input
            type="text"
            className="qb-input"
            placeholder="Pergunte sobre um tópico, pegadinha ou revisão..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
          />
          <Button type="submit" variant="primary" loading={busy} icon={Send} disabled={!input.trim()}>
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
}
