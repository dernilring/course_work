import { getActions } from "../utils/storage";

const actions = getActions();

export const fetchRecommendations = async (itemId) => {
  const res = await fetch(
    `http://localhost:5000/api/recommendations/${itemId}`,
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // const data = res.json();
  // const filtered = data.filter((movie) => {
  //   const a = actions[movie.id];
  //   if (!a) return true;

  //   if (a.disliked) return false;
  //   if (a.watched) return false;

  //   return true;
  // });
  // return filtered;
  return res.json()
};
