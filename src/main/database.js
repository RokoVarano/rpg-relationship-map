import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'

function getDbPath() {
  const appDir = app.isPackaged
    ? path.dirname(app.getPath('exe'))
    : path.join(process.cwd(), 'data')

  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true })
  }

  const imgDir = path.join(appDir, 'images')
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true })
  }

  return {
    dbPath: path.join(appDir, 'rpg-relationships.db'),
    imgDir
  }
}

let db

export function getDatabase() {
  if (db) return db

  const { dbPath, imgDir } = getDbPath()
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS entities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      story_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('person','object','place','group')),
      notes TEXT DEFAULT '',
      image_path TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS relationships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      story_id INTEGER NOT NULL,
      source_id INTEGER NOT NULL,
      target_id INTEGER NOT NULL,
      sentiment TEXT NOT NULL CHECK(sentiment IN ('amicable','neutral','antagonistic')),
      label TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES entities(id) ON DELETE CASCADE,
      FOREIGN KEY (target_id) REFERENCES entities(id) ON DELETE CASCADE
    );
  `)

  seedExampleData()

  return db
}

function seedExampleData() {
  const storyCount = db.prepare('SELECT COUNT(*) as count FROM stories').get()
  if (storyCount.count > 0) return

  const story = db.prepare(
    "INSERT INTO stories (name, description) VALUES (?, ?)"
  ).run(
    'Caperucita Roja',
    'Cuento clásico sobre una niña que viaja por el bosque para visitar a su abuelita, donde se encuentra con un astuto lobo.'
  )
  const storyId = story.lastInsertRowid

  const entities = db.prepare(
    'INSERT INTO entities (story_id, name, type, notes) VALUES (?, ?, ?, ?)'
  )

  const caperucita = entities.run(storyId, 'Caperucita Roja', 'person', 'Una niña inocente que lleva una capa roja').lastInsertRowid
  const lobo = entities.run(storyId, 'El Lobo', 'person', 'Un lobo astuto y hambriento que vive en el bosque').lastInsertRowid
  const abuelita = entities.run(storyId, 'La Abuelita', 'person', 'La anciana abuela de Caperucita, enferma en su cama').lastInsertRowid
  const lenador = entities.run(storyId, 'El Leñador', 'person', 'Un valiente leñador que trabaja en el bosque').lastInsertRowid
  const cazador = entities.run(storyId, 'El Cazador', 'person', 'Un cazador que conoce bien el bosque').lastInsertRowid
  const madre = entities.run(storyId, 'La Madre', 'person', 'La madre de Caperucita, preocupada por su hija').lastInsertRowid
  const cesta = entities.run(storyId, 'La Cesta', 'object', 'Una cesta con pasteles y vino para la abuelita').lastInsertRowid
  const bosque = entities.run(storyId, 'El Bosque', 'place', 'Un bosque oscuro y misterioso que separa la aldea de la casa de la abuelita').lastInsertRowid
  const casaAbuelita = entities.run(storyId, 'Casa de la Abuelita', 'place', 'Una pequeña casa al otro lado del bosque').lastInsertRowid
  const aldea = entities.run(storyId, 'La Aldea', 'place', 'La pequeña aldea donde vive Caperucita con su madre').lastInsertRowid
  const leñadores = entities.run(storyId, 'Gremio de Leñadores', 'group', 'La organización de leñadores del pueblo').lastInsertRowid

  const rels = db.prepare(
    'INSERT INTO relationships (story_id, source_id, target_id, sentiment, label, notes) VALUES (?, ?, ?, ?, ?, ?)'
  )

  rels.run(storyId, caperucita, abuelita, 'amicable', 'ama y visita', 'Caperucita adora a su abuelita y la visita regularmente')
  rels.run(storyId, abuelita, caperucita, 'amicable', 'adora', 'La abuelita adora a su nieta')
  rels.run(storyId, lobo, caperucita, 'antagonistic', 'acecha', 'El lobo planea engañar a Caperucita')
  rels.run(storyId, caperucita, lobo, 'neutral', 'confía (sin saber)', 'Caperucita no sabe que el lobo es peligroso')
  rels.run(storyId, lobo, abuelita, 'antagonistic', 'devora', 'El lobo se come a la abuelita')
  rels.run(storyId, lobo, cesta, 'antagonistic', 'desea', 'El lobo codicia lo que lleva Caperucita en la cesta')
  rels.run(storyId, caperucita, cesta, 'neutral', 'lleva', 'Caperucita lleva la cesta con comida')
  rels.run(storyId, madre, cesta, 'neutral', 'prepara', 'La madre prepara el contenido de la cesta')
  rels.run(storyId, madre, caperucita, 'amicable', 'protege', 'La madre envía a su hija con advertencias')
  rels.run(storyId, caperucita, bosque, 'neutral', 'atraviesa', 'Caperucita debe cruzar el bosque')
  rels.run(storyId, lobo, bosque, 'amicable', 'habita', 'El bosque es el hogar del lobo')
  rels.run(storyId, lenador, bosque, 'amicable', 'trabaja en', 'El leñador tala árboles en el bosque')
  rels.run(storyId, lenador, cazador, 'amicable', 'colabora con', 'Leñador y cazador trabajan juntos')
  rels.run(storyId, cazador, lobo, 'antagonistic', 'persigue', 'El cazador vigila al lobo peligroso')
  rels.run(storyId, lenador, lobo, 'antagonistic', 'derrota', 'El leñador abre al lobo y salva a la abuelita')
  rels.run(storyId, casaAbuelita, bosque, 'neutral', 'situada en', 'La casa está al borde del bosque')
  rels.run(storyId, aldea, bosque, 'neutral', 'conectada por', 'Un camino une la aldea con el bosque')
  rels.run(storyId, caperucita, aldea, 'amicable', 'vive en', 'Caperucita vive en la aldea con su madre')
  rels.run(storyId, lenador, leñadores, 'amicable', 'pertenece a', 'El leñador es miembro del gremio')
  rels.run(storyId, casaAbuelita, abuelita, 'neutral', 'pertenece a', 'La casa es de la abuelita')
}

export function getImgDir() {
  const { imgDir } = getDbPath()
  return imgDir
}

export const storyHandlers = {
  list: () => {
    const db = getDatabase()
    return db.prepare('SELECT * FROM stories ORDER BY created_at DESC').all()
  },
  create: ({ name, description = '' }) => {
    const db = getDatabase()
    const result = db.prepare('INSERT INTO stories (name, description) VALUES (?, ?)').run(name, description)
    return db.prepare('SELECT * FROM stories WHERE id = ?').get(result.lastInsertRowid)
  },
  update: ({ id, name, description }) => {
    const db = getDatabase()
    db.prepare('UPDATE stories SET name = ?, description = ? WHERE id = ?').run(name, description, id)
    return db.prepare('SELECT * FROM stories WHERE id = ?').get(id)
  },
  delete: ({ id }) => {
    const db = getDatabase()
    db.prepare('DELETE FROM stories WHERE id = ?').run(id)
    return { success: true }
  }
}

export const entityHandlers = {
  listByStory: ({ storyId }) => {
    const db = getDatabase()
    return db.prepare('SELECT * FROM entities WHERE story_id = ? ORDER BY name').all(storyId)
  },
  create: ({ storyId, name, type, notes = '', imagePath = '' }) => {
    const db = getDatabase()
    const result = db.prepare(
      'INSERT INTO entities (story_id, name, type, notes, image_path) VALUES (?, ?, ?, ?, ?)'
    ).run(storyId, name, type, notes, imagePath)
    return db.prepare('SELECT * FROM entities WHERE id = ?').get(result.lastInsertRowid)
  },
  update: ({ id, name, type, notes, imagePath }) => {
    const db = getDatabase()
    db.prepare(
      'UPDATE entities SET name = ?, type = ?, notes = ?, image_path = ? WHERE id = ?'
    ).run(name, type, notes, imagePath, id)
    return db.prepare('SELECT * FROM entities WHERE id = ?').get(id)
  },
  delete: ({ id }) => {
    const db = getDatabase()
    const entity = db.prepare('SELECT * FROM entities WHERE id = ?').get(id)
    if (entity && entity.image_path) {
      const { imgDir } = getDbPath()
      const imgPath = path.join(imgDir, entity.image_path)
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath)
      }
    }
    db.prepare('DELETE FROM entities WHERE id = ?').run(id)
    return { success: true }
  }
}

export const relationshipHandlers = {
  listByStory: ({ storyId }) => {
    const db = getDatabase()
    return db.prepare('SELECT * FROM relationships WHERE story_id = ? ORDER BY created_at DESC').all(storyId)
  },
  create: ({ storyId, sourceId, targetId, sentiment, label = '', notes = '' }) => {
    const db = getDatabase()
    const result = db.prepare(
      'INSERT INTO relationships (story_id, source_id, target_id, sentiment, label, notes) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(storyId, sourceId, targetId, sentiment, label, notes)
    return db.prepare('SELECT * FROM relationships WHERE id = ?').get(result.lastInsertRowid)
  },
  update: ({ id, sourceId, targetId, sentiment, label, notes }) => {
    const db = getDatabase()
    db.prepare(
      'UPDATE relationships SET source_id = ?, target_id = ?, sentiment = ?, label = ?, notes = ? WHERE id = ?'
    ).run(sourceId, targetId, sentiment, label, notes, id)
    return db.prepare('SELECT * FROM relationships WHERE id = ?').get(id)
  },
  delete: ({ id }) => {
    const db = getDatabase()
    db.prepare('DELETE FROM relationships WHERE id = ?').run(id)
    return { success: true }
  }
}
