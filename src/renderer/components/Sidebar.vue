<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h1 class="sidebar-title">Mapas de Relaciones</h1>
      <div class="story-section">
        <select
          v-if="stories.length"
          v-model="localSelected"
          class="story-select"
          @change="onSelectStory"
        >
          <option :value="null">-- Seleccionar Historia --</option>
          <option v-for="story in stories" :key="story.id" :value="story">
            {{ story.name }}
          </option>
        </select>
        <button class="btn btn-primary btn-sm" @click="toggleNewStory">
          {{ editingStory ? 'Cancelar' : 'Nueva Historia' }}
        </button>
      </div>

      <transition name="fade">
        <form v-if="editingStory" @submit.prevent="handleSaveStory" class="story-form">
          <input
            v-model="storyName"
            placeholder="Nombre de la historia"
            class="input input-sm"
            required
            autofocus
          />
          <input
            v-model="storyDesc"
            placeholder="DescripciÃ³n (opcional)"
            class="input input-sm"
          />
          <div class="story-form-actions">
            <button type="submit" class="btn btn-primary btn-sm">Guardar</button>
          </div>
        </form>
      </transition>

      <div v-if="selectedStory" class="story-actions">
        <button class="btn btn-ghost btn-xs" @click="startEditStory" title="Editar historia">
          Editar
        </button>
        <button class="btn btn-danger btn-xs" @click="handleDeleteStory" title="Eliminar historia">
          Eliminar
        </button>
      </div>
    </div>

    <div v-if="selectedStory" class="sidebar-content">
      <div class="tabs">
        <button
          class="tab"
          :class="{ active: activeTab === 'entities' }"
          @click="activeTab = 'entities'"
        >
          Entidades
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'relationships' }"
          @click="activeTab = 'relationships'"
        >
          Relaciones
        </button>
      </div>

      <div class="tab-content">
        <EntityList v-show="activeTab === 'entities'" />
        <RelationshipList v-show="activeTab === 'relationships'" />
      </div>
    </div>

    <div v-else class="sidebar-empty">
      <p>Crea o selecciona una historia para comenzar</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStoriesStore } from '../stores/stories'
import EntityList from './EntityList.vue'
import RelationshipList from './RelationshipList.vue'

const storiesStore = useStoriesStore()
const stories = computed(() => storiesStore.stories)
const selectedStory = computed(() => storiesStore.selectedStory)

const activeTab = ref('entities')
const editingStory = ref(false)
const storyName = ref('')
const storyDesc = ref('')
const localSelected = ref(null)

watch(storiesStore.selectedStory, (val) => {
  localSelected.value = val
})

function onSelectStory() {
  storiesStore.selectStory(localSelected.value)
}

function toggleNewStory() {
  if (editingStory.value) {
    editingStory.value = false
    storyName.value = ''
    storyDesc.value = ''
  } else {
    editingStory.value = true
    storyName.value = ''
    storyDesc.value = ''
  }
}

async function handleSaveStory() {
  if (!storyName.value.trim()) return
  await storiesStore.createStory(storyName.value, storyDesc.value)
  editingStory.value = false
  storyName.value = ''
  storyDesc.value = ''
}

function startEditStory() {
  editingStory.value = true
  storyName.value = selectedStory.value.name
  storyDesc.value = selectedStory.value.description || ''
}

async function handleDeleteStory() {
  if (confirm(`Â¿EstÃ¡s seguro de eliminar "${selectedStory.value.name}"? Esta acciÃ³n no se puede deshacer.`)) {
    await storiesStore.deleteStory(selectedStory.value.id)
    editingStory.value = false
  }
}
</script>

<style scoped>
.sidebar {
  width: 320px;
  min-width: 280px;
  background: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.story-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.story-select {
  flex: 1;
  background: var(--color-bg-surface-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;
}

.story-form {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.story-form-actions {
  display: flex;
  justify-content: flex-end;
}

.story-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
}

.tab {
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}

.tab:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-surface-elevated);
}

.tab.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.tab-content {
  flex: 1;
  overflow: hidden;
}

.sidebar-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
  padding: 6px 12px;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.btn-xs {
  padding: 3px 8px;
  font-size: 11px;
}

.btn-primary {
  background: var(--color-accent);
  color: white;
}

.btn-primary:hover {
  background: var(--color-accent-hover);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.btn-ghost:hover {
  color: var(--color-text-primary);
  border-color: var(--color-border-light);
}

.btn-danger {
  background: var(--color-danger);
  color: white;
}

.btn-danger:hover {
  background: var(--color-danger-hover);
}

.input {
  width: 100%;
  background: var(--color-bg-surface-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}

.input:focus {
  border-color: var(--color-accent);
}

.input-sm {
  padding: 6px 10px;
  font-size: 12px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
