const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  stories: {
    list: () => ipcRenderer.invoke('stories:list'),
    create: (data) => ipcRenderer.invoke('stories:create', data),
    update: (data) => ipcRenderer.invoke('stories:update', data),
    delete: (data) => ipcRenderer.invoke('stories:delete', data)
  },
  entities: {
    listByStory: (storyId) => ipcRenderer.invoke('entities:listByStory', storyId),
    create: (data) => ipcRenderer.invoke('entities:create', data),
    update: (data) => ipcRenderer.invoke('entities:update', data),
    delete: (data) => ipcRenderer.invoke('entities:delete', data),
    uploadImage: (data) => ipcRenderer.invoke('entities:uploadImage', data)
  },
  relationships: {
    listByStory: (storyId) => ipcRenderer.invoke('relationships:listByStory', storyId),
    create: (data) => ipcRenderer.invoke('relationships:create', data),
    update: (data) => ipcRenderer.invoke('relationships:update', data),
    delete: (data) => ipcRenderer.invoke('relationships:delete', data)
  },
  getImageDir: () => ipcRenderer.invoke('getImageDir'),
  getImage: (imagePath) => ipcRenderer.invoke('entities:getImage', imagePath)
})
