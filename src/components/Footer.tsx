import { Link } from 'react-router-dom';
import { Store, Globe, Heart, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <Store size={20} />
            LocalMart
          </Link>
          <p className="footer__tagline">Fresh, local products delivered right to your doorstep. Supporting our community one order at a time.</p>
          <div className="footer__social">
            {[Globe, Heart, Share2].map((Icon, i) => (
              <a key={i} href="#" className="footer__social-link"><Icon size={18} /></a>
            ))}
          </div>
        </div>

        <div className="footer__links-group">
          <p className="footer__links-title">Shop</p>
          <Link to="/shop" className="footer__link">All Products</Link>
          <Link to="/shop?cat=Dairy" className="footer__link">Dairy</Link>
          <Link to="/shop?cat=Produce" className="footer__link">Produce</Link>
          <Link to="/shop?cat=Bakery" className="footer__link">Bakery</Link>
          <Link to="/shop?cat=Pantry" className="footer__link">Pantry</Link>
        </div>

        <div className="footer__links-group">
          <p className="footer__links-title">Help</p>
          <Link to="/track" className="footer__link">Track Order</Link>
          <Link to="/support" className="footer__link">Customer Support</Link>
          <Link to="/support" className="footer__link">Returns & Refunds</Link>
          <Link to="/support" className="footer__link">FAQ</Link>
        </div>

        <div className="footer__links-group">
          <p className="footer__links-title">Contact</p>
          <p className="footer__link">+1 (555) 123-4567</p>
          <p className="footer__link">support@localmart.com</p>
          <p className="footer__link">42 Market Street, Downtown</p>
          <p className="footer__link">Mon–Sun: 8 AM – 9 PM</p>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} LocalMart. All rights reserved.</p>
          <p>Made with care for our local community.</p>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--neutral-900);
          color: var(--neutral-400);
          padding-top: 60px;
          margin-top: 0;
        }
        .footer__inner {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
          padding-bottom: 48px;
          border-bottom: 1px solid var(--neutral-800);
        }
        .footer__logo {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-display); font-size: 20px; font-weight: 700;
          color: white; margin-bottom: 12px;
        }
        .footer__tagline { font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
        .footer__social { display: flex; gap: 10px; }
        .footer__social-link {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--neutral-800); color: var(--neutral-400);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .footer__social-link:hover { background: var(--green-600); color: white; }
        .footer__links-title { font-size: 13px; font-weight: 700; color: white; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
        .footer__links-group { display: flex; flex-direction: column; gap: 10px; }
        .footer__link { font-size: 14px; color: var(--neutral-400); transition: color 0.15s; }
        a.footer__link:hover { color: var(--green-400); }
        .footer__bottom { padding: 20px 0; }
        .footer__bottom-inner {
          display: flex; justify-content: space-between;
          font-size: 13px; flex-wrap: wrap; gap: 8px;
        }
        @media (max-width: 900px) {
          .footer__inner { grid-template-columns: 1fr 1fr; }
          .footer__brand { grid-column: 1 / -1; }
        }
        @media (max-width: 640px) {
          .footer__inner { grid-template-columns: 1fr; }
        }
      `}</style>
    </footer>
  );
}
