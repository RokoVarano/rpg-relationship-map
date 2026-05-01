<template>
  <div class="graph-canvas" ref="canvasRef">
    <div v-if="!selectedStory" class="graph-placeholder">
      <h2>Selecciona una historia para ver el mapa</h2>
      <p>Crea entidades y relaciones para construir tu mapa de relaciones</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import cytoscape from 'cytoscape'
import { useStoriesStore } from '../stores/stories'
import { useEntitiesStore } from '../stores/entities'
import { useRelationshipsStore } from '../stores/relationships'

const storiesStore = useStoriesStore()
const entitiesStore = useEntitiesStore()
const relsStore = useRelationshipsStore()

const canvasRef = ref(null)
const selectedStory = computed(() => storiesStore.selectedStory)
const entities = computed(() => entitiesStore.entities)
const relationships = computed(() => relsStore.relationships)

let cy = null
let imgDir = ''
const imageCache = {}

const typeConfig = {
  person: { color: '#60a5fa', shape: 'ellipse' },
  object: { color: '#f59e0b', shape: 'rectangle' },
  place: { color: '#10b981', shape: 'hexagon' },
  group: { color: '#a78bfa', shape: 'octagon' }
}

const sentimentConfig = {
  amicable: { color: '#22c55e', lineStyle: 'solid', width: 2 },
  neutral: { color: '#6b7280', lineStyle: 'dashed', width: 2 },
  antagonistic: { color: '#ef4444', lineStyle: 'solid', width: 3 }
}

const sentimentLabels = {
  amicable: 'Amistoso',
  neutral: 'Neutral',
  antagonistic: 'Antagónico'
}

function getImageUrl(imagePath) {
  if (!imagePath) return null
  return imageCache[imagePath] || null
}

async function preloadImages() {
  for (const e of entities.value) {
    if (e.image_path && !imageCache[e.image_path]) {
      const dataUrl = await window.electronAPI.getImage(e.image_path)
      if (dataUrl) {
        imageCache[e.image_path] = dataUrl
      }
    }
  }
}

function buildElements() {
  const nodes = entities.value.map(e => {
    const data = { id: 'e-' + e.id, label: e.name, type: e.type, entityId: e.id }
    if (e.image_path) {
      data.image = getImageUrl(e.image_path)
    }
    return { data }
  })

  const edges = relationships.value.map(r => {
    const sentiment = sentimentConfig[r.sentiment]
    const label = r.label || sentimentLabels[r.sentiment]
    return {
      data: {
        id: 'r-' + r.id,
        source: 'e-' + r.source_id,
        target: 'e-' + r.target_id,
        label,
        sentiment: r.sentiment,
        relId: r.id
      }
    }
  })

  return [...nodes, ...edges]
}

