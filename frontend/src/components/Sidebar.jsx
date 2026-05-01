import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const allLinks = [
    { to: '/dashboard',    icon: '📊', label: 'Dashboard',       roles: ['admin','enseignant','surveillant','comptable','delegue','etudiant'] },
    { to: '/classes',      icon: '🏫', label: 'Classes',         roles: ['admin','surveillant'] },
    { to: '/enseignants',  icon: '👨‍🏫', label: 'Enseignants',   roles: ['admin','surveillant'] },
    { to: '/matieres',     icon: '📚', label: 'Matières',        roles: ['admin'] },
    { to: '/salles',       icon: '🚪', label: 'Salles',          roles: ['admin'] },
    { to: '/emploi-temps', icon: '📆', label: 'Emploi du temps', roles: ['admin','enseignant','delegue','etudiant'] },
    { to: '/pointage',     icon: '✅', label: 'Pointage',        roles: ['admin','surveillant','enseignant'] },
    { to: '/cahier',       icon: '📓', label: 'Cahier de texte', roles: ['admin','enseignant','surveillant'] },
    { to: '/vacations',    icon: '💰', label: 'Vacations',       roles: ['admin','enseignant','comptable'] },
    { to: '/logs',         icon: '📋', label: 'Journaux',        roles: ['admin'] },
];

export default function Sidebar({ visible, darkMode }) {
    const { user } = useAuth();
    const role = user?.role || '';

    const links = allLinks.filter(l => l.roles.includes(role));

    return (
        <div style={{
            width: visible ? '220px' : '0',
            overflow: 'hidden',
            transition: 'width 0.3s ease',
            background: darkMode ? '#0f172a' : '#1a3a5c',
            minHeight: '100vh',
            flexShrink: 0,
        }}>
            <div style={{ width: '220px', paddingTop: '10px' }}>
                {links.map(l => (
                    <NavLink
                        key={l.to}
                        to={l.to}
                        className={({ isActive }) =>
                            `d-block px-3 py-2 text-decoration-none ${isActive ? 'fw-bold' : ''}`
                        }
                        style={({ isActive }) => ({
                            color: isActive ? '#f59e0b' : '#cbd5e1',
                            background: isActive ? 'rgba(245,158,11,0.1)' : 'transparent',
                            borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent',
                            fontSize: '0.9rem',
                        })}
                    >
                        {l.icon} {l.label}
                    </NavLink>
                ))}
            </div>
        </div>
    );
}