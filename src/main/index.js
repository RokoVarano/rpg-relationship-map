import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getAppRoot() {
  if (app.isPackaged) {
    return path.dirname(app.getPath('exe'))
  }
  return path.resolve(__dirname, '../..')
}

function getPreloadPath() {
  if (app.isPackaged) {
    return path.join(app.getAppPath(), 'dist', 'electron', 'preload.js')
  }
  return path.resolve(__dirname, '../preload/index.js')
}

function getRendererPath() {
  if (process.env.VITE_DEV_SERVER_URL) {
    return process.env.VITE_DEV_SERVER_URL
  }
  if (app.isPackaged) {
    return path.join(app.getAppPath(), 'dist', 'renderer', 'index.html')
  }
  return path.resolve(getAppRoot(), 'dist', 'renderer', 'index.html')
}

import {
  storyHandlers,
  entityHandlers,
  relationshipHandlers,
  getDatabase,
  getImgDir
} from './database.js'

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'Mapas de Relaciones RPG',
    backgroundColor: '#0f1117',
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  const rendererPath = getRendererPath()
  if (rendererPath.startsWith('http')) {
    mainWindow.loadURL(rendererPath)
  } else {
    mainWindow.loadFile(rendererPath)
  }
}

app.whenReady().then(() => {
  getDatabase()

  ipcMain.handle('stories:list', () => storyHandlers.list())
  ipcMain.handle('stories:create', (_, data) => storyHandlers.create(data))
  ipcMain.handle('stories:update', (_, data) => storyHandlers.update(data))
  ipcMain.handle('stories:delete', (_, data) => storyHandlers.delete(data))

  ipcMain.handle('entities:listByStory', (_, storyId) => entityHandlers.listByStory({ storyId }))
  ipcMain.handle('entities:create', (_, data) => entityHandlers.create(data))
  ipcMain.handle('entities:update', (_, data) => entityHandlers.update(data))
  ipcMain.handle('entities:delete', (_, data) => entityHandlers.delete(data))
  ipcMain.handle('entities:uploadImage', async (_, { fileName, data: base64Data }) => {
    const imgDir = getImgDir()
    const ext = path.extname(fileName)
    const uniqueName = `entity-${Date.now()}${ext}`
    const imgPath = path.join(imgDir, uniqueName)
    const buffer = Buffer.from(base64Data.split(',')[1], 'base64')
    fs.writeFileSync(imgPath, buffer)
    return { imagePath: uniqueName }
  })

  ipcMain.handle('relationships:listByStory', (_, storyId) => relationshipHandlers.listByStory({ storyId }))
  ipcMain.handle('relationships:create', (_, data) => relationshipHandlers.create(data))
  ipcMain.handle('relationships:update', (_, data) => relationshipHandlers.update(data))
  ipcMain.handle('relationships:delete', (_, data) => relationshipHandlers.delete(data))

  ipcMain.handle('getImageDir', () => getImgDir())

  ipcMain.handle('entities:getImage', (_, imagePath) => {
    const imgDir = getImgDir()
    const fullPath = path.join(imgDir, imagePath)
    if (fs.existsSync(fullPath)) {
      const buffer = fs.readFileSync(fullPath)
      const ext = path.extname(imagePath).slice(1).toLowerCase()
      const mimeType = ext === 'jpg' ? 'jpeg' : ext
      return `data:image/${mimeType};base64,${buffer.toString('base64')}`
    }
    return null
  })

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