function initCytoscape() {
  if (cy) {
    cy.destroy()
    cy = null
  }

  if (!selectedStory.value || !canvasRef.value) return

  const container = canvasRef.value
  container.innerHTML = ''

  cy = cytoscape({
    container,
    elements: buildElements(),
    style: [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'color': '#e4e4e7',
          'font-size': '12px',
          'font-weight': '500',
          'text-valign': 'bottom',
          'text-halign': 'center',
          'text-margin-y': 8,
          'text-outline-color': '#0f1117',
          'text-outline-width': 3,
          'text-wrap': 'wrap',
          'text-max-width': 80,
          'background-color': function(el) {
            return el.data('image') ? 'transparent' : (typeConfig[el.data('type')]?.color || '#888')
          },
          'shape': function(el) {
            return typeConfig[el.data('type')]?.shape || 'ellipse'
          },
          'width': 60,
          'height': 60,
          'background-image': function(el) {
            return el.data('image') || null
          },
          'background-fit': 'cover',
          'background-clip': 'node',
          'border-width': 2,
          'border-color': function(el) {
            return typeConfig[el.data('type')]?.color || '#888'
          },
          'border-opacity': 0.6,
          'padding': 0
        }
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          'target-arrow-color': function(el) {
            return sentimentConfig[el.data('sentiment')]?.color || '#888'
          },
          'line-color': function(el) {
            return sentimentConfig[el.data('sentiment')]?.color || '#888'
          },
          'width': function(el) {
            return sentimentConfig[el.data('sentiment')]?.width || 2
          },
          'line-style': function(el) {
            return sentimentConfig[el.data('sentiment')]?.lineStyle || 'solid'
          },
          'label': 'data(label)',
          'font-size': '10px',
          'color': '#a1a1aa',
          'text-background-color': '#0f1117',
          'text-background-opacity': 0.85,
          'text-background-padding': '3px',
          'text-background-shape': 'roundrectangle',
          'text-margin-y': -8,
          'text-rotation': 'autorotate'
        }
      },
      {
        selector: 'node:selected',
        style: {
          'border-width': 3,
          'border-color': '#818cf8',
          'border-opacity': 1
        }
      },
      {
        selector: 'edge:selected',
        style: {
          'width': function(el) {
            return (sentimentConfig[el.data('sentiment')]?.width || 2) + 2
          },
          'line-color': '#818cf8',
          'target-arrow-color': '#818cf8'
        }
      }
    ],
    layout: {
      name: 'cose',
      padding: 50,
      fit: true,
      animate: true,
      animationDuration: 500,
      randomize: true,
      nodeDimensionsIncludeLabels: true
    },
    userPanningEnabled: true,
    zoomingEnabled: true,
    boxSelectionEnabled: false,
    selectionType: 'single'
  })

  cy.on('tap', 'node', (event) => {
    entitiesStore.selectEntity(event.target.data('entityId'))
  })

  cy.on('tap', 'edge', (event) => {
    relsStore.selectRelationship(event.target.data('relId'))
  })

  cy.on('tap', (event) => {
    if (event.target === cy) {
      entitiesStore.selectEntity(null)
      relsStore.selectRelationship(null)
    }
  })
}

function updateElements() {
  if (!cy) return

  const elements = buildElements()
  const nodeIds = new Set(elements.filter(e => !e.data.source).map(e => e.data.id))
  const edgeIds = new Set(elements.filter(e => e.data.source).map(e => e.data.id))

  cy.nodes().forEach(node => {
    if (!nodeIds.has(node.data('id'))) {
      node.remove()
    }
  })

  cy.edges().forEach(edge => {
    if (!edgeIds.has(edge.data('id'))) {
      edge.remove()
    }
  })

  elements.forEach(el => {
    const existing = cy.getElementById(el.data.id)
    if (existing.length) {
      existing.data(el.data)
    } else {
      cy.add(el)
    }
  })

  cy.layout({
    name: 'cose',
    padding: 50,
    fit: true,
    animate: true,
    animationDuration: 300,
    randomize: false,
    nodeDimensionsIncludeLabels: true
  }).run()
}

watch([entities, relationships], async () => {
  if (cy) {
    await preloadImages()
    updateElements()
  }
}, { deep: true })

watch(selectedStory, async () => {
  await preloadImages()
  initCytoscape()
})

watch(() => entitiesStore.selectedEntityId, (id) => {
  if (!cy) return
  cy.elements().unselect()
  if (id) {
    const node = cy.getElementById('e-' + id)
    if (node.length) {
      node.select()
      cy.animate({ center: { eles: node }, zoom: 1.5, duration: 300 })
    }
  }
})

watch(() => relsStore.selectedRelationshipId, (id) => {
  if (!cy) return
  cy.elements().unselect()
  if (id) {
    const edge = cy.getElementById('r-' + id)
    if (edge.length) {
      edge.select()
    }
  }
})

onMounted(async () => {
  imgDir = await window.electronAPI.getImageDir()
  await preloadImages()
})

onUnmounted(() => {
  if (cy) {
    cy.destroy()
    cy = null
  }
})
</script>

<style scoped>
.graph-canvas {
  flex: 1;
  background:
    radial-gradient(circle at 50% 50%, #1a1d27 0%, #0f1117 100%),
    radial-gradient(circle, #252836 1px, transparent 1px);
  background-size: 100% 100%, 24px 24px;
  position: relative;
  overflow: hidden;
}

.graph-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
  text-align: center;
  padding: 40px;
}

.graph-placeholder h2 {
  font-size: 24px;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.graph-placeholder p {
  font-size: 14px;
}
</style>
