

export const fetchRecommendations = async (itemId) => {
  const res = await fetch(`http://localhost:5000/api/recommendations/${itemId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
