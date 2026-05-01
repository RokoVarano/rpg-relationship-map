# Mapas de Relaciones RPG

Aplicación de escritorio para crear mapas de relaciones entre personajes de RPG. Visualiza conexiones entre entidades como un tablero de detective con hilos de colores.

## Características

- **Historias**: Crea mundos/escenarios independientes
- **Entidades**: Personas, Objetos, Lugares y Grupos con imágenes
- **Relaciones**: Conexiones direccionales y asimétricas con sentimientos (Amistoso, Neutral, Antagónico)
- **Mapa visual**: Tablero interactivo con nodos arrastrables y hilos curvos de colores
- **Portátil**: Base de datos SQLite junto al ejecutable

## Requisitos

- Node.js 18+
- npm

## Desarrollo

```bash
npm install
npm run dev
```

## Compilar

```bash
npm run dist
```

Los ejecutables se generan en la carpeta `release/`:
- **Linux**: `release/linux-unpacked/` (ejecutable `rpg-relationships`)
- **Windows**: `release/Mapas de Relaciones RPG-portable.exe` (requiere compilación en Windows o con Wine)

## Estructura

```
├── src/
│   ├── main/           # Proceso principal de Electron
│   │   ├── index.js    # Ventana, IPC, rutas
│   │   └── database.js # SQLite (CRUD historias, entidades, relaciones)
│   ├── preload/        # Puente IPC seguro
│   └── renderer/       # Interfaz Vue 3
│       ├── components/ # Sidebar, listas, formularios, GraphCanvas
│       ├── stores/     # Pinia (estado de la app)
│       └── styles/     # Tema oscuro Tailwind
├── vite.config.js
├── electron-builder.yml
└── package.json
```

## Datos

Los datos se almacenan localmente junto al ejecutable:
- `rpg-relationships.db` - Base de datos SQLite
- `images/` - Imágenes de las entidades

Eliminar la carpeta elimina todos los datos.
