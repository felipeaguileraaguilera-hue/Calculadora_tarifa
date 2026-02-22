import { useState, useEffect } from "react";
import * as api from '../api';
import TariffViewer from './TariffViewer';

const STATUS = {
  draft: { label: 'Borrador', bg: '#F5F5F5', color: '#666', icon: '📝' },
  approved: { label: 'Aprobada', bg: '#E3F2FD', color: '#1565C0', icon: '✅' },
  published: { label: 'Publicada', bg: '#E8F5E9', color: '#2E7D32', icon: '🟢' },
  archived: { label: 'Archivada', bg: '#FFF3E0', color: '#E65100', icon: '📦' },
};

export default function TariffManager({ currentCalcs, currentParams, materialCosts, clientId }) {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingTariff, setViewingTariff] = useState(null);
  const [compareTariffs, setCompareTariffs] = useState([null, null]);
  const [showCompare, setShowCompare] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [publishDate, setPublishDate] = useState('');
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await api.listTariffs();
    if (data) setTariffs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Save current calculation as draft
  const handleSave = async () => {
    if (!saveName) { alert('Indica un nombre para la tarifa'); return; }
    const { data: code } = await api.nextTariffCode();
    
    const productPrices = currentCalcs.map(c => ({
      id: c.id, name: c.name, vol: c.vol, isBox: c.isBox,
      qty: c.qty, unitName: c.unitName,
      coste_real: Math.round(c.coste_real * 100) / 100,
      tienda_r: c.tienda ? Math.round(c.tienda) : null,
      distribucion_r: c.distribucion ? Math.round(c.distribucion) : null,
      dl2_r: c.dl2 ? Math.round(c.dl2) : null,
      horeca_r: c.horeca ? Math.round(c.horeca) : null,
      web_r: c.web ? Math.round(c.web) : null,
      tienda_si: c.tienda ? Math.round(c.tienda / 1.04 * 100) / 100 : null,
      horeca_si: c.horeca ? Math.round(c.horeca / 1.04 * 100) / 100 : null,
    }));

    const { data, error } = await api.saveTariffDraft({
      version_code: code,
      name: saveName,
      notes: saveNotes,
      params: currentParams,
      product_prices: productPrices,
      material_costs: materialCosts,
    });

    if (error) { alert('Error: ' + error.message); return; }
    showToast('Tarifa guardada como borrador');
    setSaveName(''); setSaveNotes(''); setShowSaveForm(false);
    load();
  };

  const handleApprove = async (tariffId) => {
    if (!confirm('¿Aprobar esta tarifa?')) return;
    const { error } = await api.approveTariff(tariffId, clientId);
    if (error) { alert('Error: ' + error.message); return; }
    showToast('Tarifa aprobada');
    load();
  };

  const handlePublish = async (tariffId) => {
    if (!publishDate) { alert('Indica una fecha de publicación'); return; }
    if (!confirm(`¿Publicar tarifa? Será visible para clientes a partir del ${new Date(publishDate).toLocaleDateString('es-ES')}`)) return;
    
    const { error } = await api.publishTariff(tariffId, new Date(publishDate).toISOString());
    if (error) { alert('Error: ' + error.message); return; }
    showToast('Tarifa publicada');
    setPublishDate('');
    load();
  };

  const handleDelete = async (tariffId) => {
    if (!confirm('¿Eliminar este borrador?')) return;
    await api.deleteTariff(tariffId);
    showToast('Borrador eliminado');
    load();
  };

  const handleView = async (tariffId) => {
    const { data } = await api.getTariff(tariffId);
    if (data) setViewingTariff(data);
  };

  // Comparison view
  const CompareView = () => {
    const [t1, setT1] = useState(null);
    const [t2, setT2] = useState(null);
    const [loadingCompare, setLoadingCompare] = useState(false);

    const loadForCompare = async (id, setter) => {
      setLoadingCompare(true);
      const { data } = await api.getTariff(id);
      if (data) setter(data);
      setLoadingCompare(false);
    };

    const allProducts = t1 ? (t1.product_prices || []).filter(p => p.isBox) : [];

    return (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label className="fl">Tarifa A</label>
            <select className="fi" style={{ width: 200 }} onChange={e => e.target.value && loadForCompare(e.target.value, setT1)}>
              <option value="">Seleccionar...</option>
              {tariffs.map(t => <option key={t.id} value={t.id}>{t.version_code} — {t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="fl">Tarifa B</label>
            <select className="fi" style={{ width: 200 }} onChange={e => e.target.value && loadForCompare(e.target.value, setT2)}>
              <option value="">Seleccionar...</option>
              {tariffs.map(t => <option key={t.id} value={t.id}>{t.version_code} — {t.name}</option>)}
            </select>
          </div>
        </div>

        {t1 && t2 && (
          <div className="pt-scroll" style={{ borderRadius: 8, border: '1px solid #E0E0E0' }}>
            <table className="pt">
              <thead>
                <tr>
                  <th className="pt-th-name">Producto</th>
                  <th className="pt-th" style={{ background: '#1565C0' }}>Horeca A</th>
                  <th className="pt-th" style={{ background: '#2E7D32' }}>Horeca B</th>
                  <th className="pt-th">Δ</th>
                  <th className="pt-th" style={{ background: '#1565C0' }}>PoolRed A</th>
                  <th className="pt-th" style={{ background: '#2E7D32' }}>PoolRed B</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: '#F5F5F5' }}>
                  <td className="pt-td-name" style={{ fontWeight: 700 }}>Parámetros</td>
                  <td className="pt-td" colSpan={2}></td>
                  <td className="pt-td"></td>
                  <td className="pt-td"><strong>{t1.params?.poolred}€</strong></td>
                  <td className="pt-td"><strong>{t2.params?.poolred}€</strong></td>
                </tr>
                {allProducts.map(p1 => {
                  const p2 = (t2.product_prices || []).find(x => x.id === p1.id);
                  const delta = (p2?.horeca_r || 0) - (p1.horeca_r || 0);
                  return (
                    <tr key={p1.id}>
                      <td className="pt-td-name"><div className="pt-prod-name">{p1.name}</div></td>
                      <td className="pt-td">{p1.horeca_r ? Math.round(p1.horeca_r) + '€' : '—'}</td>
                      <td className="pt-td">{p2?.horeca_r ? Math.round(p2.horeca_r) + '€' : '—'}</td>
                      <td className="pt-td" style={{ color: delta > 0 ? '#C62828' : delta < 0 ? '#2E7D32' : '#888', fontWeight: 700 }}>
                        {delta !== 0 ? (delta > 0 ? '+' : '') + Math.round(delta) + '€' : '='}
                      </td>
                      <td className="pt-td" style={{ fontSize: 10, color: '#888' }}>{Math.round(p1.coste_real * 100) / 100}€</td>
                      <td className="pt-td" style={{ fontSize: 10, color: '#888' }}>{p2 ? Math.round(p2.coste_real * 100) / 100 + '€' : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  if (viewingTariff) {
    return <TariffViewer tariff={viewingTariff} onClose={() => setViewingTariff(null)} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div className="pt-title">📋 Gestión de Tarifas</div>
          <div style={{ fontSize: 10, color: '#8A9A86' }}>{tariffs.length} tarifa{tariffs.length !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="chip-btn" onClick={() => setShowCompare(!showCompare)}>
            {showCompare ? '📋 Lista' : '🔀 Comparar'}
          </button>
          <button className="sync-btn" onClick={() => setShowSaveForm(true)}>💾 Guardar actual</button>
        </div>
      </div>

      {/* Save form */}
      {showSaveForm && (
        <div style={{ background: '#fff', border: '1.5px solid #DDD', borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Guardar tarifa actual como borrador</div>
          <div className="fg">
            <label className="fl">Nombre</label>
            <input className="fi" value={saveName} onChange={e => setSaveName(e.target.value)} placeholder="Ej: Tarifa Primavera 2026" />
          </div>
          <div className="fg">
            <label className="fl">Notas</label>
            <textarea className="fi" value={saveNotes} onChange={e => setSaveNotes(e.target.value)} placeholder="Notas opcionales..." style={{ minHeight: 40 }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="sync-btn" onClick={handleSave}>💾 Guardar</button>
            <button className="chip-btn" onClick={() => setShowSaveForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {showCompare ? <CompareView /> : <>
        {/* Tariff list */}
        {loading ? <div className="loading"><div className="loading-spin" /><p>Cargando...</p></div> :
          tariffs.map(t => {
            const st = STATUS[t.status] || STATUS.draft;
            return (
              <div key={t.id} style={{ background: '#fff', border: '1px solid #EEE', borderRadius: 10, padding: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{t.version_code}</span>
                      <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 6, background: st.bg, color: st.color, fontWeight: 700 }}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#4A5A46', marginTop: 2 }}>{t.name}</div>
                    <div style={{ fontSize: 9, color: '#8A9A86', marginTop: 2 }}>
                      Creada: {new Date(t.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {t.approved_at && <> · Aprobada: {new Date(t.approved_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</>}
                      {t.published_at && <> · Publicada: {new Date(t.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</>}
                      {t.params?.poolred && <> · PoolRed: {t.params.poolred}€</>}
                    </div>
                    {t.notes && <div style={{ fontSize: 10, color: '#E65100', marginTop: 4 }}>📝 {t.notes}</div>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                  <button className="chip-btn" onClick={() => handleView(t.id)}>👁️ Ver</button>
                  
                  {t.status === 'draft' && <>
                    <button className="chip-btn" style={{ background: '#E3F2FD', borderColor: '#90CAF9', color: '#1565C0' }} onClick={() => handleApprove(t.id)}>✅ Aprobar</button>
                    <button className="chip-btn" style={{ color: '#C62828' }} onClick={() => handleDelete(t.id)}>🗑️ Eliminar</button>
                  </>}

                  {t.status === 'approved' && (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <input type="datetime-local" className="fi" style={{ width: 180, padding: '4px 6px', fontSize: 10 }}
                        value={publishDate} onChange={e => setPublishDate(e.target.value)} />
                      <button className="sync-btn" style={{ fontSize: 10, padding: '4px 10px' }} onClick={() => handlePublish(t.id)}>🟢 Publicar</button>
                    </div>
                  )}

                  {t.status === 'published' && (
                    <span style={{ fontSize: 10, color: '#2E7D32', fontWeight: 600 }}>🟢 Tarifa activa</span>
                  )}
                </div>
              </div>
            );
          })
        }
      </>}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
