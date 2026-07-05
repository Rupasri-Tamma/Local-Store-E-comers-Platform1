import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Clock, Leaf } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import type { Product, Review } from '../types';

interface ProductWithStats extends Product {
  avgRating: number;
  reviewCount: number;
}

export default function HomePage() {
  const [featured, setFeatured] = useState<ProductWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .limit(3);
      if (error || !products) { setLoading(false); return; }

      const ids = products.map(p => p.id);
      const { data: reviews } = await supabase
        .from('reviews')
        .select('product_id, rating')
        .in('product_id', ids);

      const statsMap: Record<string, { sum: number; count: number }> = {};
      (reviews as Review[] || []).forEach(r => {
        if (!statsMap[r.product_id]) statsMap[r.product_id] = { sum: 0, count: 0 };
        statsMap[r.product_id].sum += r.rating;
        statsMap[r.product_id].count++;
      });

      setFeatured(products.map(p => ({
        ...p,
        avgRating: statsMap[p.id] ? statsMap[p.id].sum / statsMap[p.id].count : 0,
        reviewCount: statsMap[p.id]?.count ?? 0,
      })));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="container hero__content">
          <span className="badge badge-green" style={{ fontSize: 13, padding: '6px 16px' }}>Fresh & Local</span>
          <h1 className="hero__title">
            Your Neighborhood<br />
            <span className="hero__title-accent">Store, Online</span>
          </h1>
          <p className="hero__subtitle">
            Shop fresh, locally-sourced products — from dairy to produce, bakery to pantry.
            Fast delivery right to your doorstep.
          </p>
          <div className="hero__ctas">
            <Link to="/shop" className="btn btn-primary btn-lg">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/track" className="btn btn-secondary btn-lg">
              Track Order
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-strip">
        <div className="container features-strip__grid">
          {[
            { icon: Truck, label: 'Free Delivery', sub: 'On orders over $30' },
            { icon: Leaf, label: 'Fresh & Organic', sub: 'Sourced from local farms' },
            { icon: Clock, label: 'Same-Day Delivery', sub: 'Order before 2 PM' },
            { icon: ShieldCheck, label: 'Quality Assured', sub: '100% satisfaction guarantee' },
          ].map(({ icon: Icon, label, sub }) => (
            <div className="feature-item" key={label}>
              <div className="feature-item__icon">
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <div>
                <p className="feature-item__label">{label}</p>
                <p className="feature-item__sub">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-sub">Hand-picked favorites from our store</p>
            </div>
            <Link to="/shop" className="btn btn-secondary">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="product-grid">
              {[1,2,3].map(i => (
                <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div className="skeleton" style={{ aspectRatio: '4/3' }} />
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="skeleton" style={{ height: 14, width: '40%' }} />
                    <div className="skeleton" style={{ height: 18, width: '70%' }} />
                    <div className="skeleton" style={{ height: 13, width: '90%' }} />
                    <div className="skeleton" style={{ height: 13, width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="product-grid fade-in">
              {featured.map(p => (
                <ProductCard key={p.id} product={p} avgRating={p.avgRating} reviewCount={p.reviewCount} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container cta-banner__inner">
          <div>
            <h2 className="cta-banner__title">Ready to order?</h2>
            <p className="cta-banner__sub">Explore our full range of fresh, local products.</p>
          </div>
          <Link to="/shop" className="btn btn-lg" style={{ background: 'white', color: 'var(--green-700)', fontWeight: 700 }}>
            Browse All Products <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <style>{`
        /* Hero */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .hero__bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #059669 100%);
        }
        .hero__bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: url('https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=1600') center/cover;
          opacity: 0.12;
        }
        .hero__content {
          position: relative;
          z-index: 1;
          padding-top: 120px;
          padding-bottom: 80px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 620px;
        }
        .hero__title {
          font-family: var(--font-display);
          font-size: clamp(38px, 6vw, 68px);
          font-weight: 700;
          line-height: 1.1;
          color: white;
        }
        .hero__title-accent { color: var(--amber-400); }
        .hero__subtitle {
          font-size: 18px;
          color: rgba(255,255,255,0.8);
          line-height: 1.6;
          max-width: 480px;
        }
        .hero__ctas { display: flex; gap: 12px; flex-wrap: wrap; }

        /* Features strip */
        .features-strip {
          background: white;
          border-bottom: 1px solid var(--neutral-100);
          padding: 28px 0;
          box-shadow: var(--shadow-sm);
        }
        .features-strip__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .feature-item__icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: var(--green-50);
          color: var(--green-600);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .feature-item__label { font-size: 14px; font-weight: 700; color: var(--neutral-800); }
        .feature-item__sub { font-size: 12px; color: var(--neutral-500); }

        /* Section */
        .section { padding: 72px 0; }
        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .section-title { font-family: var(--font-display); font-size: 32px; font-weight: 700; color: var(--neutral-900); }
        .section-sub { font-size: 15px; color: var(--neutral-500); margin-top: 4px; }

        /* Grid */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        /* CTA banner */
        .cta-banner {
          background: linear-gradient(135deg, var(--green-700) 0%, var(--green-800) 100%);
          padding: 60px 0;
          margin-top: 0;
        }
        .cta-banner__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        .cta-banner__title { font-family: var(--font-display); font-size: 32px; font-weight: 700; color: white; }
        .cta-banner__sub { font-size: 16px; color: rgba(255,255,255,0.75); margin-top: 4px; }

        @media (max-width: 900px) {
          .features-strip__grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .features-strip__grid { grid-template-columns: 1fr; }
          .cta-banner__inner { flex-direction: column; text-align: center; }
          .section-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
