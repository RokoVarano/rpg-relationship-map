<template>
  <div class="app">
    <Sidebar />
    <GraphCanvas />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useStoriesStore } from './stores/stories'
import { useEntitiesStore } from './stores/entities'
import { useRelationshipsStore } from './stores/relationships'
import Sidebar from './components/Sidebar.vue'
import GraphCanvas from './components/GraphCanvas.vue'

const storiesStore = useStoriesStore()
const entitiesStore = useEntitiesStore()
const relsStore = useRelationshipsStore()

onMounted(async () => {
  await storiesStore.fetchStories()
  if (storiesStore.stories.length && !storiesStore.selectedStory) {
    storiesStore.selectStory(storiesStore.stories[0])
  }
})

watch(() => storiesStore.selectedStory, async (story) => {
  if (story) {
    await entitiesStore.fetchEntities(story.id)
    await relsStore.fetchRelationships(story.id)
  }
})
</script>

<style scoped>
.app {
  display: flex;
  height: 100%;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}
</style>
