<template>
  <form @submit.prevent="handleSubmit" class="entity-form">
    <div class="form-group">
      <label class="form-label">Nombre</label>
      <input v-model="form.name" class="input" placeholder="Nombre de la entidad" required />
    </div>

    <div class="form-group">
      <label class="form-label">Tipo</label>
      <select v-model="form.type" class="input" required>
        <option value="person">Persona</option>
        <option value="object">Objeto</option>
        <option value="place">Lugar</option>
        <option value="group">Grupo</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">Imagen</label>
      <div class="image-upload">
        <div v-if="preview" class="image-preview">
          <img :src="preview" alt="Preview" />
          <button type="button" class="btn-remove-image" @click="removeImage">Ã—</button>
        </div>
        <label class="btn-upload">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            @change="onFileSelect"
            class="file-input"
          />
          Seleccionar imagen
        </label>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Notas</label>
      <textarea v-model="form.notes" class="input textarea" rows="3" placeholder="Notas opcionales..."></textarea>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-ghost" @click="$emit('cancel')">Cancelar</button>
      <button type="submit" class="btn btn-primary">Guardar</button>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useEntitiesStore } from '../stores/entities'
import { useStoriesStore } from '../stores/stories'

const props = defineProps({
  entity: { type: Object, default: null }
})

const emit = defineEmits(['save', 'cancel'])

const entitiesStore = useEntitiesStore()
const storiesStore = useStoriesStore()
const imgDir = ref('')

const form = reactive({
  name: '',
  type: 'person',
  notes: '',
  imagePath: ''
})

const preview = ref('')

onMounted(async () => {
  if (props.entity) {
    form.name = props.entity.name
    form.type = props.entity.type
    form.notes = props.entity.notes || ''
    form.imagePath = props.entity.image_path || ''
    if (form.imagePath) {
      const dataUrl = await window.electronAPI.getImage(form.imagePath)
      if (dataUrl) {
        preview.value = dataUrl
      }
    }
  }
})

function onFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async () => {
    const base64 = reader.result
    preview.value = base64
    const savedPath = await entitiesStore.uploadImage(file.name, base64)
    form.imagePath = savedPath
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  form.imagePath = ''
  preview.value = ''
}

function handleSubmit() {
  if (!form.name.trim()) return
  emit('save', { ...form })
}
</script>

<style scoped>
.entity-form {
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

.image-upload {
  display: flex;
  align-items: center;
  gap: 12px;
}

.image-preview {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-image {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  background: var(--color-danger);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-upload {
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-upload:hover {
  color: var(--color-text-primary);
  border-color: var(--color-border-light);
}

.file-input {
  display: none;
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
