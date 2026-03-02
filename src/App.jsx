import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    if (!email || !password) { setError("Rellena todos los campos"); return; }
    setLoading(true); setError("");
    const { error: e } = await api.signIn(email, password);
    setLoading(false); if (e) setError("Email o contraseña incorrectos");
  };
  return (
    <div className="auth"><div className="auth-box">
      <div className="auth-logo"><div className="auth-logo-m">AT</div><div className="auth-logo-t">Aceites Tapia</div><div className="auth-logo-s">Calculadora de Precios</div></div>
      {error && <div className="auth-err">{error}</div>}
      <div className="fg"><label className="fl">Email</label><input className="fi" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" /></div>
      <div className="fg"><label className="fl">Contraseña</label><input className="fi" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
      <button className="bp" disabled={loading} onClick={handleLogin}>{loading ? "Cargando..." : "Entrar"}</button>
    </div></div>
  );
}

function PI({ value, onChange, suffix = '', step = 0.01, width = 72 }) {
  return (<span className="pe-input-wrap">
    <input className="pe-input" type="number" step={step} value={value} style={{ width }} onChange={e => onChange(parseFloat(e.target.value) || 0)} />
    {suffix && <span className="pe-suffix">{suffix}</span>}
  </span>);
}

// ============================================================
// EDITABLE PRICE CELL
// ============================================================
function EditablePrice({ calculated, override, onOverride, costeReal }) {
  const rounded = calculated != null ? Math.round(calculated) : null;
  const displayVal = override != null ? override : rounded;
  const isOverridden = override != null && override !== rounded;
  const margin = marginAnalysis(displayVal, costeReal);

  if (displayVal == null) return <td className="pt-td">—</td>;

  return (
    <td className={`pt-td ${isOverridden ? 'pt-td-edited' : ''}`}>
      <input className="pt-price-input" type="number" value={displayVal}
        onChange={e => {
          const v = parseInt(e.target.value);
          if (isNaN(v) || v === rounded) onOverride(null);
          else onOverride(v);
        }} />
      <div className="pt-margin">{fmtPct(margin.pct)}</div>
      {isOverridden && <div className="pt-calc-hint">calc: {rounded}€</div>}
    </td>
  );
}

