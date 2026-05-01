import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEntitiesStore = defineStore('entities', () => {
  const entities = ref([])
  const loading = ref(false)
  const selectedEntityId = ref(null)

  async function fetchEntities(storyId) {
    if (!storyId) {
      entities.value = []
      return
    }
    loading.value = true
    try {
      entities.value = await window.electronAPI.entities.listByStory(storyId)
    } catch (err) {
      console.error('Error al cargar entidades:', err)
    } finally {
      loading.value = false
    }
  }

  async function createEntity(storyId, name, type, notes = '') {
    const newEntity = await window.electronAPI.entities.create({
      storyId, name, type, notes
    })
    entities.value.push(newEntity)
    return newEntity
  }

  async function updateEntity(id, name, type, notes, imagePath) {
    const updated = await window.electronAPI.entities.update({
      id, name, type, notes, imagePath
    })
    const index = entities.value.findIndex(e => e.id === id)
    if (index !== -1) {
      entities.value[index] = updated
    }
    return updated
  }

  async function deleteEntity(id) {
    await window.electronAPI.entities.delete({ id })
    entities.value = entities.value.filter(e => e.id !== id)
  }

  async function uploadImage(fileName, base64Data) {
    const result = await window.electronAPI.entities.uploadImage({
      fileName,
      data: base64Data
    })
    return result.imagePath
  }

  function selectEntity(id) {
    selectedEntityId.value = id
  }

  return {
    entities,
    loading,
    selectedEntityId,
    fetchEntities,
    createEntity,
    updateEntity,
    deleteEntity,
    uploadImage,
    selectEntity
  }
})
