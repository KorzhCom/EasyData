import NavMenu from './NavMenu';

export default function Layout({ children }) {
    return (
        <div>
            <NavMenu />
            <main className="container">
                {children}
            </main>
        </div>
    );
}
