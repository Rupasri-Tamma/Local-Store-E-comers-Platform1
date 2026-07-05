import { ShoppingCart, Store, Menu, X, Package, Headphones } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { itemCount, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const isHome = location.pathname === '/';

  return (
    <>
      <nav className={`navbar${scrolled || !isHome ? ' navbar--solid' : ''}`}>
        <div className="container navbar__inner">
          <Link to="/" className="navbar__brand">
            <Store size={22} />
            <span>LocalMart</span>
          </Link>

          <div className="navbar__links">
            <NavLink to="/shop" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>Shop</NavLink>
            <NavLink to="/track" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
              <Package size={15} />
              Track Order
            </NavLink>
            <NavLink to="/support" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
              <Headphones size={15} />
              Support
            </NavLink>
          </div>

          <div className="navbar__actions">
            <button className="navbar__cart-btn" onClick={toggleCart} aria-label="Open cart">
              <ShoppingCart size={22} />
              {itemCount > 0 && <span className="navbar__cart-badge">{itemCount > 99 ? '99+' : itemCount}</span>}
            </button>
            <button className="navbar__mobile-toggle" onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-menu">
          <NavLink to="/shop" className="mobile-menu__link" onClick={() => setMobileOpen(false)}>Shop</NavLink>
          <NavLink to="/track" className="mobile-menu__link" onClick={() => setMobileOpen(false)}>Track Order</NavLink>
          <NavLink to="/support" className="mobile-menu__link" onClick={() => setMobileOpen(false)}>Support</NavLink>
        </div>
      )}

      <style>{`
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          padding: 0;
          transition: background 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease;
        }
        .navbar--solid {
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(12px);
          box-shadow: 0 1px 0 var(--neutral-200);
        }
        .navbar__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          gap: 24px;
        }
        .navbar__brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          color: var(--green-700);
          white-space: nowrap;
        }
        .navbar__links {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          justify-content: center;
        }
        .navbar__link {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 500;
          color: var(--neutral-600);
          transition: background 0.15s, color 0.15s;
        }
        .navbar__link:hover, .navbar__link.active {
          background: var(--green-50);
          color: var(--green-700);
        }
        .navbar__actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .navbar__cart-btn {
          position: relative;
          padding: 8px;
          border-radius: var(--radius-sm);
          color: var(--neutral-700);
          transition: background 0.15s, color 0.15s;
        }
        .navbar__cart-btn:hover { background: var(--green-50); color: var(--green-700); }
        .navbar__cart-badge {
          position: absolute;
          top: 2px; right: 2px;
          background: var(--green-600);
          color: white;
          font-size: 10px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid white;
        }
        .navbar__mobile-toggle {
          display: none;
          padding: 8px;
          border-radius: var(--radius-sm);
          color: var(--neutral-700);
        }
        .mobile-menu {
          position: fixed;
          top: 72px; left: 0; right: 0;
          background: white;
          border-bottom: 1px solid var(--neutral-200);
          z-index: 49;
          display: flex;
          flex-direction: column;
          padding: 8px 16px 16px;
          box-shadow: var(--shadow-lg);
          animation: fadeIn 0.2s ease;
        }
        .mobile-menu__link {
          padding: 12px 16px;
          font-size: 15px;
          font-weight: 500;
          color: var(--neutral-700);
          border-radius: var(--radius-sm);
          transition: background 0.15s;
        }
        .mobile-menu__link:hover { background: var(--green-50); color: var(--green-700); }
        @media (max-width: 640px) {
          .navbar__links { display: none; }
          .navbar__mobile-toggle { display: flex; }
        }
      `}</style>
    </>
  );
}
