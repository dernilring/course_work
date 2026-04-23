export const getActions = () =>
  JSON.parse(localStorage.getItem("movieActions")) || {};

export const saveActions = (data) =>
  localStorage.setItem("movieActions", JSON.stringify(data));

export const getHistory = () =>
  JSON.parse(localStorage.getItem("history")) || [];

export const saveHistory = (data) =>
  localStorage.setItem("history", JSON.stringify(data));