// ============================================================
// CALCULATOR TAB
// ============================================================
function CalculatorTab({ params, setParams, calcsTO, calcsVO, calcsDL, allCalcs, priceOverrides, setPriceOverrides, channelNames, setChannelNames, onSave }) {
  //const [showCosts, setShowCosts] = useState(false);
  const [viewMode, setViewMode] = useState('pvp'); // Modos: 'pvp', 'no_vat', 'costs'
  const [saveName, setSaveName] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const litroTO = precioLitro(params.poolred, params.dif_pr_to);
  const litroVO = precioLitro(params.poolred, params.dif_pr_vo);
  const litroDL = precioLitro(params.poolred, params.dif_pr_dl);

  const handleSave = async () => {
    if (!saveName.trim()) { alert('Indica un nombre para la tarifa'); return; }
    setSaving(true);
    await onSave(saveName, saveNotes);
    setSaving(false);
    setToast('✅ Tarifa guardada'); setSaveName(''); setSaveNotes('');
    setTimeout(() => setToast(null), 3000);
  };

  const setOverride = (productId, channel, value) => {
    setPriceOverrides(prev => {
      const next = { ...prev };
      const key = `${productId}_${channel}`;
      if (value == null) delete next[key];
      else next[key] = value;
      return next;
    });
  };

  const channels = ['tienda', 'distribucion', 'dl2', 'horeca', 'web'];

  const renderTable = (calcs, title, icon) => (
    <div className="calc-section">
      <div className="cs-title">{icon} {title}</div>
      <div className="pt-scroll">
        <table className="pt">
          <thead><tr>
            <th className="pt-th-name">Producto</th>
            <th className="pt-th-vol">L</th>
            {showCosts ? <>
              <th className="pt-th">Aceite</th><th className="pt-th">Material</th>
              <th className="pt-th">M.O.</th><th className="pt-th c-highlight">Coste</th>
            </> :
              channels.map(ch => <th key={ch} className={`pt-th c-${ch === 'distribucion' ? 'distrib' : ch}`}>{channelNames[ch]}</th>)
            }
          </tr></thead>
          <tbody>
            {calcs.map(c => (
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
                </> :
                  channels.map(ch => {
                    const key = `${c.id}_${ch}`;
                    const factorIVA = 1 + params.iva_aceite; // Usamos el IVA configurado (ej. 1.04)
                  
                    // Valor base (PVP calculado o manual)
                    let valPVP = priceOverrides[key] ?? c[ch];
                  
                    // Si estamos en modo Sin IVA, dividimos el PVP por el factor de IVA
                    let displayValue = viewMode === 'no_vat' ? (valPVP / factorIVA) : valPVP;
                  
                    return c[ch] != null ? (
                      <EditablePrice 
                        key={ch} 
                        calculated={displayValue} 
                        // Si editamos en 'Sin IVA', al guardar multiplicamos por el IVA para que el override sea siempre PVP
                        onOverride={v => {
                          const finalValue = viewMode === 'no_vat' ? (v * factorIVA) : v;
                          setOverride(c.id, ch, finalValue);
                        }} 
                        costeReal={c.coste_real} 
                      />
                    ) : <td key={ch} className="pt-td">—</td>;
                  })
                }
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <div className="params-bar">
        <div className="pb-group"><span className="pb-label">PoolRed</span>
          <PI value={params.poolred} onChange={v => setParams({...params, poolred: v})} suffix="€/kg" width={65} /></div>
        <div className="pb-group"><span className="pb-label">Dif. TO</span>
          <PI value={params.dif_pr_to} onChange={v => setParams({...params, dif_pr_to: v})} suffix="€" width={55} /></div>
        <div className="pb-group"><span className="pb-label">Dif. VO</span>
          <PI value={params.dif_pr_vo} onChange={v => setParams({...params, dif_pr_vo: v})} suffix="€" width={55} /></div>
        <div className="pb-group"><span className="pb-label">Dif. DL</span>
          <PI value={params.dif_pr_dl} onChange={v => setParams({...params, dif_pr_dl: v})} suffix="€" width={55} /></div>
        <div className="pb-derived">
          TO: <strong>{fmt(litroTO, 3)}/L</strong> · VO: <strong>{fmt(litroVO, 3)}/L</strong> · DL: <strong>{fmt(litroDL, 3)}/L</strong>
        </div>
      </div>

      <details className="params-detail">
        <summary className="params-summary">⚙️ Márgenes, costes operativos y nombres de canal</summary>
        <div className="params-grid">
          <div className="pg-col">
            <div className="pg-title">Márgenes</div>
            {[['margen_tienda','tienda'],['margen_distrib','distribucion'],['margen_dl2','dl2'],['margen_horeca','horeca'],['margen_web','web']].map(([k,ch]) => (
              <div key={k} className="pe-row"><span className="pe-label">{channelNames[ch]}</span>
                <PI value={params[k]} onChange={v => setParams({...params, [k]: v})} suffix="%" step={0.005} /></div>
            ))}
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
              <div key={k} className="pe-row"><span className="pe-label">{k}</span>
                <input className="pe-input" style={{ width: 100 }} value={v} onChange={e => setChannelNames({...channelNames, [k]: e.target.value})} /></div>
            ))}
          </div>
        </div>
      </details>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
        {Object.keys(priceOverrides).length > 0 && (
          <span style={{ fontSize: 10, color: '#E65100' }}>
            ✏️ {Object.keys(priceOverrides).length} precio{Object.keys(priceOverrides).length > 1 ? 's' : ''} editado{Object.keys(priceOverrides).length > 1 ? 's' : ''} manualmente
          </span>
        )}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, justifyContent: 'flex-end' }}>
          <button className={`chip-btn ${viewMode === 'pvp' ? 'active' : ''}`} onClick={() => setViewMode('pvp')}>💰 PVP</button>
          <button className={`chip-btn ${viewMode === 'no_vat' ? 'active' : ''}`} onClick={() => setViewMode('no_vat')}>📑 Sin IVA</button>
          <button className={`chip-btn ${viewMode === 'costs' ? 'active' : ''}`} onClick={() => setViewMode('costs')}>🔍 Costes</button>
        </div>
      </div>

      {renderTable(calcsDL, 'Delirium', '✨')}
      {renderTable(calcsVO, 'Verde Oleum', '🌿')}
      {renderTable(calcsTO, 'Tapia Original', '🫒')}

      <div className="save-bar">
        <div className="save-bar-title">💾 Guardar tarifa en base de datos</div>
        <div className="save-bar-row">
          <input className="fi" value={saveName} onChange={e => setSaveName(e.target.value)}
            placeholder="Nombre (ej: Tarifa Primavera 2026)" style={{ flex: 1 }} />
          <button className="sync-btn" disabled={saving || !saveName.trim()} onClick={handleSave}>
            {saving ? '⏳ Guardando...' : '💾 Guardar'}
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
// MATERIALS TAB — with Delirium extended fields
// ============================================================
function MaterialsTab({ unitProductsTO, setUnitProductsTO, unitProductsVO, setUnitProductsVO, unitProductsDL, setUnitProductsDL, productImages, setProductImages }) {
  const [uploading, setUploading] = useState(null);
  const [toast, setToast] = useState(null);
  const updateMat = (setter) => (prodId, field, value) => {
    setter(prev => prev.map(p => p.id === prodId ? { ...p, [field]: value } : p));
  };
  const handleUpload = async (prodId, file) => {
    if (!file) return; setUploading(prodId);
    try {
      const { url, error } = await api.uploadProductImage(prodId, file);
      if (error) { alert('Error: ' + error); } else {
        setProductImages(prev => ({ ...prev, [prodId]: url }));
        setToast('✅ Imagen subida');
        setTimeout(() => setToast(null), 2000);
      }
    } catch (e) { alert('Error: ' + e.message); }
    setUploading(null);
  };

  const PhotoCell = ({ prodId }) => (
    <div className="mat-col-photo">
      {productImages[prodId] ? (
        <img src={productImages[prodId]} alt="" className="mat-thumb"
          onClick={() => document.getElementById('upload-' + prodId)?.click()} />
      ) : (
        <button className="mat-upload-btn" onClick={() => document.getElementById('upload-' + prodId)?.click()}>
          {uploading === prodId ? '⏳' : '📷'}
        </button>
      )}
      <input type="file" accept="image/*" id={'upload-' + prodId} style={{ display: 'none' }}
        onChange={e => handleUpload(prodId, e.target.files[0])} />
    </div>
  );

  const stdFields = ['envase', 'tapon', 'etiqueta', 'contra'];
  const dlFields = ['botella', 'tapon', 'dosificador', 'etiqueta', 'tarjeta_sabor', 'caja_interior', 'caja_exterior'];

  const renderStdGroup = (prods, setter, title, icon) => (
    <div className="mat-panel">
      <div className="ps-title">{icon} {title}</div>
      <div className="mat-table">
        <div className="mat-header">
          <span className="mat-col-photo">Foto</span>
          <span className="mat-col-name">Producto</span>
          {stdFields.map(f => <span key={f} className="mat-col">{f.charAt(0).toUpperCase() + f.slice(1)}</span>)}
        </div>
        {prods.map(prod => (
          <div key={prod.id} className="mat-row">
            <PhotoCell prodId={prod.id} />
            <span className="mat-col-name">{prod.name}</span>
            {stdFields.map(f => (
              <input key={f} className="mat-input" type="number" step="0.01"
                value={prod[f]} onChange={e => updateMat(setter)(prod.id, f, parseFloat(e.target.value) || 0)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* Delirium — extended materials */}
      <div className="mat-panel">
        <div className="ps-title">✨ Delirium</div>
        <div className="mat-table">
          <div className="mat-header">
            <span className="mat-col-photo">Foto</span>
            <span className="mat-col-name">Producto</span>
            {dlFields.map(f => <span key={f} className="mat-col" style={{ fontSize: 7 }}>{f.replace('_', ' ')}</span>)}
          </div>
          {unitProductsDL.map(prod => (
            <div key={prod.id} className="mat-row">
              <PhotoCell prodId={prod.id} />
              <span className="mat-col-name">{prod.name}</span>
              {dlFields.map(f => (
                <input key={f} className="mat-input" type="number" step="0.01"
                  value={prod[f] || 0} onChange={e => updateMat(setUnitProductsDL)(prod.id, f, parseFloat(e.target.value) || 0)} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {renderStdGroup(unitProductsVO, setUnitProductsVO, 'Verde Oleum', '🌿')}
      {renderStdGroup(unitProductsTO, setUnitProductsTO, 'Tapia Original', '🫒')}
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
  const [priceOverrides, setPriceOverrides] = useState({}); // {productId_channel: value}
  const [channelNames, setChannelNames] = useState({ tienda: 'Tienda', distribucion: 'Distribución', dl2: 'DL2', horeca: 'Horeca', web: 'Web' });

  useEffect(() => {
    api.getSession().then(s => { setSession(s); setAuthLoading(false); });
    const { data: { subscription } } = api.onAuthChange((_ev, s) => {
      setSession(s); if (!s) { setProfile(null); setAuthError(''); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return; setAuthError('');
    api.getClientProfile(session.user.id).then(({ data, error }) => {
      console.log('Profile:', { data, error, uid: session.user.id });
      if (error) { setAuthError('Error: ' + error.message); return; }
      if (!data) { setAuthError('No se encontró perfil para auth_user_id: ' + session.user.id); return; }
      if (data.role !== 'admin') { setAuthError('Solo administradores. Tu rol: ' + (data.role || 'client')); return; }
      setProfile(data);
    }).catch(err => setAuthError('Error: ' + err.message));
  }, [session]);

  useEffect(() => { if (profile) api.getProductImages().then(img => { if (img) setProductImages(img); }); }, [profile]);

  // Calculations
  const calcsTO = useMemo(() => {
    const l = precioLitro(params.poolred, params.dif_pr_to); const r = [];
    for (const up of unitProductsTO) { r.push(calcUnit(up, params, l));
      BOX_PRODUCTS_TO.filter(b => b.unitRef === up.id).forEach(bp => r.push(calcBox(bp, up, params, l))); }
    return r;
  }, [params, unitProductsTO]);

  const calcsVO = useMemo(() => {
    const l = precioLitro(params.poolred, params.dif_pr_vo); const r = [];
    for (const up of unitProductsVO) { r.push(calcUnit(up, params, l));
      BOX_PRODUCTS_VO.filter(b => b.unitRef === up.id).forEach(bp => r.push(calcBox(bp, up, params, l))); }
    return r;
  }, [params, unitProductsVO]);

  const calcsDL = useMemo(() => {
    const l = precioLitro(params.poolred, params.dif_pr_dl); const r = [];
    for (const up of unitProductsDL) { r.push(calcUnit(up, params, l));
      BOX_PRODUCTS_DL.filter(b => b.unitRef === up.id).forEach(bp => r.push(calcBox(bp, up, params, l))); }
    return r;
  }, [params, unitProductsDL]);

  const allCalcs = useMemo(() => [...calcsDL, ...calcsVO, ...calcsTO], [calcsTO, calcsVO, calcsDL]);

  // Build final prices (calculated + overrides)
  const buildFinalPrices = useCallback(() => {
    return allCalcs.map(c => {
      const channels = ['tienda', 'distribucion', 'dl2', 'horeca', 'web'];
      const result = {
        id: c.id, name: c.name, vol: c.vol, isBox: c.isBox, qty: c.qty, unitName: c.unitName,
        allChannels: c.allChannels || false,
        coste_real: Math.round(c.coste_real * 100) / 100,
      };
      channels.forEach(ch => {
        const override = priceOverrides[`${c.id}_${ch}`];
        const calc = c[ch] != null ? Math.round(c[ch]) : null;
        result[ch + '_r'] = override != null ? override : calc;
        result[ch + '_si'] = result[ch + '_r'] != null ? Math.round(result[ch + '_r'] / 1.04 * 100) / 100 : null;
        result[ch + '_calc'] = calc; // keep original for reference
      });
      return result;
    });
  }, [allCalcs, priceOverrides]);

  const handleSaveTariff = async (name, notes) => {
    const { data: code } = await api.nextTariffCode();
    const productPrices = buildFinalPrices();
    const materialCosts = [...unitProductsDL, ...unitProductsVO, ...unitProductsTO].map(p => {
      const base = { id: p.id, envase: p.envase, tapon: p.tapon, etiqueta: p.etiqueta, contra: p.contra };
      if (p.caja_interior !== undefined) {
        Object.assign(base, { caja_interior: p.caja_interior, caja_exterior: p.caja_exterior, dosificador: p.dosificador, botella: p.botella, tarjeta_sabor: p.tarjeta_sabor });
      }
      return base;
    });
    const { error } = await api.saveTariffDraft({
      version_code: code, name, notes,
      params: { ...params, channel_names: channelNames },
      product_prices: productPrices,
      material_costs: materialCosts,
    });
    if (error) alert('Error al guardar: ' + error.message);
  };

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
          <div className="logo-a"><div className="logo-m">AT</div>
            <div><div className="logo-t">Aceites Tapia</div><div className="logo-s">Calculadora de Precios</div></div></div>
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
            priceOverrides={priceOverrides} setPriceOverrides={setPriceOverrides}
            channelNames={channelNames} setChannelNames={setChannelNames}
            onSave={handleSaveTariff} />
        )}
        {tab === "mats" && (
          <MaterialsTab unitProductsTO={unitProductsTO} setUnitProductsTO={setUnitProductsTO}
            unitProductsVO={unitProductsVO} setUnitProductsVO={setUnitProductsVO}
            unitProductsDL={unitProductsDL} setUnitProductsDL={setUnitProductsDL}
            productImages={productImages} setProductImages={setProductImages} />
        )}
        {tab === "tariffs" && (
          <TariffManager currentCalcs={allCalcs} currentParams={params}
            materialCosts={[...unitProductsDL, ...unitProductsVO, ...unitProductsTO]}
            clientId={profile?.id} productImages={productImages} />
        )}
      </div>
    </div>
  );
}
