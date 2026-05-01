<template>
  <div class="relationship-list">
    <div class="list-header">
      <span class="list-count">{{ relationships.length }} relaciones</span>
      <button class="btn btn-primary btn-sm" @click="showForm = !showForm">
        {{ showForm ? 'Cancelar' : 'Nueva RelaciÃ³n' }}
      </button>
    </div>

    <RelationshipForm
      v-if="showForm"
      :relationship="editingRelationship"
      @save="handleSave"
      @cancel="cancelForm"
    />

    <div class="list-items">
      <div v-if="!relationships.length" class="list-empty">
        <p>AÃºn no hay relaciones</p>
      </div>

      <div
        v-for="rel in relationships"
        :key="rel.id"
        class="list-item"
        :class="{ selected: relsStore.selectedRelationshipId === rel.id }"
        @click="selectRelationship(rel)"
      >
        <div class="rel-flow">
          <span class="rel-name">{{ getEntityName(rel.source_id) }}</span>
          <span class="rel-arrow">â†’</span>
          <span class="rel-name">{{ getEntityName(rel.target_id) }}</span>
        </div>
        <div class="rel-details">
          <span class="sentiment-badge" :class="rel.sentiment">
            {{ sentimentLabels[rel.sentiment] }}
          </span>
          <span v-if="rel.label" class="rel-label">{{ rel.label }}</span>
        </div>
        <div class="item-actions">
          <button class="btn btn-ghost btn-xs" @click.stop="startEdit(rel)">Editar</button>
          <button class="btn btn-danger btn-xs" @click.stop="handleDelete(rel)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRelationshipsStore } from '../stores/relationships'
import { useEntitiesStore } from '../stores/entities'
import { useStoriesStore } from '../stores/stories'
import RelationshipForm from './RelationshipForm.vue'

const relsStore = useRelationshipsStore()
const entitiesStore = useEntitiesStore()
const storiesStore = useStoriesStore()
const relationships = computed(() => relsStore.relationships)
const entities = computed(() => entitiesStore.entities)

const showForm = ref(false)
const editingRelationship = ref(null)

const sentimentLabels = {
  amicable: 'Amistoso',
  neutral: 'Neutral',
  antagonistic: 'AntagÃ³nico'
}

function getEntityName(id) {
  const entity = entities.value.find(e => e.id === id)
  return entity ? entity.name : '???'
}

function selectRelationship(rel) {
  relsStore.selectRelationship(rel.id)
}

function startEdit(rel) {
  editingRelationship.value = rel
  showForm.value = true
}

async function handleSave(data) {
  if (editingRelationship.value) {
    await relsStore.updateRelationship(
      editingRelationship.value.id,
      data.sourceId,
      data.targetId,
      data.sentiment,
      data.label,
      data.notes
    )
  } else {
    await relsStore.createRelationship(
      storiesStore.selectedStory.id,
      data.sourceId,
      data.targetId,
      data.sentiment,
      data.label,
      data.notes
    )
  }
  cancelForm()
}

async function handleDelete(rel) {
  if (confirm(`Â¿Eliminar esta relaciÃ³n?`)) {
    await relsStore.deleteRelationship(rel.id)
    if (relsStore.selectedRelationshipId === rel.id) {
      relsStore.selectRelationship(null)
    }
  }
}

function cancelForm() {
  showForm.value = false
  editingRelationship.value = null
}
</script>

<style scoped>
.relationship-list {
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
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
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

.rel-flow {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.rel-name {
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rel-arrow {
  color: var(--color-accent);
  font-weight: 700;
}

.rel-details {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sentiment-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.sentiment-badge.amicable {
  background: rgba(34, 197, 94, 0.2);
  color: var(--color-amicable);
}

.sentiment-badge.neutral {
  background: rgba(107, 114, 128, 0.2);
  color: var(--color-neutral);
}

.sentiment-badge.antagonistic {
  background: rgba(239, 68, 68, 0.2);
  color: var(--color-antagonistic);
}

.rel-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-style: italic;
}

.item-actions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
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
