import { Link, useLocation } from "react-router-dom";

export default function Nav() {
  return (
    <nav className="main-nav-wrapper accent2">
        <ul>
          <CustomLink to="/">Home</CustomLink>
          <CustomLink to="/clan-members">Clan Members</CustomLink>
          <CustomLink to="/clan-war-info">Clan War Info</CustomLink>
        </ul>
      </nav>
  );
}

function CustomLink({ to, children, ...props }) {
  const location = useLocation(); // Hook to get the current location
  const isActive = location.pathname === to; // Check if the current path matches the `to` prop

  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
}