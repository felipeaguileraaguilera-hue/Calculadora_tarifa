import { useState, useMemo, useCallback, useEffect } from "react";
import {
  UNIT_PRODUCTS_TO, BOX_PRODUCTS_TO, UNIT_PRODUCTS_VO, BOX_PRODUCTS_VO,
  DEFAULT_PARAMS, precioLitro, calcUnit, calcBox, roundedPrices, marginAnalysis
} from './engine';
import * as api from './api';
import TariffManager from './components/TariffManager';
import './styles.css';

if (!document.querySelector('link[data-at-font]')) {
  const fl = document.createElement("link");
  fl.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap";
  fl.rel = "stylesheet"; fl.setAttribute("data-at-font", "1"); document.head.appendChild(fl);
}

// ============================================================
// FORMATTER
// ============================================================
const fmt = (n, d = 2) => n != null ? n.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d }) + '€' : '—';
const fmtPct = (n) => n != null ? n.toFixed(1) + '%' : '—';

// ============================================================
// AUTH SCREEN
// ============================================================
function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Rellena todos los campos"); return; }
    setLoading(true); setError("");
    const { error: e } = await api.signIn(email, password);
    setLoading(false);
    if (e) setError("Email o contraseña incorrectos");
  };

  return (
    <div className="auth">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-m">AT</div>
          <div className="auth-logo-t">Aceites Tapia</div>
          <div className="auth-logo-s">Calculadora de Precios</div>
        </div>
        {error && <div className="auth-err">{error}</div>}
        <div className="fg"><label className="fl">Email</label><input className="fi" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" /></div>
        <div className="fg"><label className="fl">Contraseña</label><input className="fi" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
        <button className="bp" disabled={loading} onClick={handleLogin}>{loading ? "Cargando..." : "Entrar"}</button>
      </div>
    </div>
  );
}

// ============================================================
// PARAMETER EDITOR
// ============================================================
function ParamEditor({ params, onChange }) {
  const p = (key, label, suffix = '', step = 0.01) => (
    <div className="pe-row">
      <label className="pe-label">{label}</label>
      <div className="pe-input-wrap">
        <input className="pe-input" type="number" step={step} value={params[key]}
          onChange={e => onChange({ ...params, [key]: parseFloat(e.target.value) || 0 })} />
        {suffix && <span className="pe-suffix">{suffix}</span>}
      </div>
    </div>
  );

  const litroTO = precioLitro(params.poolred, params.dif_pr_to);
  const litroVO = precioLitro(params.poolred, params.dif_pr_vo);

  return (
    <div className="params-panel">
      <div className="params-section">
        <div className="ps-title">🫒 Precio Base Aceite</div>
        {p('poolred', 'PoolRed', '€/kg')}
        {p('dif_pr_to', 'Diferencial TO', '€/kg')}
        {p('dif_pr_vo', 'Diferencial VO', '€/kg')}
        <div className="pe-derived">
          <div>TO: <strong>{fmt(params.poolred + params.dif_pr_to)}</strong>/kg → <strong>{fmt(litroTO, 3)}</strong>/L</div>
          <div>VO: <strong>{fmt(params.poolred + params.dif_pr_vo)}</strong>/kg → <strong>{fmt(litroVO, 3)}</strong>/L</div>
        </div>
      </div>

      <div className="params-section">
        <div className="ps-title">📦 Costes Operativos</div>
        {p('coste_km', 'Coste por km', '€/km')}
        {p('mo_litro', 'Mano de obra', '€/L')}
      </div>

      <div className="params-section">
        <div className="ps-title">📊 Márgenes por Canal</div>
        <div className="margin-grid">
          {p('margen_tienda', '🏪 Tienda', '%', 0.005)}
          {p('margen_distrib', '🚛 Distribución', '%', 0.005)}
          {p('margen_dl2', '📦 DL2', '%', 0.005)}
          {p('margen_horeca', '🍽️ Horeca', '%', 0.005)}
          {p('margen_web', '🌐 Web', '%', 0.005)}
        </div>
      </div>

      <div className="params-section">
        <div className="ps-title">🏷️ Otros</div>
        {p('individ', 'Individualidad', '%', 0.01)}
        {p('iva_aceite', 'IVA Aceite', '%', 0.01)}
        {p('iva_na', 'IVA No Alimentario', '%', 0.01)}
      </div>
    </div>
  );
}

