# Focul care cunoaște — Aether Nomad

Site static, un singur folder, fără build. Toate paginile sunt HTML autonome, legate între ele.

## Pagini
- `index.html` — portal (pagina principală)
- `all-inclusive-univers.html` — consola muzicală (RO/EN/PT, sunet, 65 BPM)
- `atentia.html` · `respiratia.html` · `prezenta.html` — eseurile triadei
- `oracle-deck.html` — Oracle Deck (33 de cărți)

Linkurile sunt **relative**, deci toate fișierele trebuie să stea în același folder (cum sunt aici).

---

## Publicare — 3 variante

### A. Netlify Drop (cel mai rapid, fără cont, ~1 min)
1. Intră pe https://app.netlify.com/drop
2. Trage **tot folderul `site`** (sau arhiva) în pagină.
3. Primești instant un URL public. Gata.

### B. GitHub Pages (permanent, pe contul tău)
```bash
cd site
git init
git add .
git commit -m "Focul care cunoaste — site"
git branch -M main
git remote add origin https://github.com/<USER>/<REPO>.git
git push -u origin main
```
Apoi: repo → **Settings → Pages → Deploy from a branch → main / (root) → Save**.
Live la: `https://<USER>.github.io/<REPO>/`

### C. Pe reverb.ro (Next.js, repo reverb2)
Copiază toate fișierele în `public/` (ex. `public/focul/`). Devin live la
`reverb.ro/focul/index.html`, `reverb.ro/focul/oracle-deck.html` etc. Fără cod în plus.

---

## Continuăm ulterior
Toate fișierele sunt editabile direct. Următorii pași posibili: versiuni EN/PT pentru eseuri,
pagina Prezenței deja există, fișiere print-ready pentru Oracle Deck, listing Etsy/Amazon.
