<template>
  <form @submit.prevent="handleSubmit" class="relationship-form">
    <div class="form-group">
      <label class="form-label">Origen</label>
      <select v-model="form.sourceId" class="input" required>
        <option :value="null" disabled>-- Seleccionar --</option>
        <option v-for="entity in entities" :key="entity.id" :value="entity.id">
          {{ typeLabels[entity.type] }}: {{ entity.name }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">Destino</label>
      <select v-model="form.targetId" class="input" required>
        <option :value="null" disabled>-- Seleccionar --</option>
        <option v-for="entity in entities" :key="entity.id" :value="entity.id">
          {{ typeLabels[entity.type] }}: {{ entity.name }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">Sentimiento</label>
      <select v-model="form.sentiment" class="input" required>
        <option value="amicable">Amistoso</option>
        <option value="neutral">Neutral</option>
        <option value="antagonistic">AntagÃ³nico</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">Etiqueta</label>
      <input v-model="form.label" class="input" placeholder="Ej: ama, odia, pertenece a..." />
    </div>

    <div class="form-group">
      <label class="form-label">Notas</label>
      <textarea v-model="form.notes" class="input textarea" rows="2" placeholder="Notas opcionales..."></textarea>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-ghost" @click="$emit('cancel')">Cancelar</button>
      <button type="submit" class="btn btn-primary">Guardar</button>
    </div>
  </form>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useEntitiesStore } from '../stores/entities'
import { useStoriesStore } from '../stores/stories'

const props = defineProps({
  relationship: { type: Object, default: null }
})

const emit = defineEmits(['save', 'cancel'])

const entitiesStore = useEntitiesStore()
const storiesStore = useStoriesStore()
const entities = computed(() => entitiesStore.entities)

const typeLabels = {
  person: 'Persona',
  object: 'Objeto',
  place: 'Lugar',
  group: 'Grupo'
}

const form = reactive({
  sourceId: null,
  targetId: null,
  sentiment: 'neutral',
  label: '',
  notes: ''
})

onMounted(() => {
  if (props.relationship) {
    form.sourceId = props.relationship.source_id
    form.targetId = props.relationship.target_id
    form.sentiment = props.relationship.sentiment
    form.label = props.relationship.label || ''
    form.notes = props.relationship.notes || ''
  }
})

function handleSubmit() {
  if (!form.sourceId || !form.targetId) return
  emit('save', { ...form })
}
</script>

<style scoped>
.relationship-form {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-surface-elevated);
}

.form-group {
  margin-bottom: 10px;
}

.form-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input {
  width: 100%;
  background: var(--color-bg-surface);
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

.textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
  padding: 6px 14px;
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
</style>
