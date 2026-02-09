# RosalieMyValentine.com 💌 (React + Vite)

Petit site "cards reveal" qui dévoile SAISON en 6 cartes.

## Démarrer en local
```bash
npm install
npm run dev
```

## Build (pour Netlify)
```bash
npm run build
```
Le dossier de sortie est `dist/`.

## Notes Netlify (SPA)
- `public/_redirects` est inclus pour éviter les 404 lors du refresh.
- `netlify.toml` est inclus pour config auto.


## Mode "1 carte par jour"
- Déverrouillage dans le fuseau **America/Montreal**
- Dates: **2026-02-09** à **2026-02-14**
- Pour tester une date sans attendre, ajoute `?date=YYYY-MM-DD` à l'URL, ex:
  - `/?date=2026-02-09`
