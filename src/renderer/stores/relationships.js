import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRelationshipsStore = defineStore('relationships', () => {
  const relationships = ref([])
  const loading = ref(false)
  const selectedRelationshipId = ref(null)

  async function fetchRelationships(storyId) {
    if (!storyId) {
      relationships.value = []
      return
    }
    loading.value = true
    try {
      relationships.value = await window.electronAPI.relationships.listByStory(storyId)
    } catch (err) {
      console.error('Error al cargar relaciones:', err)
    } finally {
      loading.value = false
    }
  }

  async function createRelationship(storyId, sourceId, targetId, sentiment, label = '', notes = '') {
    const newRel = await window.electronAPI.relationships.create({
      storyId, sourceId, targetId, sentiment, label, notes
    })
    relationships.value.push(newRel)
    return newRel
  }

  async function updateRelationship(id, sourceId, targetId, sentiment, label, notes) {
    const updated = await window.electronAPI.relationships.update({
      id, sourceId, targetId, sentiment, label, notes
    })
    const index = relationships.value.findIndex(r => r.id === id)
    if (index !== -1) {
      relationships.value[index] = updated
    }
    return updated
  }

  async function deleteRelationship(id) {
    await window.electronAPI.relationships.delete({ id })
    relationships.value = relationships.value.filter(r => r.id !== id)
  }

  function selectRelationship(id) {
    selectedRelationshipId.value = id
  }

  return {
    relationships,
    loading,
    selectedRelationshipId,
    fetchRelationships,
    createRelationship,
    updateRelationship,
    deleteRelationship,
    selectRelationship
  }
})
