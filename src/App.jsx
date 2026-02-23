import { useState, useMemo, useCallback, useEffect } from "react";
import {
  UNIT_PRODUCTS_TO, BOX_PRODUCTS_TO, UNIT_PRODUCTS_VO, BOX_PRODUCTS_VO,
  UNIT_PRODUCTS_DL, BOX_PRODUCTS_DL,
  DEFAULT_PARAMS, precioLitro, calcUnit, calcBox, roundedPrices, marginAnalysis
} from './engine';
import * as api from './api';
import TariffManager from './components/TariffManager';
import TariffViewer from './components/TariffViewer';
import './styles.css';

if (!document.querySelector('link[data-at-font]')) {
  const fl = document.createElement("link");
  fl.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap";
  fl.rel = "stylesheet"; fl.setAttribute("data-at-font", "1"); document.head.appendChild(fl);
}

const fmt = (n, d = 2) => n != null ? n.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d }) + '€' : '—';
const fmtPct = (n) => n != null ? n.toFixed(1) + '%' : '—';

// ============================================================
// AUTH
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
// INLINE PARAM INPUT
// ============================================================
function PI({ value, onChange, suffix = '', step = 0.01, width = 72 }) {
  return (
    <span className="pe-input-wrap">
      <input className="pe-input" type="number" step={step} value={value}
        style={{ width }} onChange={e => onChange(parseFloat(e.target.value) || 0)} />
      {suffix && <span className="pe-suffix">{suffix}</span>}
    </span>
  );
}

