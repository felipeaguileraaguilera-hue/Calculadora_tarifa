/* ============================================================
   ACEITES TAPIA — Calculadora de Precios
   Consistent with ecosystem, optimized for data-dense views
   ============================================================ */

:root {
  --o9:#2A3326; --o8:#3B4A36; --o6:#5A7255; --o4:#8FA889; --o2:#C4D9BF; --o0:#F0F9EE;
  --b9:#1A2016; --b8:#2A3326; --b6:#4B6848; --b5:#5A7255; --b4:#7A9A75; --b3:#8FA889; --b0:#F0F9EE;
  --tx:#1A2016; --tm:#4A5A46; --t2:#8A9A86;
  --rd:#C62828; --gn:#2E7D32; --am:#E6A817; --bl:#1565C0;
  font-family:'DM Sans','Segoe UI',sans-serif; font-size:13px; color:var(--tx);
  -webkit-font-smoothing:antialiased;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#F5F4F0;min-height:100vh}

/* App shell */
.app{max-width:960px;margin:0 auto;min-height:100vh;background:#FAFAF8;box-shadow:0 0 40px rgba(0,0,0,.06)}
.hdr{background:var(--o9);color:#fff;padding:10px 14px 0}
.hdr-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.logo-a{display:flex;align-items:center;gap:8px}
.logo-m{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,var(--am),#D4960F);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-weight:700;font-size:13px;color:var(--o9)}
.logo-t{font-family:'Playfair Display',serif;font-weight:700;font-size:14px}
.logo-s{font-size:9px;opacity:.65;letter-spacing:.5px}
.logout-btn-sm{background:0;border:1px solid rgba(255,255,255,.3);color:rgba(255,255,255,.8);padding:4px 10px;border-radius:6px;font-size:10px;cursor:pointer;font-family:inherit;transition:.2s}
.logout-btn-sm:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.5)}

/* Navigation */
.nav{display:flex;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;gap:2px;padding-bottom:0}
.nav::-webkit-scrollbar{display:none}
.nb{background:0;border:none;color:rgba(255,255,255,.6);padding:8px 10px;font-size:10px;font-weight:600;cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent;transition:.2s;font-family:inherit;flex:0 0 auto}
.nb:hover{color:rgba(255,255,255,.85)}
.nb.on{color:#fff;border-bottom-color:var(--am)}
.main{padding:12px}

/* Auth */
.auth{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(160deg,var(--o9) 0%,var(--o8) 50%,#2A4A2A 100%)}
.auth-box{background:#fff;border-radius:16px;padding:28px 24px;width:100%;max-width:380px;box-shadow:0 20px 60px rgba(0,0,0,.2)}
.auth-logo{text-align:center;margin-bottom:20px}
.auth-logo-m{width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--am),#D4960F);display:inline-flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-weight:700;font-size:18px;color:var(--o9);margin-bottom:8px}
.auth-logo-t{font-family:'Playfair Display',serif;font-weight:700;font-size:20px}
.auth-logo-s{font-size:11px;color:var(--tm)}
.auth-err{background:#FFEBEE;color:var(--rd);padding:8px 12px;border-radius:8px;font-size:11px;margin-bottom:12px}
.fg{margin-bottom:10px}
.fl{font-size:10px;font-weight:600;color:var(--tm);display:block;margin-bottom:3px}
.fi{width:100%;padding:8px 10px;border:1.5px solid #DDD;border-radius:8px;font-size:12px;font-family:inherit;color:var(--tx);transition:.15s}
.fi:focus{outline:none;border-color:var(--b4);box-shadow:0 0 0 3px rgba(90,114,85,.15)}
.bp{width:100%;padding:10px;background:var(--o9);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:.2s}
.bp:hover{background:var(--o8)}
.bp:disabled{opacity:.5;cursor:default}

/* Loading */
.loading{text-align:center;padding:60px 20px;color:var(--tm)}
.loading-spin{display:inline-block;width:24px;height:24px;border:3px solid var(--o2);border-top-color:var(--o6);border-radius:50%;animation:spin .6s linear infinite;margin-bottom:10px}
@keyframes spin{to{transform:rotate(360deg)}}

/* ============================================================
   PARAMETER EDITOR
   ============================================================ */
.params-panel{display:flex;flex-direction:column;gap:12px}
.params-section{background:#fff;border:1px solid #EEE;border-radius:10px;padding:12px}
.ps-title{font-size:12px;font-weight:700;margin-bottom:8px;color:var(--b9)}
.pe-row{display:flex;align-items:center;justify-content:space-between;padding:4px 0;gap:8px}
.pe-label{font-size:11px;color:var(--tm);flex:1}
.pe-input-wrap{display:flex;align-items:center;gap:4px}
.pe-input{width:72px;padding:4px 6px;border:1.5px solid #DDD;border-radius:6px;font-size:12px;text-align:right;font-family:inherit;color:var(--tx);transition:.15s}
.pe-input:focus{outline:none;border-color:var(--b4);box-shadow:0 0 0 2px rgba(90,114,85,.15)}
.pe-suffix{font-size:9px;color:var(--t2);min-width:30px}
.pe-derived{background:var(--o0);padding:8px;border-radius:6px;margin-top:8px;font-size:10px;color:var(--tm)}
.pe-derived div{margin-bottom:2px}
.pe-derived strong{color:var(--b9)}
.margin-grid .pe-row{border-bottom:1px solid #F5F5F5}

/* ============================================================
   MATERIAL EDITOR
   ============================================================ */
.mat-panel{background:#fff;border:1px solid #EEE;border-radius:10px;padding:12px;margin-bottom:12px}
.mat-table{overflow-x:auto}
.mat-header{display:flex;gap:4px;padding:4px 0;border-bottom:2px solid #EEE;font-size:9px;font-weight:600;color:var(--t2);text-transform:uppercase}
.mat-row{display:flex;gap:4px;padding:3px 0;border-bottom:1px solid #F5F5F5;align-items:center}
.mat-col-name{width:120px;flex-shrink:0;font-size:11px;font-weight:500;color:var(--tx)}
.mat-col{width:70px;flex-shrink:0;text-align:center}
.mat-input{width:66px;padding:3px 4px;border:1px solid #E5E5E5;border-radius:4px;font-size:11px;text-align:right;font-family:inherit;color:var(--tx)}
.mat-input:focus{outline:none;border-color:var(--b4);background:var(--o0)}

/* ============================================================
   PRICE TABLE
   ============================================================ */
.price-table-wrap{margin-bottom:12px}
.pt-header-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.pt-title{font-size:14px;font-weight:700;font-family:'Playfair Display',serif}
.chip-btn{background:var(--o0);border:1px solid var(--o2);color:var(--b6);padding:4px 10px;border-radius:6px;font-size:10px;font-weight:600;cursor:pointer;font-family:inherit;transition:.15s}
.chip-btn:hover{background:var(--b6);color:#fff;border-color:var(--b6)}
.pt-scroll{overflow-x:auto;border-radius:8px;border:1px solid #E0E0E0}

.pt{width:100%;border-collapse:collapse;font-size:11px}
.pt thead{position:sticky;top:0;z-index:2}
.pt-th-name{text-align:left;padding:8px 10px;background:var(--o9);color:#fff;font-weight:600;font-size:9px;text-transform:uppercase;position:sticky;left:0;z-index:3;min-width:120px}
.pt-th-vol{text-align:center;padding:6px 4px;background:var(--o9);color:#fff;font-weight:600;font-size:9px;width:45px}
.pt-th{text-align:center;padding:6px 6px;background:var(--o9);color:#fff;font-weight:600;font-size:9px;min-width:65px}

/* Channel color coding */
.c-tienda{background:rgba(230,168,23,.08) !important}
.c-distrib{background:rgba(21,101,194,.06) !important}
.c-dl2{background:rgba(156,39,176,.06) !important}
.c-horeca{background:rgba(46,125,50,.08) !important}
.c-web{background:rgba(198,40,40,.06) !important}
.c-highlight{background:rgba(26,32,22,.06) !important}
thead .c-tienda,thead .c-distrib,thead .c-dl2,thead .c-horeca,thead .c-web{background:var(--o8) !important}

.pt-row-unit{background:#FAFAF8}
.pt-row-box{background:#fff}
.pt-row-unit td{border-bottom:1px solid #F0F0F0}
.pt-row-box td{border-bottom:1px solid #E8E8E8}

.pt-td-name{padding:5px 10px;position:sticky;left:0;background:inherit;z-index:1}
.pt-prod-name{font-weight:600;font-size:11px}
.pt-prod-sub{font-size:9px;color:var(--t2)}
.pt-td-vol{text-align:center;padding:4px;font-size:10px;color:var(--tm)}
.pt-td{text-align:center;padding:4px 6px}
.pt-price{font-weight:700;font-size:12px;color:var(--b9)}
.pt-margin{font-size:8px;color:var(--t2)}

/* Tariff table */
.tariff-wrap{margin-bottom:12px}
.tariff-table .pt-td{font-size:13px}
.tariff-table .pt-row-unit{background:#F8F6F0}
.tariff-table .pt-row-box{background:#fff}
.sync-btn{background:var(--b6);color:#fff;border:none;padding:6px 14px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:.2s}
.sync-btn:hover{background:var(--b8)}
.sync-btn:disabled{opacity:.5;cursor:default}
.sync-result{padding:6px 12px;border-radius:6px;font-size:11px;margin-bottom:8px}
.sync-result.success{background:#E8F5E9;color:var(--gn)}
.sync-result.has-errors{background:#FFF3E0;color:#E65100}

/* ============================================================
   SIMULATOR
   ============================================================ */
.sim-panel{background:#fff;border:1px solid #EEE;border-radius:10px;padding:12px}
.sim-input-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.sim-input{font-size:16px !important;font-weight:700 !important;width:90px !important;padding:6px 8px !important}
.sim-diff{font-size:11px;color:var(--tm);margin-top:6px;margin-bottom:4px}
.sim-table .pt-td{font-size:10px}

/* ============================================================
   TARIFF VIEWER — Commercial document layout
   ============================================================ */
.tv-wrap{position:relative}
.tv-controls{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.tv-ch-btn{padding:4px 10px;border:1.5px solid #DDD;border-radius:6px;background:#fff;font-size:10px;font-weight:600;cursor:pointer;font-family:inherit;transition:.15s}
.tv-ch-btn:hover{border-color:var(--b4)}
.tv-ch-btn.active{background:var(--b6);color:#fff;border-color:var(--b6)}
.tv-print-btn{padding:4px 12px;border:none;background:var(--b6);color:#fff;border-radius:6px;font-size:10px;font-weight:600;cursor:pointer;font-family:inherit}
.tv-close-btn{padding:4px 10px;border:1.5px solid #DDD;border-radius:6px;background:#fff;font-size:12px;cursor:pointer}

.tv-doc{background:#fff;border:1px solid #E0E0E0;border-radius:4px;overflow:hidden;max-width:700px;margin:0 auto}
.tv-header{display:flex;align-items:center;gap:12px;padding:20px 24px;background:linear-gradient(135deg,#1A2016,#2A3326);color:#fff}
.tv-logo-mark{width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,#C4A54D,#D4960F);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-weight:700;font-size:18px;color:#1A2016;flex-shrink:0}
.tv-brand{flex:1}
.tv-brand-name{font-family:'Playfair Display',serif;font-weight:700;font-size:18px;letter-spacing:2px}
.tv-brand-sub{font-size:9px;opacity:.6;margin-top:2px}
.tv-tariff-info{text-align:right}
.tv-tariff-code{font-size:10px;opacity:.6}
.tv-tariff-name{font-weight:600;font-size:12px}
.tv-tariff-date{font-size:9px;opacity:.7;margin-top:2px}

.tv-channel-tag{text-align:center;padding:6px;background:var(--o0);font-size:11px;font-weight:700;color:var(--b6);text-transform:uppercase;letter-spacing:1px}

.tv-section{margin:0;border-bottom:1px solid #EEE}
.tv-sec-title{padding:10px 20px;font-family:'Playfair Display',serif;font-weight:700;font-size:14px;letter-spacing:1px}
.tv-products-row{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;padding:12px 16px 6px}
.tv-product-card{text-align:center;width:110px;padding:8px 4px}
.tv-prod-emoji{font-size:28px;margin-bottom:4px}
.tv-prod-name{font-size:8px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:.3px;line-height:1.3;min-height:28px}
.tv-prod-price{font-family:'Playfair Display',serif;font-weight:700;font-size:18px;color:var(--b9);margin-top:4px}

.tv-boxes-row{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;padding:4px 16px 12px}
.tv-box-card{background:#FAFAF8;border:1px solid #EEE;border-radius:6px;padding:6px 10px;text-align:center;min-width:90px}
.tv-box-label{font-size:8px;font-weight:600;color:#888;text-transform:uppercase}
.tv-box-price{font-weight:700;font-size:14px;color:var(--b9);margin-top:2px}

.tv-footer{text-align:center;padding:16px 20px;background:#1A2016;color:rgba(255,255,255,.7)}
.tv-footer-line{font-size:8px;letter-spacing:.5px;margin-bottom:2px}

/* Toast */
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--b8);color:#fff;padding:10px 20px;border-radius:24px;font-size:12px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.2);z-index:1000;animation:toastin .3s}
@keyframes toastin{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

/* ============================================================
   PRINT STYLES
   ============================================================ */
@media print {
  .hdr,.nav,.chip-btn,.sync-btn,.logout-btn-sm,.no-print,.tv-controls{display:none !important}
  .app{box-shadow:none;max-width:100%}
  .main{padding:0}
  body{background:#fff}
  .tv-doc{border:none;max-width:100%}
  .params-panel,.mat-panel,.sim-panel{page-break-inside:avoid}
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media(max-width:600px) {
  .pt-th-name,.pt-td-name{min-width:90px;padding:4px 6px}
  .pt-th,.pt-td{min-width:55px;padding:3px 4px}
  .pe-row{flex-wrap:wrap}
  .pe-label{min-width:100%}
}
