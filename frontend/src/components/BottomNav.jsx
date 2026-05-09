import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiCalendar, FiSearch , FiCheckSquare} from 'react-icons/fi';

const items = [
  { to: '/notes',    Icon: FiHome,       label: 'Accueil'   },
  { to: '/tasks',    Icon: FiCheckSquare,  label: 'Tâches'    },
  { to: '/calendar', Icon: FiCalendar,   label: 'Agenda'    },
  { to: '/search',   Icon: FiSearch,     label: 'Recherche' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="bottom-nav">
      {items.map(({ to, Icon, label }) => {
        const active = pathname === to;
        return (
          <Link key={to} to={to} className={`nav-item${active ? ' active' : ''}`}>
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}