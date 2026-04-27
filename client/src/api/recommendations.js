const BASE_URL = 'http://localhost:5000'

export async function fetchRecommendations(movieId) {
  const res = await fetch(`${BASE_URL}/api/recommendations/${movieId}`)
  if (!res.ok) throw new Error('Failed to fetch recommendations')
  return res.json()
}