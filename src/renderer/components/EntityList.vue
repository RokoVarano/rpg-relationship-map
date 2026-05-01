<template>
  <div class="entity-list">
    <div class="list-header">
      <span class="list-count">{{ entities.length }} entidades</span>
      <button class="btn btn-primary btn-sm" @click="showForm = !showForm">
        {{ showForm ? 'Cancelar' : 'Nueva Entidad' }}
      </button>
    </div>

    <EntityForm
      v-if="showForm"
      :entity="editingEntity"
      @save="handleSave"
      @cancel="cancelForm"
    />

    <div class="list-items">
      <div v-if="!entities.length" class="list-empty">
        <p>AÃºn no hay entidades</p>
      </div>

      <div
        v-for="entity in entities"
        :key="entity.id"
        class="list-item"
        :class="{ selected: entitiesStore.selectedEntityId === entity.id }"
        @click="selectEntity(entity)"
      >
        <div class="item-icon" :class="entity.type">
          <template v-if="entity.image_path">
            <img :src="getImageUrl(entity.image_path)" :alt="entity.name" />
          </template>
          <template v-else>
            <span>{{ typeIcons[entity.type] }}</span>
          </template>
        </div>
        <div class="item-info">
          <span class="item-name">{{ entity.name }}</span>
          <span class="item-type">{{ typeLabels[entity.type] }}</span>
        </div>
        <div class="item-actions">
          <button class="btn btn-ghost btn-xs" @click.stop="startEdit(entity)">Editar</button>
          <button class="btn btn-danger btn-xs" @click.stop="handleDelete(entity)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useEntitiesStore } from '../stores/entities'
import { useStoriesStore } from '../stores/stories'
import EntityForm from './EntityForm.vue'

const entitiesStore = useEntitiesStore()
const storiesStore = useStoriesStore()
const entities = computed(() => entitiesStore.entities)

const showForm = ref(false)
const editingEntity = ref(null)
const imgDir = ref('')
const imageCache = ref({})

const typeIcons = {
  person: 'ðŸ‘¤',
  object: 'âš™',
  place: 'ðŸ“',
  group: 'ðŸ‘¥'
}

const typeLabels = {
  person: 'Persona',
  object: 'Objeto',
  place: 'Lugar',
  group: 'Grupo'
}

function selectEntity(entity) {
  entitiesStore.selectEntity(entity.id)
}

onMounted(async () => {
  imgDir.value = await window.electronAPI.getImageDir()
  // Preload images for current entities
  await preloadImages()
})

watch(() => entities.value, async (newEntities) => {
  if (newEntities && newEntities.length > 0) {
    await preloadImages()
  }
}, { deep: true })

async function preloadImages() {
  for (const entity of entities.value) {
    if (entity.image_path && !imageCache.value[entity.image_path]) {
      const dataUrl = await window.electronAPI.getImage(entity.image_path)
      if (dataUrl) {
        imageCache.value[entity.image_path] = dataUrl
      }
    }
  }
}

watch(() => storiesStore.selectedStory, () => {
  entitiesStore.selectEntity(null)
  editingEntity.value = null
  showForm.value = false
})

function getImageUrl(imagePath) {
  return imageCache.value[imagePath] || ''
}

function startEdit(entity) {
  editingEntity.value = entity
  showForm.value = true
}

async function handleSave(data) {
  if (editingEntity.value) {
    await entitiesStore.updateEntity(
      editingEntity.value.id,
      data.name,
      data.type,
      data.notes,
      data.imagePath || editingEntity.value.image_path
    )
  } else {
    await entitiesStore.createEntity(
      storiesStore.selectedStory.id,
      data.name,
      data.type,
      data.notes,
      data.imagePath
    )
  }
  cancelForm()
}

async function handleDelete(entity) {
  if (confirm(`Â¿Eliminar "${entity.name}"?`)) {
    await entitiesStore.deleteEntity(entity.id)
    if (entitiesStore.selectedEntityId === entity.id) {
      entitiesStore.selectEntity(null)
    }
  }
}

function cancelForm() {
  showForm.value = false
  editingEntity.value = null
}
</script>

<style scoped>
.entity-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.list-count {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.list-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.list-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.1s;
}

.list-item:hover {
  background: var(--color-bg-surface-elevated);
}

.list-item.selected {
  background: var(--color-bg-surface-elevated);
  border: 1px solid var(--color-accent);
}

.item-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  overflow: hidden;
}

.item-icon.person { background: rgba(96, 165, 250, 0.2); }
.item-icon.object { background: rgba(245, 158, 11, 0.2); }
.item-icon.place { background: rgba(16, 185, 129, 0.2); }
.item-icon.group { background: rgba(167, 139, 250, 0.2); }

.item-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-type {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.item-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}

.list-item:hover .item-actions {
  opacity: 1;
}

.btn {
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.15s;
  padding: 3px 8px;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.btn-xs {
  padding: 2px 6px;
  font-size: 10px;
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
}

.btn-danger {
  background: var(--color-danger);
  color: white;
}
</style>
