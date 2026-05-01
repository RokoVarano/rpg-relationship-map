import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStoriesStore = defineStore('stories', () => {
  const stories = ref([])
  const selectedStory = ref(null)
  const loading = ref(false)

  async function fetchStories() {
    loading.value = true
    try {
      stories.value = await window.electronAPI.stories.list()
    } catch (err) {
      console.error('[Stories] Error al cargar historias:', err)
    } finally {
      loading.value = false
    }
  }

  async function createStory(name, description = '') {
    const newStory = await window.electronAPI.stories.create({ name, description })
    stories.value.unshift(newStory)
    if (!selectedStory.value) {
      selectedStory.value = newStory
    }
    return newStory
  }

  async function updateStory(id, name, description) {
    const updated = await window.electronAPI.stories.update({ id, name, description })
    const index = stories.value.findIndex(s => s.id === id)
    if (index !== -1) {
      stories.value[index] = updated
      if (selectedStory.value?.id === id) {
        selectedStory.value = updated
      }
    }
    return updated
  }

  async function deleteStory(id) {
    await window.electronAPI.stories.delete({ id })
    stories.value = stories.value.filter(s => s.id !== id)
    if (selectedStory.value?.id === id) {
      selectedStory.value = stories.value[0] || null
    }
  }

  function selectStory(story) {
    selectedStory.value = story
  }

  return {
    stories,
    selectedStory,
    loading,
    fetchStories,
    createStory,
    updateStory,
    deleteStory,
    selectStory
  }
})
