"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Platform = { id: number; name: string; series_count?: number };
type Series = {
  id: number;
  name: string;
  platform_id: number;
  platform_name?: string;
  ratings_count?: number;
};
type Rating = {
  id: number;
  platform_id: number;
  platform_name?: string;
  series_id: number;
  series_name?: string;
  score: number;
  observation: string;
};
type Section = "series" | "platforms" | "ratings";
type RecordItem = Platform | Series | Rating;

const sectionLabels: Record<Section, string> = {
  series: "Series",
  platforms: "Plataformas",
  ratings: "Valoraciones",
};
const singularLabels: Record<Section, string> = {
  series: "serie",
  platforms: "plataforma",
  ratings: "valoración",
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Ocurrió un error inesperado.");
  return result.data as T;
}

export default function Home() {
  const [section, setSection] = useState<Section>("series");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<RecordItem | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [platformData, seriesData, ratingData] = await Promise.all([
        request<Platform[]>("/api/platforms"),
        request<Series[]>("/api/series"),
        request<Rating[]>("/api/ratings"),
      ]);
      setPlatforms(platformData);
      setSeries(seriesData);
      setRatings(ratingData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const counts = useMemo(
    () => ({ series: series.length, platforms: platforms.length, ratings: ratings.length }),
    [platforms.length, ratings.length, series.length],
  );

  function startCreate() {
    setEditing(null);
    setError("");
    setNotice("");
  }

  function startEdit(item: RecordItem) {
    setEditing(item);
    setError("");
    setNotice("");
    document.getElementById("editor")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;
    const payload = Object.fromEntries(formData.entries());
    const id = editing?.id;
    const url = id ? `/api/${section}/${id}` : `/api/${section}`;

    setSaving(true);
    setError("");
    setNotice("");
    try {
      await request(url, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setNotice(`${singularLabels[section]} ${id ? "actualizada" : "creada"} correctamente.`);
      setEditing(null);
      form.reset();
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el registro.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(item: RecordItem) {
    const label = "score" in item ? "esta valoración" : "este registro";
    if (!window.confirm(`¿Seguro que deseas eliminar ${label}?`)) return;
    setError("");
    setNotice("");
    try {
      await request(`/api/${section}/${item.id}`, { method: "DELETE" });
      setNotice("Registro eliminado correctamente.");
      if (editing?.id === item.id) setEditing(null);
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar el registro.");
    }
  }

  const activeItems: RecordItem[] =
    section === "series" ? series : section === "platforms" ? platforms : ratings;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Series, inicio">
          <span className="brand-mark">S</span>
          <span>serie<span className="brand-light">.log</span></span>
        </Link>
        <div className="sidebar-label">BIBLIOTECA</div>
        <nav className="main-nav" aria-label="Secciones">
          {(["series", "platforms", "ratings"] as Section[]).map((item) => (
            <button
              className={`nav-item ${section === item ? "active" : ""}`}
              key={item}
              onClick={() => {
                setSection(item);
                startCreate();
              }}
            >
              <span className={`nav-icon ${item}`} aria-hidden="true">
                {item === "series" ? "▤" : item === "platforms" ? "▣" : "✳"}
              </span>
              <span>{sectionLabels[item]}</span>
              <span className="nav-count">{counts[item]}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="status-dot" />
          <span>Tu catálogo, a tu manera</span>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="breadcrumb">Mi biblioteca <span>/</span> {sectionLabels[section]}</div>
          <div className="topbar-right">
            <span className="cloud-status">Neon PostgreSQL</span>
            <div className="avatar">S</div>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">TU ESPACIO PERSONAL</div>
              <h1>{sectionLabels[section]}<span className="heading-period">.</span></h1>
              <p className="subtitle">
                {section === "series" && "Todas las historias que estás siguiendo, reunidas en un solo lugar."}
                {section === "platforms" && "Organiza los servicios donde encuentras tus series favoritas."}
                {section === "ratings" && "Guarda lo que piensas de cada serie, episodio a episodio."}
              </p>
            </div>
            <div className="total-pill"><span>{counts[section]}</span> {counts[section] === 1 ? "registro" : "registros"}</div>
          </div>

          <div className="stats-row">
            <div className="stat-card"><span className="stat-icon violet">▤</span><div><span className="stat-label">SERIES</span><strong>{counts.series}</strong></div></div>
            <div className="stat-card"><span className="stat-icon coral">▣</span><div><span className="stat-label">PLATAFORMAS</span><strong>{counts.platforms}</strong></div></div>
            <div className="stat-card"><span className="stat-icon gold">✳</span><div><span className="stat-label">VALORACIONES</span><strong>{counts.ratings}</strong></div></div>
          </div>

          {error && <div className="alert error" role="alert">{error}</div>}
          {notice && <div className="alert success" role="status">{notice}</div>}

          <div className="section-grid">
            <section className="panel list-panel">
              <div className="panel-heading">
                <div><h2>{sectionLabels[section]} guardadas</h2><p>Tu colección personal</p></div>
                <button className="button primary compact" onClick={startCreate}>＋ <span>Agregar</span></button>
              </div>
              {loading ? (
                <div className="empty-state"><span className="loading-spinner" /> Cargando tu biblioteca...</div>
              ) : activeItems.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-art">{section === "series" ? "▤" : section === "platforms" ? "▣" : "✳"}</span>
                  <strong>Aún no hay {sectionLabels[section].toLowerCase()}</strong>
                  <span>Agrega tu primer registro para empezar.</span>
                  <button className="button text-button" onClick={startCreate}>＋ Agregar {sectionLabels[section].toLowerCase()}</button>
                </div>
              ) : (
                <div className="record-list">
                  {activeItems.map((item) => (
                    <RecordRow
                      key={item.id}
                      item={item}
                      section={section}
                      onEdit={() => startEdit(item)}
                      onDelete={() => void deleteRecord(item)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="panel editor-panel" id="editor">
              <div className="panel-heading editor-heading">
                <div><div className="form-kicker">{editing ? "EDITAR REGISTRO" : "NUEVO REGISTRO"}</div><h2>{editing ? "Actualizar" : "Agregar"} {singularLabels[section]}</h2></div>
                {editing && <button className="close-button" aria-label="Cancelar edición" onClick={startCreate}>×</button>}
              </div>
              {section === "series" && (
                <form key={editing?.id ?? "new-series"} className="record-form" onSubmit={saveRecord}>
                  <label htmlFor="series-name">Nombre de la serie</label>
                  <input id="series-name" name="name" placeholder="Ej. The Bear" defaultValue={editing && "name" in editing ? editing.name : ""} maxLength={150} required />
                  <label htmlFor="series-platform">Plataforma</label>
                  <select id="series-platform" name="platform_id" defaultValue={editing && "platform_id" in editing ? editing.platform_id : ""} required>
                    <option value="" disabled>Selecciona una plataforma</option>
                    {platforms.map((platform) => <option key={platform.id} value={platform.id}>{platform.name}</option>)}
                  </select>
                  {platforms.length === 0 && <p className="field-hint">Primero agrega una plataforma para poder registrar series.</p>}
                  <SubmitButton saving={saving} editing={Boolean(editing)} disabled={platforms.length === 0} />
                </form>
              )}
              {section === "platforms" && (
                <form key={editing?.id ?? "new-platform"} className="record-form" onSubmit={saveRecord}>
                  <label htmlFor="platform-name">Nombre de la plataforma</label>
                  <input id="platform-name" name="name" placeholder="Ej. Netflix" defaultValue={editing && "name" in editing ? editing.name : ""} maxLength={100} required />
                  <p className="field-hint">Escribe el nombre del servicio de streaming.</p>
                  <SubmitButton saving={saving} editing={Boolean(editing)} />
                </form>
              )}
              {section === "ratings" && (
                <RatingForm
                  key={editing?.id ?? "new-rating"}
                  editing={editing && "score" in editing ? editing : null}
                  platforms={platforms}
                  series={series}
                  saving={saving}
                  onSubmit={saveRecord}
                />
              )}
              <div className="form-footnote"><span>✦</span> Tu catálogo se guarda de forma segura en la nube.</div>
            </section>
          </div>
          <footer className="page-footer"><span>serie.log</span><span>Un hogar para tus historias.</span></footer>
        </div>
      </section>
    </main>
  );
}

function SubmitButton({ saving, editing, disabled = false }: { saving: boolean; editing: boolean; disabled?: boolean }) {
  return (
    <button className="button primary submit-button" type="submit" disabled={saving || disabled}>
      {saving ? "Guardando..." : editing ? "Guardar cambios" : "Agregar al catálogo"}
      {!saving && <span aria-hidden="true">→</span>}
    </button>
  );
}

function RatingForm({
  editing,
  platforms,
  series,
  saving,
  onSubmit,
}: {
  editing: Rating | null;
  platforms: Platform[];
  series: Series[];
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [platformId, setPlatformId] = useState(String(editing?.platform_id ?? ""));
  const filteredSeries = series.filter((item) => String(item.platform_id) === platformId);

  return (
    <form className="record-form" onSubmit={onSubmit}>
      <label htmlFor="rating-platform">Plataforma</label>
      <select id="rating-platform" name="platform_id" value={platformId} onChange={(event) => setPlatformId(event.target.value)} required>
        <option value="" disabled>Selecciona una plataforma</option>
        {platforms.map((platform) => <option key={platform.id} value={platform.id}>{platform.name}</option>)}
      </select>
      <label htmlFor="rating-series">Serie</label>
      <select key={platformId} id="rating-series" name="series_id" defaultValue={editing?.series_id ?? ""} required disabled={!platformId}>
        <option value="" disabled>{platformId ? "Selecciona una serie" : "Selecciona primero una plataforma"}</option>
        {filteredSeries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      {platformId && filteredSeries.length === 0 && <p className="field-hint">No hay series en esta plataforma todavía.</p>}
      <label htmlFor="rating-score">Puntaje <span className="label-note">· del 1 al 10</span></label>
      <div className="score-control">
        <input id="rating-score" type="range" name="score" min="1" max="10" defaultValue={editing?.score ?? 8} onChange={(event) => {
          const output = document.getElementById("score-output");
          if (output) output.textContent = event.currentTarget.value;
        }} />
        <output id="score-output">{editing?.score ?? 8}</output>
      </div>
      <label htmlFor="rating-observation">Observación</label>
      <textarea id="rating-observation" name="observation" placeholder="¿Qué te pareció? Escribe una nota..." defaultValue={editing?.observation ?? ""} maxLength={2000} rows={3} required />
      <SubmitButton saving={saving} editing={Boolean(editing)} disabled={platforms.length === 0 || filteredSeries.length === 0} />
    </form>
  );
}

function RecordRow({
  item,
  section,
  onEdit,
  onDelete,
}: {
  item: RecordItem;
  section: Section;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="record-row">
      <div className={`record-avatar ${section}`}>
        {section === "ratings" && "score" in item ? `${item.score}` : section === "platforms" ? "▣" : "▤"}
      </div>
      <div className="record-main">
        <strong className="record-title">
          {"series_name" in item
            ? item.series_name
            : "name" in item
              ? item.name
              : ""}
        </strong>
        <span className="record-meta">
          {section === "series" && "platform_name" in item ? item.platform_name : null}
          {section === "platforms" && "series_count" in item ? `${item.series_count} ${item.series_count === 1 ? "serie" : "series"}` : null}
          {section === "ratings" && "platform_name" in item && "score" in item ? `${item.platform_name} · ${item.score}/10` : null}
        </span>
        {section === "ratings" && "observation" in item && <span className="record-observation">{item.observation}</span>}
      </div>
      <div className="record-actions">
        <button className="icon-button" onClick={onEdit} aria-label="Editar registro" title="Editar">✎</button>
        <button className="icon-button delete" onClick={onDelete} aria-label="Eliminar registro" title="Eliminar">⌫</button>
      </div>
    </article>
  );
}
