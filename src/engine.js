// ============================================================
// PRODUCT DEFINITIONS — From Excel "Libro1.xlsx"
// Each unit product has its own material costs.
// Box products multiply unit costs × quantity.
// ============================================================

// Unit products: individual items with explicit material costs
export const UNIT_PRODUCTS_TO = [
  { id: 'TO_PET_5L',    name: 'PET 5 L',     vol: 5,    units: 1,  envase: 0.33, tapon: 0.04, etiqueta: 0.03, contra: 0,    embalaje: 0 },
  { id: 'TO_PET_2L',    name: 'PET 2 L',     vol: 2,    units: 1,  envase: 0.32, tapon: 0.04, etiqueta: 0.03, contra: 0,    embalaje: 0 },
  { id: 'TO_PET_1L',    name: 'PET 1 L',     vol: 1,    units: 1,  envase: 0.23, tapon: 0.04, etiqueta: 0.04, contra: 0.01, embalaje: 0 },
  { id: 'TO_PET_500',   name: 'PET 500 ML',  vol: 0.5,  units: 1,  envase: 0.21, tapon: 0.04, etiqueta: 0.04, contra: 0.01, embalaje: 0 },
  { id: 'TO_PET_250',   name: 'PET 250 ML',  vol: 0.25, units: 1,  envase: 0.16, tapon: 0.04, etiqueta: 0.03, contra: 0.01, embalaje: 0 },
  { id: 'TO_MT_750',    name: 'MT 750 ML',   vol: 0.75, units: 1,  envase: 0.68, tapon: 0.15, etiqueta: 0.04, contra: 0.01, embalaje: 0 },
  { id: 'TO_MT_500',    name: 'MT 500 ML',   vol: 0.5,  units: 1,  envase: 0.29, tapon: 0.11, etiqueta: 0.04, contra: 0.01, embalaje: 0 },
  { id: 'TO_MT_250',    name: 'MT 250 ML',   vol: 0.25, units: 1,  envase: 0.21, tapon: 0.11, etiqueta: 0.04, contra: 0.01, embalaje: 0 },
  { id: 'TO_MT_100',    name: 'MT 100 ML',   vol: 0.1,  units: 1,  envase: 0.13, tapon: 0.04, etiqueta: 0.04, contra: 0,    embalaje: 0 },
  { id: 'TO_FC_250',    name: 'FC 250 ML',   vol: 0.25, units: 1,  envase: 0.46, tapon: 0.11, etiqueta: 0.04, contra: 0.01, embalaje: 0 },
];

// Box products: reference their unit product + qty + embalaje
export const BOX_PRODUCTS_TO = [
  { id: 'TO_CAJA_3x5L',     name: 'Caja 3×5L',      unitRef: 'TO_PET_5L',   qty: 3,  embalaje: 1 },
  { id: 'TO_CAJA_6x2L',     name: 'Caja 6×2L',      unitRef: 'TO_PET_2L',   qty: 6,  embalaje: 1 },
  { id: 'TO_CAJA_15x1L',    name: 'Caja 15×1L',     unitRef: 'TO_PET_1L',   qty: 15, embalaje: 1 },
  { id: 'TO_CAJA_28x500',   name: 'Caja 28×500ML',  unitRef: 'TO_PET_500',  qty: 28, embalaje: 1 },
  { id: 'TO_CAJA_24x250',   name: 'Caja 24×250ML',  unitRef: 'TO_PET_250',  qty: 24, embalaje: 1 },
  { id: 'TO_CAJA_15x750',   name: 'Caja 15×750ML',  unitRef: 'TO_MT_750',   qty: 15, embalaje: 1 },
  { id: 'TO_CAJA_24x500MT', name: 'Caja 24×500ML',  unitRef: 'TO_MT_500',   qty: 24, embalaje: 1 },
  { id: 'TO_CAJA_20x500MT', name: 'Caja 20×500ML',  unitRef: 'TO_MT_250',   qty: 20, embalaje: 1 },
  { id: 'TO_CAJA_94x100',   name: 'Caja 94×100ML',  unitRef: 'TO_MT_100',   qty: 94, embalaje: 1 },
  { id: 'TO_CAJA_9x250FC',  name: 'Caja 9×250ML',   unitRef: 'TO_FC_250',   qty: 9,  embalaje: 1 },
];

