export async function fetchRecommendations(itemId) {
 const res = await fetch(`/api/recommendations/${itemId}`);
if (!res.ok) throw new Error(`HTTP ${res.status}`);
return res.json();
}