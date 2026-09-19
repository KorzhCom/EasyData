import { useState } from 'react';
import { NavLink } from 'react-router';
import './NavMenu.css';

const links = [
    { to: '/', text: 'Home', end: true },
    { to: '/counter', text: 'Counter' },
    { to: '/fetch-data', text: 'Fetch data' },
    { to: '/easydata', text: 'EasyData' },
];

export default function NavMenu() {
    const [collapsed, setCollapsed] = useState(true);

    return (
        <header>
            <nav className="navbar navbar-expand-sm navbar-light bg-white border-bottom box-shadow mb-3">
                <div className="container">
                    <NavLink className="navbar-brand" to="/">EasyData Demo</NavLink>
                    <button className="navbar-toggler" type="button" aria-label="Toggle navigation"
                        aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}>
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className={`navbar-collapse collapse${collapsed ? '' : ' show'}`}>
                        <ul className="navbar-nav ms-auto">
                            {links.map(link => (
                                <li className="nav-item" key={link.to}>
                                    <NavLink className="nav-link text-dark" to={link.to} end={link.end}
                                        onClick={() => setCollapsed(true)}>
                                        {link.text}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}