// ============================================================
// MATERIAL COST EDITOR
// ============================================================
function MaterialEditor({ unitProducts, onUpdate, label }) {
  return (
    <div className="mat-panel">
      <div className="ps-title">{label}</div>
      <div className="mat-table">
        <div className="mat-header">
          <span className="mat-col-name">Producto</span>
          <span className="mat-col">Envase</span>
          <span className="mat-col">Tapón</span>
          <span className="mat-col">Etiqueta</span>
          <span className="mat-col">Contra</span>
        </div>
        {unitProducts.map(prod => (
          <div key={prod.id} className="mat-row">
            <span className="mat-col-name">{prod.name}</span>
            {['envase', 'tapon', 'etiqueta', 'contra'].map(field => (
              <input key={field} className="mat-input" type="number" step="0.01"
                value={prod[field]} onChange={e => onUpdate(prod.id, field, parseFloat(e.target.value) || 0)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PRICE TABLE
// ============================================================
function PriceTable({ calculations, title, showCostDetail, setShowCostDetail }) {
  return (
    <div className="price-table-wrap">
      <div className="pt-header-row">
        <div className="pt-title">{title}</div>
        <button className="chip-btn" onClick={() => setShowCostDetail(!showCostDetail)}>
          {showCostDetail ? '📊 Ver precios' : '🔍 Ver costes'}
        </button>
      </div>

      <div className="pt-scroll">
        <table className="pt">
          <thead>
            <tr>
              <th className="pt-th-name">Producto</th>
              <th className="pt-th-vol">Vol (L)</th>
              {showCostDetail ? <>
                <th className="pt-th">Aceite</th>
                <th className="pt-th">Material</th>
                <th className="pt-th">M.O.</th>
                <th className="pt-th">Individ.</th>
                <th className="pt-th c-highlight">Coste Real</th>
              </> : <>
                <th className="pt-th c-tienda">🏪 Tienda</th>
                <th className="pt-th c-distrib">🚛 Distrib</th>
                <th className="pt-th c-dl2">📦 DL2</th>
                <th className="pt-th c-horeca">🍽️ Horeca</th>
                <th className="pt-th c-web">🌐 Web</th>
              </>}
            </tr>
          </thead>
          <tbody>
            {calculations.map(c => {
              const r = roundedPrices(c);
              return (
                <tr key={c.id} className={c.isBox ? 'pt-row-box' : 'pt-row-unit'}>
                  <td className="pt-td-name">
                    <div className="pt-prod-name">{c.name}</div>
                    {c.isBox && <div className="pt-prod-sub">{c.qty}× {c.unitName}</div>}
                  </td>
                  <td className="pt-td-vol">{c.vol}</td>
                  {showCostDetail ? <>
                    <td className="pt-td">{fmt(c.aceite)}</td>
                    <td className="pt-td">{fmt(c.coste_sa)}</td>
                    <td className="pt-td">{fmt(c.mo)}</td>
                    <td className="pt-td">{c.individ > 0 ? fmt(c.individ) : '—'}</td>
                    <td className="pt-td c-highlight"><strong>{fmt(c.coste_real)}</strong></td>
                  </> : <>
                    <td className="pt-td c-tienda">
                      <div className="pt-price">{r.tienda_r != null ? Math.round(r.tienda_r) + '€' : fmt(c.tienda)}</div>
                      <div className="pt-margin">{fmtPct(marginAnalysis(c.tienda, c.coste_real).pct)}</div>
                    </td>
                    <td className="pt-td c-distrib">
                      {c.distribucion != null ? <>
                        <div className="pt-price">{Math.round(r.distribucion_r) + '€'}</div>
                        <div className="pt-margin">{fmtPct(marginAnalysis(c.distribucion, c.coste_real).pct)}</div>
                      </> : '—'}
                    </td>
                    <td className="pt-td c-dl2">
                      {c.dl2 != null ? <>
                        <div className="pt-price">{Math.round(r.dl2_r) + '€'}</div>
                        <div className="pt-margin">{fmtPct(marginAnalysis(c.dl2, c.coste_real).pct)}</div>
                      </> : '—'}
                    </td>
                    <td className="pt-td c-horeca">
                      {c.horeca != null ? <>
                        <div className="pt-price">{Math.round(r.horeca_r) + '€'}</div>
                        <div className="pt-margin">{fmtPct(marginAnalysis(c.horeca, c.coste_real).pct)}</div>
                      </> : '—'}
                    </td>
                    <td className="pt-td c-web">
                      <div className="pt-price">{r.web_r != null ? Math.round(r.web_r) + '€' : fmt(c.web)}</div>
                      <div className="pt-margin">{fmtPct(marginAnalysis(c.web, c.coste_real).pct)}</div>
                    </td>
                  </>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// TARIFF SUMMARY (like Hoja2)
// ============================================================
function TariffSummary({ allCalcs, onSync }) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const boxCalcs = allCalcs.filter(c => c.isBox);

  const handleSync = async () => {
    if (!confirm('¿Sincronizar estas tarifas con la base de datos del portal HORECA?\n\nEsto actualizará los precios base de todos los productos.')) return;
    setSyncing(true);
    const result = await onSync(boxCalcs);
    setSyncResult(result);
    setSyncing(false);
    setTimeout(() => setSyncResult(null), 5000);
  };

  return (
    <div className="tariff-wrap">
      <div className="pt-header-row">
        <div className="pt-title">📋 Resumen de Tarifas</div>
        <button className="sync-btn" disabled={syncing} onClick={handleSync}>
          {syncing ? '⏳ Sincronizando...' : '🔄 Sincronizar con BBDD'}
        </button>
      </div>
      {syncResult && (
        <div className={`sync-result ${syncResult.errors?.length ? 'has-errors' : 'success'}`}>
          ✅ {syncResult.success} actualizados{syncResult.errors?.length > 0 && ` · ❌ ${syncResult.errors.length} errores`}
        </div>
      )}
      <div className="pt-scroll">
        <table className="pt tariff-table">
          <thead>
            <tr>
              <th className="pt-th-name">Producto</th>
              <th className="pt-th c-tienda">Tienda</th>
              <th className="pt-th c-distrib">Distribución</th>
              <th className="pt-th c-dl2">DL2</th>
              <th className="pt-th c-horeca">Horeca</th>
              <th className="pt-th c-web">Web</th>
            </tr>
          </thead>
          <tbody>
            {allCalcs.map(c => {
              const r = roundedPrices(c);
              return (
                <tr key={c.id} className={c.isBox ? 'pt-row-box' : 'pt-row-unit'}>
                  <td className="pt-td-name"><div className="pt-prod-name">{c.name}</div></td>
                  <td className="pt-td c-tienda"><strong>{r.tienda_r != null ? Math.round(r.tienda_r) : '—'}</strong></td>
                  <td className="pt-td c-distrib"><strong>{r.distribucion_r != null ? Math.round(r.distribucion_r) : '—'}</strong></td>
                  <td className="pt-td c-dl2"><strong>{r.dl2_r != null ? Math.round(r.dl2_r) : '—'}</strong></td>
                  <td className="pt-td c-horeca"><strong>{r.horeca_r != null ? Math.round(r.horeca_r) : '—'}</strong></td>
                  <td className="pt-td c-web"><strong>{r.web_r != null ? Math.round(r.web_r) : '—'}</strong></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// SIMULATOR — What-if analysis
// ============================================================
function Simulator({ params, unitProductsTO, unitProductsVO }) {
  const [simPoolred, setSimPoolred] = useState(params.poolred);
  const [showSim, setShowSim] = useState(false);

  const diffs = useMemo(() => {
    if (!showSim) return [];
    const results = [];
    
    const calcAll = (pr, unitProds, boxProds, dif, line) => {
      const litre = precioLitro(pr, dif);
      boxProds.forEach(bp => {
        const up = unitProds.find(u => u.id === bp.unitRef);
        if (!up) return;
        const calcOld = calcBox(bp, up, params, precioLitro(params.poolred, dif));
        const calcNew = calcBox(bp, up, params, litre);
        const rOld = roundedPrices(calcOld);
        const rNew = roundedPrices(calcNew);
        results.push({
          name: `${line} ${bp.name}`,
          horeca_old: rOld.horeca_r, horeca_new: rNew.horeca_r,
          tienda_old: rOld.tienda_r, tienda_new: rNew.tienda_r,
          coste_old: calcOld.coste_real, coste_new: calcNew.coste_real,
        });
      });
    };
    
    calcAll(simPoolred, unitProductsTO, BOX_PRODUCTS_TO, params.dif_pr_to, 'TO');
    calcAll(simPoolred, unitProductsVO, BOX_PRODUCTS_VO, params.dif_pr_vo, 'VO');
    return results;
  }, [simPoolred, showSim, params, unitProductsTO, unitProductsVO]);

  return (
    <div className="sim-panel">
      <div className="ps-title">🔮 Simulador de Escenarios</div>
      <div className="sim-input-row">
        <label className="pe-label">PoolRed simulado</label>
        <div className="pe-input-wrap">
          <input className="pe-input sim-input" type="number" step="0.05" value={simPoolred}
            onChange={e => setSimPoolred(parseFloat(e.target.value) || 0)} />
          <span className="pe-suffix">€/kg</span>
        </div>
        <button className="chip-btn" onClick={() => setShowSim(true)}>Simular</button>
      </div>
      <div className="sim-diff">
        Diferencia: <strong style={{ color: simPoolred > params.poolred ? '#C62828' : '#2E7D32' }}>
          {simPoolred > params.poolred ? '+' : ''}{fmt(simPoolred - params.poolred)}/kg
        </strong>
      </div>

      {showSim && diffs.length > 0 && (
        <div className="pt-scroll" style={{ marginTop: 8 }}>
          <table className="pt sim-table">
            <thead>
              <tr>
                <th className="pt-th-name">Producto</th>
                <th className="pt-th">Coste actual</th>
                <th className="pt-th">Coste nuevo</th>
                <th className="pt-th c-horeca">Horeca actual</th>
                <th className="pt-th c-horeca">Horeca nuevo</th>
                <th className="pt-th">Δ</th>
              </tr>
            </thead>
            <tbody>
              {diffs.map((d, i) => {
                const delta = (d.horeca_new || 0) - (d.horeca_old || 0);
                return (
                  <tr key={i}>
                    <td className="pt-td-name"><div className="pt-prod-name">{d.name}</div></td>
                    <td className="pt-td">{fmt(d.coste_old)}</td>
                    <td className="pt-td">{fmt(d.coste_new)}</td>
                    <td className="pt-td c-horeca">{d.horeca_old ? Math.round(d.horeca_old) + '€' : '—'}</td>
                    <td className="pt-td c-horeca"><strong>{d.horeca_new ? Math.round(d.horeca_new) + '€' : '—'}</strong></td>
                    <td className="pt-td" style={{ color: delta > 0 ? '#C62828' : delta < 0 ? '#2E7D32' : '#888' }}>
                      <strong>{delta > 0 ? '+' : ''}{delta ? Math.round(delta) + '€' : '='}</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("to");
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [unitProductsTO, setUnitProductsTO] = useState(UNIT_PRODUCTS_TO.map(p => ({ ...p })));
  const [unitProductsVO, setUnitProductsVO] = useState(UNIT_PRODUCTS_VO.map(p => ({ ...p })));
  const [showCostTO, setShowCostTO] = useState(false);
  const [showCostVO, setShowCostVO] = useState(false);

  useEffect(() => {
    api.getSession().then(s => { setSession(s); setAuthLoading(false); });
    const { data: { subscription } } = api.onAuthChange((_ev, s) => { setSession(s); if (!s) setProfile(null); });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    api.getClientProfile(session.user.id).then(({ data }) => {
      if (data && data.role === 'admin') setProfile(data);
      else { alert('Solo administradores pueden acceder'); api.signOut(); }
    });
  }, [session]);

  // Update unit product material costs
  const updateMaterial = useCallback((setter) => (prodId, field, value) => {
    setter(prev => prev.map(p => p.id === prodId ? { ...p, [field]: value } : p));
  }, []);

  // Calculate all products
  const calcsTO = useMemo(() => {
    const litro = precioLitro(params.poolred, params.dif_pr_to);
    const results = [];
    for (const up of unitProductsTO) {
      results.push(calcUnit(up, params, litro));
      const boxes = BOX_PRODUCTS_TO.filter(b => b.unitRef === up.id);
      boxes.forEach(bp => results.push(calcBox(bp, up, params, litro)));
    }
    return results;
  }, [params, unitProductsTO]);

  const calcsVO = useMemo(() => {
    const litro = precioLitro(params.poolred, params.dif_pr_vo);
    const results = [];
    for (const up of unitProductsVO) {
      results.push(calcUnit(up, params, litro));
      const boxes = BOX_PRODUCTS_VO.filter(b => b.unitRef === up.id);
      boxes.forEach(bp => results.push(calcBox(bp, up, params, litro)));
    }
    return results;
  }, [params, unitProductsVO]);

  const allCalcs = useMemo(() => [...calcsTO, ...calcsVO], [calcsTO, calcsVO]);

  const handleSync = async (boxCalcs) => {
    // For now, sync Horeca prices as base_price in products table
    const channelPrices = [];
    boxCalcs.forEach(c => {
      ['tienda', 'distribucion', 'dl2', 'horeca', 'web'].forEach(ch => {
        if (c[ch] != null) {
          const sinIva = Math.round(c[ch] / 1.04 * 100) / 100;
          channelPrices.push({ product_id: c.id, channel: ch, price_sin_iva: sinIva });
        }
      });
    });
    return await api.syncDistributorPrices(channelPrices);
  };

  if (authLoading) return <div className="app"><div className="loading"><div className="loading-spin" /><p>Cargando...</p></div></div>;
  if (!session) return <AuthScreen />;
  if (!profile) return <div className="app"><div className="loading"><div className="loading-spin" /><p>Verificando acceso...</p></div></div>;

  return (
    <div className="app">
      <div className="hdr">
        <div className="hdr-top">
          <div className="logo-a">
            <div className="logo-m">AT</div>
            <div><div className="logo-t">Aceites Tapia</div><div className="logo-s">Calculadora de Precios</div></div>
          </div>
          <button className="logout-btn-sm" onClick={() => api.signOut()}>Salir</button>
        </div>
        <div className="nav">
          <button className={"nb " + (tab === "to" ? "on" : "")} onClick={() => setTab("to")}>🫒 Tapia Original</button>
          <button className={"nb " + (tab === "vo" ? "on" : "")} onClick={() => setTab("vo")}>🌿 Verde Oleum</button>
          <button className={"nb " + (tab === "tariff" ? "on" : "")} onClick={() => setTab("tariff")}>📋 Tarifas</button>
          <button className={"nb " + (tab === "history" ? "on" : "")} onClick={() => setTab("history")}>📚 Histórico</button>
          <button className={"nb " + (tab === "sim" ? "on" : "")} onClick={() => setTab("sim")}>🔮 Simulador</button>
          <button className={"nb " + (tab === "params" ? "on" : "")} onClick={() => setTab("params")}>⚙️ Parámetros</button>
          <button className={"nb " + (tab === "mats" ? "on" : "")} onClick={() => setTab("mats")}>📦 Materiales</button>
        </div>
      </div>

      <div className="main">
        {tab === "to" && (
          <PriceTable calculations={calcsTO} title="🫒 Tapia Original — Precios"
            showCostDetail={showCostTO} setShowCostDetail={setShowCostTO} />
        )}

        {tab === "vo" && (
          <PriceTable calculations={calcsVO} title="🌿 Verde Oleum — Precios"
            showCostDetail={showCostVO} setShowCostDetail={setShowCostVO} />
        )}

        {tab === "tariff" && (
          <TariffSummary allCalcs={allCalcs} onSync={handleSync} />
        )}

        {tab === "history" && (
          <TariffManager
            currentCalcs={allCalcs}
            currentParams={params}
            materialCosts={[...unitProductsTO, ...unitProductsVO].map(p => ({ id: p.id, envase: p.envase, tapon: p.tapon, etiqueta: p.etiqueta, contra: p.contra }))}
            clientId={profile?.id}
          />
        )}

        {tab === "sim" && (
          <Simulator params={params} unitProductsTO={unitProductsTO} unitProductsVO={unitProductsVO} />
        )}

        {tab === "params" && (
          <ParamEditor params={params} onChange={setParams} />
        )}

        {tab === "mats" && <>
          <MaterialEditor unitProducts={unitProductsTO} onUpdate={updateMaterial(setUnitProductsTO)} label="🫒 Materiales — Tapia Original" />
          <MaterialEditor unitProducts={unitProductsVO} onUpdate={updateMaterial(setUnitProductsVO)} label="🌿 Materiales — Verde Oleum" />
        </>}
      </div>
    </div>
  );
}
