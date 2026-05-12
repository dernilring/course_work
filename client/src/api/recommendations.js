//const BASE_URL = 'http://localhost:5000'
import API_URL from './config'
export async function fetchRecommendations(movieId) {
  const res = await fetch(`${API_URL}/api/recommendations/${movieId}`)
  if (!res.ok) throw new Error('Failed to fetch recommendations')
  return res.json()
}