// ============================================================
// CALCULATOR TAB — Params + Live Results + Save
// ============================================================
function CalculatorTab({ params, setParams, calcsTO, calcsVO, calcsDL, allCalcs, unitProductsTO, unitProductsVO, unitProductsDL, onSave, productImages }) {
  const [showCosts, setShowCosts] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [channelNames, setChannelNames] = useState({ tienda: 'Tienda', distribucion: 'Distribución', dl2: 'DL2', horeca: 'Horeca', web: 'Web' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const litroTO = precioLitro(params.poolred, params.dif_pr_to);
  const litroVO = precioLitro(params.poolred, params.dif_pr_vo);
  const litroDL = precioLitro(params.poolred, params.dif_pr_dl);

  const handleSave = async () => {
    if (!saveName.trim()) { alert('Indica un nombre para la tarifa'); return; }
    setSaving(true);
    await onSave(saveName, saveNotes, channelNames);
    setSaving(false);
    setToast('✅ Tarifa guardada como borrador');
    setSaveName(''); setSaveNotes('');
    setTimeout(() => setToast(null), 3000);
  };

  const renderTable = (calcs, title, icon) => (
    <div className="calc-section">
      <div className="cs-title">{icon} {title}</div>
      <div className="pt-scroll">
        <table className="pt">
          <thead>
            <tr>
              <th className="pt-th-name">Producto</th>
              <th className="pt-th-vol">L</th>
              {showCosts ? <>
                <th className="pt-th">Aceite</th><th className="pt-th">Material</th>
                <th className="pt-th">M.O.</th><th className="pt-th c-highlight">Coste</th>
              </> : <>
                <th className="pt-th c-tienda">{channelNames.tienda}</th>
                <th className="pt-th c-distrib">{channelNames.distribucion}</th>
                <th className="pt-th c-dl2">{channelNames.dl2}</th>
                <th className="pt-th c-horeca">{channelNames.horeca}</th>
                <th className="pt-th c-web">{channelNames.web}</th>
              </>}
            </tr>
          </thead>
          <tbody>
            {calcs.map(c => {
              const r = roundedPrices(c);
              return (
                <tr key={c.id} className={c.isBox ? 'pt-row-box' : 'pt-row-unit'}>
                  <td className="pt-td-name">
                    <div className="pt-prod-name">{c.name}</div>
                    {c.isBox && <div className="pt-prod-sub">{c.qty}× {c.unitName}</div>}
                  </td>
                  <td className="pt-td-vol">{c.vol}</td>
                  {showCosts ? <>
                    <td className="pt-td">{fmt(c.aceite)}</td>
                    <td className="pt-td">{fmt(c.coste_sa)}</td>
                    <td className="pt-td">{fmt(c.mo)}</td>
                    <td className="pt-td c-highlight"><strong>{fmt(c.coste_real)}</strong></td>
                  </> : <>
                    <td className="pt-td c-tienda">
                      <div className="pt-price">{r.tienda_r != null ? Math.round(r.tienda_r) + '€' : fmt(c.tienda)}</div>
                      {c.isBox && <div className="pt-margin">{fmtPct(marginAnalysis(c.tienda, c.coste_real).pct)}</div>}
                    </td>
                    <td className="pt-td c-distrib">
                      {c.distribucion != null ? <><div className="pt-price">{Math.round(r.distribucion_r) + '€'}</div><div className="pt-margin">{fmtPct(marginAnalysis(c.distribucion, c.coste_real).pct)}</div></> : '—'}
                    </td>
                    <td className="pt-td c-dl2">
                      {c.dl2 != null ? <><div className="pt-price">{Math.round(r.dl2_r) + '€'}</div><div className="pt-margin">{fmtPct(marginAnalysis(c.dl2, c.coste_real).pct)}</div></> : '—'}
                    </td>
                    <td className="pt-td c-horeca">
                      {c.horeca != null ? <><div className="pt-price">{Math.round(r.horeca_r) + '€'}</div><div className="pt-margin">{fmtPct(marginAnalysis(c.horeca, c.coste_real).pct)}</div></> : '—'}
                    </td>
                    <td className="pt-td c-web">
                      <div className="pt-price">{r.web_r != null ? Math.round(r.web_r) + '€' : fmt(c.web)}</div>
                      {c.isBox && <div className="pt-margin">{fmtPct(marginAnalysis(c.web, c.coste_real).pct)}</div>}
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

  return (
    <div>
      {/* Global params bar */}
      <div className="params-bar">
        <div className="pb-group">
          <span className="pb-label">PoolRed</span>
          <PI value={params.poolred} onChange={v => setParams({ ...params, poolred: v })} suffix="€/kg" width={65} />
        </div>
        <div className="pb-group">
          <span className="pb-label">Dif. TO</span>
          <PI value={params.dif_pr_to} onChange={v => setParams({ ...params, dif_pr_to: v })} suffix="€" width={55} />
        </div>
        <div className="pb-group">
          <span className="pb-label">Dif. VO</span>
          <PI value={params.dif_pr_vo} onChange={v => setParams({ ...params, dif_pr_vo: v })} suffix="€" width={55} />
        </div>
        <div className="pb-group">
          <span className="pb-label">Dif. DL</span>
          <PI value={params.dif_pr_dl} onChange={v => setParams({ ...params, dif_pr_dl: v })} suffix="€" width={55} />
        </div>
        <div className="pb-derived">
          TO: <strong>{fmt(litroTO, 3)}/L</strong> · VO: <strong>{fmt(litroVO, 3)}/L</strong> · DL: <strong>{fmt(litroDL, 3)}/L</strong>
        </div>
      </div>

      {/* Margins & operational costs */}
      <details className="params-detail">
        <summary className="params-summary">⚙️ Márgenes y costes operativos</summary>
        <div className="params-grid">
          <div className="pg-col">
            <div className="pg-title">Márgenes</div>
            <div className="pe-row"><span className="pe-label">{channelNames.tienda}</span><PI value={params.margen_tienda} onChange={v => setParams({...params, margen_tienda: v})} suffix="%" step={0.005} /></div>
            <div className="pe-row"><span className="pe-label">{channelNames.distribucion}</span><PI value={params.margen_distrib} onChange={v => setParams({...params, margen_distrib: v})} suffix="%" step={0.005} /></div>
            <div className="pe-row"><span className="pe-label">{channelNames.dl2}</span><PI value={params.margen_dl2} onChange={v => setParams({...params, margen_dl2: v})} suffix="%" step={0.005} /></div>
            <div className="pe-row"><span className="pe-label">{channelNames.horeca}</span><PI value={params.margen_horeca} onChange={v => setParams({...params, margen_horeca: v})} suffix="%" step={0.005} /></div>
            <div className="pe-row"><span className="pe-label">{channelNames.web}</span><PI value={params.margen_web} onChange={v => setParams({...params, margen_web: v})} suffix="%" step={0.005} /></div>
          </div>
          <div className="pg-col">
            <div className="pg-title">Operativos</div>
            <div className="pe-row"><span className="pe-label">Coste km</span><PI value={params.coste_km} onChange={v => setParams({...params, coste_km: v})} suffix="€/km" /></div>
            <div className="pe-row"><span className="pe-label">Mano obra</span><PI value={params.mo_litro} onChange={v => setParams({...params, mo_litro: v})} suffix="€/L" /></div>
            <div className="pe-row"><span className="pe-label">Individualidad</span><PI value={params.individ} onChange={v => setParams({...params, individ: v})} suffix="%" /></div>
            <div className="pe-row"><span className="pe-label">IVA aceite</span><PI value={params.iva_aceite} onChange={v => setParams({...params, iva_aceite: v})} suffix="%" /></div>
            <div className="pe-row"><span className="pe-label">IVA N/A</span><PI value={params.iva_na} onChange={v => setParams({...params, iva_na: v})} suffix="%" /></div>
          </div>
          <div className="pg-col">
            <div className="pg-title">Nombres de canal</div>
            {Object.entries(channelNames).map(([k, v]) => (
              <div key={k} className="pe-row">
                <span className="pe-label">{k}</span>
                <input className="pe-input" style={{ width: 100 }} value={v} onChange={e => setChannelNames({...channelNames, [k]: e.target.value})} />
              </div>
            ))}
          </div>
        </div>
      </details>

      {/* Toggle costs/prices */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
        <button className="chip-btn" onClick={() => setShowCosts(!showCosts)}>
          {showCosts ? '📊 Ver precios' : '🔍 Ver costes'}
        </button>
      </div>

      {/* Product tables */}
      {renderTable(calcsTO, 'Tapia Original', '🫒')}
      {renderTable(calcsVO, 'Verde Oleum', '🌿')}
      {calcsDL.length > 0 && renderTable(calcsDL, 'Delirium', '✨')}

      {/* Save tariff */}
      <div className="save-bar">
        <div className="save-bar-title">💾 Guardar esta tarifa</div>
        <div className="save-bar-row">
          <input className="fi" value={saveName} onChange={e => setSaveName(e.target.value)}
            placeholder="Nombre (ej: Tarifa Primavera 2026)" style={{ flex: 1 }} />
          <button className="sync-btn" disabled={saving || !saveName.trim()} onClick={handleSave}>
            {saving ? '⏳ Guardando...' : '💾 Guardar borrador'}
          </button>
        </div>
        <textarea className="fi" value={saveNotes} onChange={e => setSaveNotes(e.target.value)}
          placeholder="Notas opcionales..." style={{ minHeight: 36, marginTop: 6 }} />
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

// ============================================================
// MATERIALS TAB
// ============================================================
function MaterialsTab({ unitProductsTO, setUnitProductsTO, unitProductsVO, setUnitProductsVO, unitProductsDL, setUnitProductsDL, productImages, setProductImages }) {
  const [uploading, setUploading] = useState(null);
  const [toast, setToast] = useState(null);

  const updateMat = (setter) => (prodId, field, value) => {
    setter(prev => prev.map(p => p.id === prodId ? { ...p, [field]: value } : p));
  };

  const handleUpload = async (prodId, file) => {
    if (!file) return;
    setUploading(prodId);
    try {
      const { url, error } = await api.uploadProductImage(prodId, file);
      if (error) { alert('Error: ' + error); setUploading(null); return; }
      setProductImages(prev => ({ ...prev, [prodId]: url }));
      setToast('✅ Imagen subida');
      setTimeout(() => setToast(null), 2000);
    } catch (e) { alert('Error: ' + e.message); }
    setUploading(null);
  };

  const renderGroup = (prods, setter, title, icon) => (
    <div className="mat-panel">
      <div className="ps-title">{icon} {title}</div>
      <div className="mat-table">
        <div className="mat-header">
          <span className="mat-col-photo">Foto</span>
          <span className="mat-col-name">Producto</span>
          <span className="mat-col">Envase</span>
          <span className="mat-col">Tapón</span>
          <span className="mat-col">Etiqueta</span>
          <span className="mat-col">Contra</span>
        </div>
        {prods.map(prod => (
          <div key={prod.id} className="mat-row">
            <div className="mat-col-photo">
              {productImages[prod.id] ? (
                <img src={productImages[prod.id]} alt={prod.name} className="mat-thumb"
                  onClick={() => document.getElementById('upload-' + prod.id)?.click()} />
              ) : (
                <button className="mat-upload-btn"
                  onClick={() => document.getElementById('upload-' + prod.id)?.click()}>
                  {uploading === prod.id ? '⏳' : '📷'}
                </button>
              )}
              <input type="file" accept="image/*" id={'upload-' + prod.id} style={{ display: 'none' }}
                onChange={e => handleUpload(prod.id, e.target.files[0])} />
            </div>
            <span className="mat-col-name">{prod.name}</span>
            {['envase', 'tapon', 'etiqueta', 'contra'].map(field => (
              <input key={field} className="mat-input" type="number" step="0.01"
                value={prod[field]} onChange={e => updateMat(setter)(prod.id, field, parseFloat(e.target.value) || 0)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {renderGroup(unitProductsTO, setUnitProductsTO, 'Tapia Original', '🫒')}
      {renderGroup(unitProductsVO, setUnitProductsVO, 'Verde Oleum', '🌿')}
      {renderGroup(unitProductsDL, setUnitProductsDL, 'Delirium', '✨')}
      {toast && <div className="toast">{toast}</div>}
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
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState("calc");
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [unitProductsTO, setUnitProductsTO] = useState(UNIT_PRODUCTS_TO.map(p => ({ ...p })));
  const [unitProductsVO, setUnitProductsVO] = useState(UNIT_PRODUCTS_VO.map(p => ({ ...p })));
  const [unitProductsDL, setUnitProductsDL] = useState(UNIT_PRODUCTS_DL.map(p => ({ ...p })));
  const [productImages, setProductImages] = useState({});

  // Auth
  useEffect(() => {
    api.getSession().then(s => { setSession(s); setAuthLoading(false); });
    const { data: { subscription } } = api.onAuthChange((_ev, s) => {
      setSession(s);
      if (!s) { setProfile(null); setAuthError(''); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    setAuthError('');
    api.getClientProfile(session.user.id).then(({ data, error }) => {
      console.log('Profile lookup:', { data, error, uid: session.user.id });
      if (error) { setAuthError('Error buscando perfil: ' + error.message); return; }
      if (!data) { setAuthError('No se encontró perfil para auth_user_id: ' + session.user.id); return; }
      if (data.role !== 'admin') { setAuthError('Solo administradores. Tu rol: ' + (data.role || 'client')); return; }
      setProfile(data);
    }).catch(err => setAuthError('Error: ' + err.message));
  }, [session]);

  // Load product images
  useEffect(() => {
    if (!profile) return;
    api.getProductImages().then(images => {
      if (images) setProductImages(images);
    });
  }, [profile]);

  // Calculations
  const calcsTO = useMemo(() => {
    const litro = precioLitro(params.poolred, params.dif_pr_to);
    const results = [];
    for (const up of unitProductsTO) {
      results.push(calcUnit(up, params, litro));
      BOX_PRODUCTS_TO.filter(b => b.unitRef === up.id).forEach(bp => results.push(calcBox(bp, up, params, litro)));
    }
    return results;
  }, [params, unitProductsTO]);

  const calcsVO = useMemo(() => {
    const litro = precioLitro(params.poolred, params.dif_pr_vo);
    const results = [];
    for (const up of unitProductsVO) {
      results.push(calcUnit(up, params, litro));
      BOX_PRODUCTS_VO.filter(b => b.unitRef === up.id).forEach(bp => results.push(calcBox(bp, up, params, litro)));
    }
    return results;
  }, [params, unitProductsVO]);

  const calcsDL = useMemo(() => {
    const litro = precioLitro(params.poolred, params.dif_pr_dl);
    const results = [];
    for (const up of unitProductsDL) {
      results.push(calcUnit(up, params, litro));
      BOX_PRODUCTS_DL.filter(b => b.unitRef === up.id).forEach(bp => results.push(calcBox(bp, up, params, litro)));
    }
    return results;
  }, [params, unitProductsDL]);

  const allCalcs = useMemo(() => [...calcsTO, ...calcsVO, ...calcsDL], [calcsTO, calcsVO, calcsDL]);

  const handleSaveTariff = async (name, notes, channelNames) => {
    const { data: code } = await api.nextTariffCode();
    const productPrices = allCalcs.map(c => ({
      id: c.id, name: c.name, vol: c.vol, isBox: c.isBox, qty: c.qty, unitName: c.unitName,
      coste_real: Math.round(c.coste_real * 100) / 100,
      tienda_r: c.tienda ? Math.round(c.tienda) : null,
      distribucion_r: c.distribucion ? Math.round(c.distribucion) : null,
      dl2_r: c.dl2 ? Math.round(c.dl2) : null,
      horeca_r: c.horeca ? Math.round(c.horeca) : null,
      web_r: c.web ? Math.round(c.web) : null,
      tienda_si: c.tienda ? Math.round(c.tienda / 1.04 * 100) / 100 : null,
      horeca_si: c.horeca ? Math.round(c.horeca / 1.04 * 100) / 100 : null,
    }));
    const materialCosts = [...unitProductsTO, ...unitProductsVO, ...unitProductsDL].map(p => ({
      id: p.id, envase: p.envase, tapon: p.tapon, etiqueta: p.etiqueta, contra: p.contra
    }));
    await api.saveTariffDraft({
      version_code: code, name, notes,
      params: { ...params, channel_names: channelNames },
      product_prices: productPrices,
      material_costs: materialCosts,
    });
  };

  // Render
  if (authLoading) return <div className="app"><div className="loading"><div className="loading-spin" /><p>Cargando...</p></div></div>;
  if (!session) return <AuthScreen />;
  if (authError) return (
    <div className="app" style={{ padding: 20 }}>
      <div style={{ background: '#FFF3E0', border: '1.5px solid #FFB74D', borderRadius: 10, padding: 16, marginTop: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 6, color: '#E65100' }}>⚠️ Error de acceso</div>
        <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>{authError}</div>
        <button onClick={() => api.signOut()} style={{ marginTop: 10, padding: '6px 14px', border: '1px solid #DDD', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 11 }}>Cerrar sesión</button>
      </div>
    </div>
  );
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
          <button className={"nb " + (tab === "calc" ? "on" : "")} onClick={() => setTab("calc")}>📊 Calculadora</button>
          <button className={"nb " + (tab === "mats" ? "on" : "")} onClick={() => setTab("mats")}>📦 Materiales</button>
          <button className={"nb " + (tab === "tariffs" ? "on" : "")} onClick={() => setTab("tariffs")}>📋 Tarifas</button>
        </div>
      </div>

      <div className="main">
        {tab === "calc" && (
          <CalculatorTab params={params} setParams={setParams}
            calcsTO={calcsTO} calcsVO={calcsVO} calcsDL={calcsDL} allCalcs={allCalcs}
            unitProductsTO={unitProductsTO} unitProductsVO={unitProductsVO} unitProductsDL={unitProductsDL}
            onSave={handleSaveTariff} productImages={productImages} />
        )}
        {tab === "mats" && (
          <MaterialsTab unitProductsTO={unitProductsTO} setUnitProductsTO={setUnitProductsTO}
            unitProductsVO={unitProductsVO} setUnitProductsVO={setUnitProductsVO}
            unitProductsDL={unitProductsDL} setUnitProductsDL={setUnitProductsDL}
            productImages={productImages} setProductImages={setProductImages} />
        )}
        {tab === "tariffs" && (
          <TariffManager
            currentCalcs={allCalcs} currentParams={params}
            materialCosts={[...unitProductsTO, ...unitProductsVO, ...unitProductsDL].map(p => ({ id: p.id, envase: p.envase, tapon: p.tapon, etiqueta: p.etiqueta, contra: p.contra }))}
            clientId={profile?.id} productImages={productImages} />
        )}
      </div>
    </div>
  );
}