export const UNIT_PRODUCTS_VO = [
  { id: 'VO_LATA_5L',     name: 'Lata 5 L',       vol: 5,    units: 1,  envase: 2.23, tapon: 0,    etiqueta: 0,    contra: 0,    embalaje: 0 },
  { id: 'VO_LATA_750',    name: 'Lata 750 ML',    vol: 0.75, units: 1,  envase: 1.40, tapon: 0.20, etiqueta: 0.02, contra: 0.02, embalaje: 0 },
  { id: 'VO_LATA_250',    name: 'Lata 250 ML',    vol: 0.25, units: 1,  envase: 0.90, tapon: 0.08, etiqueta: 0.02, contra: 0.02, embalaje: 0 },
  { id: 'VO_BOT_500',     name: 'Botella 500 ML', vol: 0.5,  units: 1,  envase: 1.62, tapon: 0.20, etiqueta: 0.02, contra: 0.02, embalaje: 0 },
  { id: 'VO_BOT_250',     name: 'Botella 250 ML', vol: 0.25, units: 1,  envase: 1.30, tapon: 0.20, etiqueta: 0.02, contra: 0.02, embalaje: 0 },
];

// Delirium — Premium line (uses VO oil price)
// Materials: caja_interior, caja_exterior, tapon, dosificador, botella, tarjeta_sabor, etiqueta
export const UNIT_PRODUCTS_DL = [
  { id: 'DL_BOT_500', name: 'Delirium 500 ML', vol: 0.5, units: 1,
    envase: 0, tapon: 0, etiqueta: 0, contra: 0, embalaje: 0,
    // Extended materials (Delirium-specific)
    caja_interior: 0, caja_exterior: 0, dosificador: 0, botella: 0, tarjeta_sabor: 0,
    allChannels: true, // Sells on ALL channels even as unit
  },
];

export const BOX_PRODUCTS_DL = [
  // Add box formats here when defined
];

export const BOX_PRODUCTS_VO = [
  { id: 'VO_CAJA_4x5L',     name: 'Caja 4×5L',      unitRef: 'VO_LATA_5L',  qty: 4,  embalaje: 1 },
  { id: 'VO_CAJA_15x750',   name: 'Caja 15×750ML',  unitRef: 'VO_LATA_750', qty: 15, embalaje: 1 },
  { id: 'VO_CAJA_28x250',   name: 'Caja 28×250ML',  unitRef: 'VO_LATA_250', qty: 28, embalaje: 1 },
  { id: 'VO_CAJA_15x500',   name: 'Caja 15×500ML',  unitRef: 'VO_BOT_500',  qty: 15, embalaje: 1 },
  { id: 'VO_CAJA_30x250',   name: 'Caja 30×250ML',  unitRef: 'VO_BOT_250',  qty: 30, embalaje: 1 },
];

// ============================================================
// DEFAULT PARAMETERS
// ============================================================
export const DEFAULT_PARAMS = {
  poolred: 4.35,       // €/kg base oil price
  dif_pr_to: 0,        // Differential for TO
  dif_pr_vo: 1,        // Differential for VO (Premium)
  dif_pr_dl: 1,        // Differential for Delirium (Premium)
  coste_km: 0.05,      // €/km transport
  mo_litro: 0.40,      // € labour per litre
  margen_tienda: 0.475, // 47.5%
  margen_distrib: 0.07, // 7%
  margen_dl2: 0.34,     // 34%
  margen_horeca: 0.40,  // 40%
  margen_web: 0.70,     // 70%
  individ: 0.20,        // 20% individualidad
  iva_aceite: 0.04,     // 4%
  iva_na: 0.21,         // 21%
};

// ============================================================
// CALCULATION ENGINE — Exact replica of Excel formulas
// ============================================================

/**
 * Calculate price per litre from PoolRed + differential
 * Excel: A7 = PoolRed + Dif_PR (kg), B7 = A7 * 0.92 (litre)
 */
export function precioLitro(poolred, dif) {
  const kg = poolred + dif;
  return kg * 0.92; // density conversion
}

/**
 * Calculate all costs and prices for a UNIT product
 */
export function calcUnit(product, params, litrePrice) {
  const vol = product.vol;
  
  // Oil cost
  const aceite = litrePrice * vol;
  
  // Material costs — standard + Delirium extended
  const envase = product.envase;
  const tapon = product.tapon;
  const etiqueta = product.etiqueta;
  const contra = product.contra;
  const embalaje = product.embalaje;
  // Delirium extras (0 for non-Delirium products)
  const caja_interior = product.caja_interior || 0;
  const caja_exterior = product.caja_exterior || 0;
  const dosificador = product.dosificador || 0;
  const botella = product.botella || 0;
  const tarjeta_sabor = product.tarjeta_sabor || 0;
  
  // Labour
  const mo = params.mo_litro * vol;
  
  // Transport
  const transporte = vol * params.coste_km;
  
  // Coste sin aceite = all materials
  const coste_sa = envase + tapon + etiqueta + contra + embalaje + caja_interior + caja_exterior + dosificador + botella + tarjeta_sabor;
  
  // Individualidad
  const individ = (coste_sa + mo) * params.individ;
  
  // Coste real
  const coste_real = coste_sa + aceite;
  
  // Base price component
  const base = aceite * params.iva_aceite + aceite + (coste_sa + coste_sa * params.iva_na) + mo;
  
  // Delirium sells on ALL channels; regular units only Tienda + Web
  if (product.allChannels) {
    return {
      id: product.id, name: product.name, vol, isBox: false, allChannels: true,
      aceite, envase, tapon, etiqueta, contra, embalaje,
      caja_interior, caja_exterior, dosificador, botella, tarjeta_sabor,
      mo, transporte, individ, coste_sa, coste_real,
      tienda: base + (aceite * params.margen_tienda) + individ,
      distribucion: base + (aceite * params.margen_distrib),
      dl2: base + (aceite * params.margen_dl2),
      horeca: base + (aceite * params.margen_horeca) + transporte,
      web: base + (aceite * params.margen_web) + individ,
    };
  }
  
  // Regular unit: only Tienda and Web
  const tienda = base + (aceite * params.margen_tienda) + individ;
  const web = base + (aceite * params.margen_web) + individ;
  
  return {
    id: product.id, name: product.name, vol, isBox: false,
    aceite, envase, tapon, etiqueta, contra, embalaje,
    caja_interior, caja_exterior, dosificador, botella, tarjeta_sabor,
    mo, transporte, individ, coste_sa, coste_real,
    tienda, web,
    distribucion: null, dl2: null, horeca: null,
  };
}

