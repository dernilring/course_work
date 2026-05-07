import { NavLink, Outlet } from 'react-router-dom'

import classes from './Layout.module.css'

export default function Layout() {
  function handleActive({ isActive }) {
    return isActive ? classes.active : ''
  }
  return (
    <>
      <header>
        <NavLink to="/liked" className={handleActive}>
          Liked
        </NavLink>
         <NavLink to="/disliked" className={handleActive}>
          Disliked
        </NavLink>
        <NavLink to="/watchedLater" className={handleActive}>
          Watch Later
        </NavLink>
        <NavLink to="/watched" className={handleActive}>
          Watched
        </NavLink>
      </header>
      <Outlet />
    </>
  )
}