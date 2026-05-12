// Semantic embeddings using all-MiniLM-L6-v2 (~23MB, runs locally, no API key needed)
// First run will download the model automatically from HuggingFace CDN

let pipeline = null
let embedder = null

async function getEmbedder() {
  if (embedder) return embedder
  if (!pipeline) {
    const { pipeline: createPipeline } = await import('@xenova/transformers')
    pipeline = createPipeline
  }
  console.log('Loading embedding model (first time ~23MB download)...')
  embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  console.log('Embedding model ready.')
  return embedder
}

// Generate a 384-dimensional vector from text
async function embed(text) {
  const model = await getEmbedder()
  const output = await model(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data) 
}


function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0
  let dot = 0
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i]
  return dot 
}


function averageVectors(vectors) {
  if (!vectors.length) return null
  const dim = vectors[0].length
  const avg = new Array(dim).fill(0)
  for (const v of vectors) {
    for (let i = 0; i < dim; i++) avg[i] += v[i]
  }
  const norm = Math.sqrt(avg.reduce((s, x) => s + x * x, 0))
  return avg.map(x => x / (norm || 1))
}


function subtractVectors(profile, dislikedVectors, weight = 0.3) {
  if (!dislikedVectors.length) return profile
  const avg = averageVectors(dislikedVectors)
  return profile.map((x, i) => x - avg[i] * weight)
}

module.exports = { embed, cosineSimilarity, averageVectors, subtractVectors }