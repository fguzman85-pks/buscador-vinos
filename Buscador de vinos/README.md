# 🍷 Buscador de Vinos — PWA para Colombia

Encuentra las mejores promociones de vinos en Dislicores, Éxito, Carulla, Rappi, Jumbo y La Recetta.

## Estructura del proyecto

```
buscador-vinos/
├── backend/          ← FastAPI + scrapers (Python)
│   ├── main.py
│   ├── scrapers/
│   └── requirements.txt
├── frontend/         ← React PWA (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   └── package.json
└── README.md
```

---

## 🚀 Despliegue paso a paso

### Paso 1 — Backend en Render (gratis)

1. Ve a [render.com](https://render.com) y crea una cuenta gratuita.
2. Haz clic en **New → Web Service**.
3. Conecta tu repositorio de GitHub (sube esta carpeta primero).
4. Configura el servicio:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free
5. Haz clic en **Deploy**.
6. Cuando termine, Render te dará una URL como:
   `https://buscador-vinos-api.onrender.com`
7. Guarda esa URL — la necesitarás en el frontend.

> **Nota:** El tier gratuito de Render "duerme" el servicio tras 15 min de inactividad.
> La primera consulta del día puede tardar ~30 seg en "despertar".

---

### Paso 2 — Frontend en Vercel (gratis)

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta gratuita.
2. Haz clic en **New Project → Import Git Repository**.
3. Configura el proyecto:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Agrega la variable de entorno:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://TU-APP.onrender.com/api`
   (reemplaza con tu URL de Render del Paso 1)
5. Haz clic en **Deploy**.
6. Vercel te dará una URL como:
   `https://buscador-vinos.vercel.app`

---

### Paso 3 — Instalar en tu celular como PWA

**En Android (Chrome):**
1. Abre la URL de Vercel en Chrome.
2. Toca el menú (⋮) → **"Agregar a pantalla de inicio"**.
3. Confirma → la app aparece como ícono en tu pantalla.

**En iPhone (Safari):**
1. Abre la URL en Safari.
2. Toca el botón compartir (□↑) → **"Agregar a inicio"**.
3. Confirma → aparece como app en tu pantalla.

---

## 💻 Desarrollo local

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API disponible en http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
# Crea .env con: VITE_API_URL=http://localhost:8000/api
npm run dev
# App disponible en http://localhost:5173
```

---

## 📡 Endpoints de la API

| Endpoint | Descripción |
|---|---|
| `GET /api/promotions` | Mejores promociones del día |
| `GET /api/search?q=malbec` | Buscar por cepa o nombre |
| `POST /api/refresh` | Forzar actualización del caché |
| `GET /api/stores` | Lista de tiendas soportadas |
| `GET /api/cepas` | Cepas populares para filtros |

Agrega `?refresh=true` a cualquier endpoint para ignorar el caché (1 hora por defecto).

---

## 🛒 Tiendas soportadas

| Tienda | Método | Notas |
|---|---|---|
| Dislicores | BeautifulSoup (HTML) | Tienda especializada en licores |
| Éxito | VTEX API (JSON) | Grupo Éxito |
| Carulla | VTEX API (JSON) | Grupo Éxito, premium |
| Rappi | REST API | Puede requerir ajustes si cambian su API |
| Jumbo | VTEX API (JSON) | Parte de Cencosud |
| La Recetta | BeautifulSoup (Shopify) | Tienda especializada en vinos |

---

## ⚠️ Notas importantes

- Los scrapers dependen de la estructura HTML/API de cada tienda. Si una tienda cambia su sitio, puede ser necesario actualizar el scraper correspondiente.
- Esta aplicación es para uso personal. Respeta los términos de servicio de cada tienda.
- El caché de 1 hora evita sobrecargar las tiendas con peticiones.
