import { useState } from "react";

const fmt = (n) => n != null ? Math.round(n) + '€' : '';

const DISPLAY_GROUPS = [
  {
    title: 'Delirium',
    bg: '#0D0D0D', titleColor: '#C4A54D',
    products: [
      { id: 'DL_BOT_500', label: 'DELIRIUM 500 ML' },
    ],
    boxes: []
  },
  {
    title: 'Verde Oleum',
    bg: '#1A2016', titleColor: '#C4A54D',
    products: [
      { id: 'VO_LATA_5L', label: 'LATA VERDE OLEUM 5 LITROS' },
      { id: 'VO_LATA_750', label: 'LATA VERDE OLEUM 750 ML' },
      { id: 'VO_LATA_250', label: 'LATA VERDE OLEUM 250 ML' },
      { id: 'VO_BOT_500', label: 'BOTELLA VERDE OLEUM 500 ML' },
      { id: 'VO_BOT_250', label: 'BOTELLA VERDE OLEUM 250 ML' },
    ],
    boxes: [
      { id: 'VO_CAJA_4x5L', label: 'Caja 4×5L' },
      { id: 'VO_CAJA_15x750', label: 'Caja 15×750ML' },
      { id: 'VO_CAJA_28x250', label: 'Caja 28×250ML' },
      { id: 'VO_CAJA_15x500', label: 'Caja 15×500ML' },
      { id: 'VO_CAJA_30x250', label: 'Caja 30×250ML' },
    ]
  },
  {
    title: 'Marasca Transparente',
    bg: '#F5F0E6', titleColor: '#5A4A2A',
    products: [
      { id: 'TO_MT_750', label: 'MARASCA TRANS. 750 ML' },
      { id: 'TO_MT_500', label: 'MARASCA TRANS. 500 ML' },
      { id: 'TO_MT_250', label: 'MARASCA TRANS. 250 ML' },
    ],
    boxes: [
      { id: 'TO_CAJA_15x750', label: 'Caja 15×750ML' },
      { id: 'TO_CAJA_24x500MT', label: 'Caja 24×500ML' },
      { id: 'TO_CAJA_20x500MT', label: 'Caja 20×250ML' },
    ]
  },
  {
    title: 'PET — Tapia Original',
    bg: '#E8F0E5', titleColor: '#2A3326',
    products: [
      { id: 'TO_PET_5L', label: 'PET 5 LITROS' },
      { id: 'TO_PET_2L', label: 'PET 2 LITROS' },
      { id: 'TO_PET_1L', label: 'PET 1 LITRO' },
      { id: 'TO_PET_500', label: 'PET 500 ML' },
      { id: 'TO_PET_250', label: 'PET 250 ML' },
    ],
    boxes: [
      { id: 'TO_CAJA_3x5L', label: 'Caja 3×5L' },
      { id: 'TO_CAJA_6x2L', label: 'Caja 6×2L' },
      { id: 'TO_CAJA_15x1L', label: 'Caja 15×1L' },
      { id: 'TO_CAJA_28x500', label: 'Caja 28×500ML' },
      { id: 'TO_CAJA_24x250', label: 'Caja 24×250ML' },
    ]
  },
];

const CHANNEL_KEYS = ['tienda', 'horeca', 'distribucion', 'dl2', 'web'];

export default function TariffViewer({ tariff, productImages = {}, onClose }) {
  const channelNames = tariff?.params?.channel_names || { tienda: 'Tienda', distribucion: 'Distribución', dl2: 'DL2', horeca: 'Horeca', web: 'Web' };
  const [selectedChannel, setSelectedChannel] = useState('horeca');

  if (!tariff) return null;

  const prices = tariff.product_prices || [];
  const getPrice = (productId) => {
    const p = prices.find(x => x.id === productId);
    if (!p) return '';
    return p[selectedChannel + '_r'] ? fmt(p[selectedChannel + '_r']) : '';
  };

  return (
    <div className="tv-wrap">
      <div className="no-print tv-controls">
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {CHANNEL_KEYS.map(ch => (
            <button key={ch}
              className={`tv-ch-btn ${selectedChannel === ch ? 'active' : ''}`}
              onClick={() => setSelectedChannel(ch)}>
              {channelNames[ch] || ch}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="tv-print-btn" onClick={() => window.print()}>🖨️ Imprimir</button>
          {onClose && <button className="tv-close-btn" onClick={onClose}>✕</button>}
        </div>
      </div>

      <div className="tv-doc">
        <div className="tv-header">
          <div className="tv-logo-mark">AT</div>
          <div className="tv-brand">
            <div className="tv-brand-name">ACEITES TAPIA</div>
            <div className="tv-brand-sub">Desde 1993 · Villanueva de Tapia</div>
          </div>
          <div className="tv-tariff-info">
            <div className="tv-tariff-code">{tariff.version_code}</div>
            <div className="tv-tariff-name">{tariff.name}</div>
            {tariff.published_at && (
              <div className="tv-tariff-date">
                Vigente desde: {new Date(tariff.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            )}
          </div>
        </div>

        <div className="tv-channel-tag">
          Tarifa {channelNames[selectedChannel] || selectedChannel}
          <span style={{ fontSize: 9, marginLeft: 6, opacity: .6 }}>IVA incluido</span>
        </div>

        {DISPLAY_GROUPS.map(group => {
          // Skip section if no products have prices
          const hasAnyPrice = group.products.some(p => getPrice(p.id)) || group.boxes.some(b => getPrice(b.id));
          if (!hasAnyPrice) return null;

          return (
            <div key={group.title} className="tv-section">
              <div className="tv-sec-title" style={{
                background: group.bg,
                color: group.titleColor === '#C4A54D' ? '#C4A54D' : group.titleColor === '#5A4A2A' ? '#5A4A2A' : '#fff'
              }}>
                {group.title}
              </div>

              <div className="tv-products-row">
                {group.products.map(prod => {
                  const price = getPrice(prod.id);
                  if (!price) return null;
                  return (
                    <div key={prod.id} className="tv-product-card">
                      {productImages[prod.id] ? (
                        <img src={productImages[prod.id]} alt={prod.label} className="tv-prod-img" />
                      ) : (
                        <div className="tv-prod-emoji">{prod.id.includes('DL') ? '✨' : prod.id.includes('VO') ? '🌿' : prod.id.includes('MT') ? '🍾' : '📦'}</div>
                      )}
                      <div className="tv-prod-name">{prod.label}</div>
                      <div className="tv-prod-price">{price}</div>
                    </div>
                  );
                })}
              </div>

              {group.boxes.length > 0 && (
                <div className="tv-boxes-row">
                  {group.boxes.map(box => {
                    const price = getPrice(box.id);
                    if (!price) return null;
                    return (
                      <div key={box.id} className="tv-box-card">
                        <div className="tv-box-label">{box.label}</div>
                        <div className="tv-box-price">{price}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="tv-footer">
          <div className="tv-footer-line">CARRETERA A-333 KM. 59 · 29315 VILLANUEVA DE TAPIA (MÁLAGA, ESPAÑA)</div>
          <div className="tv-footer-line">TLF.: +34 952 75 01 22 · M: +34 683 61 33 31</div>
          <div className="tv-footer-line">www.aceitestapia.com · info@aceitestapia.com</div>
        </div>
      </div>
    </div>
  );
}
