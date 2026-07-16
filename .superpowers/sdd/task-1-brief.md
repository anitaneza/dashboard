# Task 1: CSS Restructure

**Goal:** Split `style.css` into `base.css` + `components.css`. base.css = variables, reset, grid, responsive, utility. components.css = card, nav, button, toggle, filter, notification.

**Files to Create:**
- `css/base.css`
- `css/components.css`

**Files to Modify:**
- `css/style.css` → menjadi `@import url('base.css'); @import url('components.css');`

## Constraints

Gunakan nilai CSS persis dari style.css yang ada. Jangan ubah warna, font, spacing — hanya pindahkan ke file yang tepat dengan struktur baru. Pertahankan font `Rajdhani` (display) dan `Inter` (body) — ini font dari Google Fonts yang sudah di-load di index.html.

## base.css Specification

1. Reset (baris 1 style.css): `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`
2. `:root` variables dari baris 3-13 style.css:
   ```css
   :root {
     --bg: #111214;
     --bg2: #1a1c20;
     --bg3: #22252b;
     --border: rgba(255,255,255,0.07);
     --text: #f0f0f0;
     --text-muted: #888;
     --accent: #00c8a0;
     --font-display: 'Rajdhani', sans-serif;
     --font-body: 'Inter', sans-serif;
   }
   ```
3. Body styles (baris 15-20)
4. `.sr-only` utility (baris 183) — `position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0);`
5. Grid layouts — pindahkan `cards-grid`, `charts-row`, `energy-tdl-grid`, `config-grid`, `grafik-grid` dan `.grafik-grid` (TAPI jangan sertakan blok .grafik-grid yang duplikat — hanya baris 245-260, bukan baris 218-242 yang ditimpa). Tunggu — grafik grid tidak perlu dipindahkan karena grafik tab dihapus. Tapi untuk keperluan jika ada refs, abaikan saja.
6. Layout: `.tab-content` (baris 67-68), `.cards-grid` (baris 71-76), `.charts-row` (baris 121-125), `.energy-tdl-grid` (baris 176-180), `.config-grid` (baris 263-267)
7. Section: `.energy-tdl-section` (144), `.section-divider` (146-150), `.energy-tdl-toolbar` (152), `.filter-bar` (185-191), `.filter-label` (193-196)
8. Tambah class `.hidden { display: none !important; }`
9. Tambah responsive query:
   ```css
   @media (max-width: 1024px) {
     .cards-grid { grid-template-columns: repeat(2, 1fr); }
   }
   @media (max-width: 768px) {
     .cards-grid, .charts-row, .energy-tdl-grid, .config-grid { grid-template-columns: 1fr; }
   }
   ```
10. Tambah `@media (prefers-reduced-motion)`:
    ```css
    @media (prefers-reduced-motion) {
      .slider, .slider::before, .filter-btn, .btn-save, .btn-ac, .btn-capture,
      .nav-tab, input:checked + .slider, input:checked + .slider::before { transition: none; }
    }
    ```

## components.css Specification

Pindahkan semua component styles dari style.css dengan penamaan class yang konsisten:

1. **Navigation**: `.navbar` (23-34), `.nav-tabs` (36), `.nav-tab` (38-55), `.nav-brand` (57-62), `.dot` (64)
2. **Cards**: `.card` (78-85), `.card-label` (87-92), `.card-value` (94-103), `.card-unit` (105-109)
3. **Card variants** (ganti nama jadi semantic):
   - `.card-blue` → `.card-daya` (gradient: #4a90e2 → #357abd)
   - `.card-teal` → `.card-energi` (gradient: #00c8a0 → #00977a)
   - `.card-purple` → `.card-thi` (gradient: #9b59b6 → #7d3c98)
   - `.card-pink` → `.card-cop` (gradient: #e040fb → #aa00ff)
   - `.card-orange` → `.card-suhu` (gradient: #ff7043 → #e64a19) — TUNGGU, ada .card-green dan .card-orange. Cek HTML mappings:
     - Dari index.html: card-blue = daya, card-teal = energi, card-purple = thi, card-pink = cop, card-orange = kelembaban, card-lavender = suhu? Mari mapping dari index.html. 
     - Sebenarnya saya harus cek index.html untuk mapping yang benar. Biarkan gradient warna tetap sama, hanya nama class yang berubah.
   - Mapping aman: 
     - `.card-blue` → `.card-daya` (gradient: 135deg, #4a90e2 → #357abd)
     - `.card-teal` → `.card-energi` (gradient: 135deg, #00c8a0 → #00977a)
     - `.card-purple` → `.card-thi` (gradient: 135deg, #9b59b6 → #7d3c98)
     - `.card-pink` → `.card-cop` (gradient: 135deg, #e040fb → #aa00ff)
     - `.card-orange` → `.card-kelembaban` (gradient: 135deg, #ff7043 → #e64a19)
     - `.card-lavender` → `.card-suhu` (gradient: 135deg, #7986cb → #5c6bc0)
     - `.card-green` → `.card-pir` (gradient: 135deg, #26a69a → #00796b)
     - `.card-red` → `.card-ac` (gradient: 135deg, #ef5350 → #c62828)
4. **Chart boxes**: `.chart-box` (127-132), `.chart-title` (134-141), `.chart-box-filtered` (182)
5. **Filter**: `.period-filter` (154-159), `.period-filter-btn` (161-174), `.filter-btn` (198-215), `.filter-btn.active`
6. **Config**: `.config-card` (269-274), `.config-card-wide` (276), `.config-card-title` (278-285), `.config-row` (287-299), `.config-input` (301-312), `.config-input:focus` (314-316), `.config-select`
7. **Toggle**: `.toggle-wrap` (319-323), `.toggle-label` (325-329), `.toggle-switch` (331-336), `.toggle-switch input` (338), `.slider` (340-360), `input:checked + .slider` (362-366)
8. **Buttons**: `.btn-save` (369-383), `.btn-capture` (385-396), `.btn-ac` (425-438), `.btn-ac-on` (439), `.btn-ac-off` (440)
9. **Capture**: `.capture-status` (398-402), `.capture-result` (404-417), `.manual-controls` (419-423)
10. Tambah `.section-title` untuk judul section:
    ```css
    .section-title {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
      color: var(--text);
    }
    ```
11. Tambah `:focus-visible` pada interactive elements:
    ```css
    .nav-tab:focus-visible,
    .filter-btn:focus-visible,
    .period-filter-btn:focus-visible,
    .btn-save:focus-visible,
    .btn-capture:focus-visible,
    .btn-ac:focus-visible,
    .config-input:focus-visible,
    .config-select:focus-visible,
    .toggle-switch input:focus-visible + .slider {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    ```

## style.css perubahan

Jadi hanya:
```css
@import url('base.css');
@import url('components.css');
```

## Hapus duplikasi CSS

Blok .grafik-grid lines 218-242 di style.css LAMA harus dihapus (ditimpa oleh lines 245-260). Setelah split, konten ini TIDAK perlu dipindahkan ke file baru.

## Report

Setelah selesai, tulis laporan ke `.superpowers/sdd/task-1-report.md` dengan format:
- Files created/modified
- Summary of changes
- Any concerns