/**
 * Calculate all costs and prices for a BOX product
 */
export function calcBox(boxProduct, unitProduct, params, litrePrice) {
  const qty = boxProduct.qty;
  const totalVol = unitProduct.vol * qty;
  
  // Oil cost
  const aceite = litrePrice * totalVol;
  
  // Materials = unit costs × qty
  const envase = unitProduct.envase * qty;
  const tapon = unitProduct.tapon * qty;
  const etiqueta = unitProduct.etiqueta * qty;
  const contra = unitProduct.contra * qty;
  const embalaje = boxProduct.embalaje;
  
  // Labour
  const mo = params.mo_litro * totalVol;
  
  // Transport
  const transporte = totalVol * params.coste_km;
  
  // Coste sin aceite
  const coste_sa = envase + tapon + etiqueta + contra + embalaje;
  
  // No individualidad for boxes
  const individ = 0;
  
  // Coste real
  const coste_real = coste_sa + aceite;
  
  // Price formulas for BOX — all 5 channels
  // Excel: S(tienda) = aceite*IVA + aceite + (coste_sa + coste_sa*IVA_NA) + MO + (aceite*margen_tienda) + individ
  // T(distrib) = aceite*IVA + aceite + (coste_sa + coste_sa*IVA_NA) + MO + (aceite*margen_distrib)
  // U(DL2)     = aceite*IVA + aceite + (coste_sa + coste_sa*IVA_NA) + MO + (aceite*margen_dl2)
  // V(horeca)  = aceite*IVA + aceite + (coste_sa + coste_sa*IVA_NA) + MO + (aceite*margen_horeca) + transporte
  // W(web)     = aceite*IVA + aceite + (coste_sa + coste_sa*IVA_NA) + MO + (aceite*margen_web) + individ
  
  const base = aceite * params.iva_aceite + aceite + (coste_sa + coste_sa * params.iva_na) + mo;
  
  const tienda = base + (aceite * params.margen_tienda) + individ;
  const distribucion = base + (aceite * params.margen_distrib);
  const dl2 = base + (aceite * params.margen_dl2);
  const horeca = base + (aceite * params.margen_horeca) + transporte;
  const web = base + (aceite * params.margen_web) + individ;
  
  return {
    id: boxProduct.id, name: boxProduct.name, vol: totalVol, isBox: true,
    qty, unitName: unitProduct.name,
    aceite, envase, tapon, etiqueta, contra, embalaje,
    mo, transporte, individ, coste_sa, coste_real,
    tienda, distribucion, dl2, horeca, web,
  };
}

/**
 * Calculate rounded prices (sin IVA) — like Hoja2
 */
export function roundedPrices(calc) {
  const sinIva = (p) => p ? Math.round(p / 1.04 * 100) / 100 : null;
  return {
    tienda_si: sinIva(calc.tienda),
    distribucion_si: sinIva(calc.distribucion),
    dl2_si: sinIva(calc.dl2),
    horeca_si: sinIva(calc.horeca),
    web_si: sinIva(calc.web),
    tienda_r: calc.tienda ? Math.round(calc.tienda) : null,
    distribucion_r: calc.distribucion ? Math.round(calc.distribucion) : null,
    dl2_r: calc.dl2 ? Math.round(calc.dl2) : null,
    horeca_r: calc.horeca ? Math.round(calc.horeca) : null,
    web_r: calc.web ? Math.round(calc.web) : null,
  };
}

/**
 * Calculate margin % and € for a given price
 */
export function marginAnalysis(price, costeReal) {
  if (!price || !costeReal) return { pct: 0, eur: 0 };
  const eur = price - costeReal;
  const pct = (eur / price) * 100;
  return { pct, eur };
}
