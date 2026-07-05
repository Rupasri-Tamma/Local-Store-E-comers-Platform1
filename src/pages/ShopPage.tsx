import { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import type { Product, Review } from '../types';

interface ProductWithStats extends Product {
  avgRating: number;
  reviewCount: number;
}

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'rating-desc';

const CATEGORIES = ['All', 'Dairy', 'Produce', 'Bakery', 'Pantry'];

export default function ShopPage() {
  const [products, setProducts] = useState<ProductWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<SortKey>('default');
  const [maxPrice, setMaxPrice] = useState(50);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: prods, error } = await supabase.from('products').select('*');
      if (error || !prods) { setLoading(false); return; }

      const ids = prods.map(p => p.id);
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

      setProducts(prods.map(p => ({
        ...p,
        avgRating: statsMap[p.id] ? statsMap[p.id].sum / statsMap[p.id].count : 0,
        reviewCount: statsMap[p.id]?.count ?? 0,
      })));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || p.category === category;
      const matchPrice = p.price <= maxPrice;
      return matchSearch && matchCat && matchPrice;
    });

    switch (sort) {
      case 'price-asc': result = [...result].sort((a, b) => a.price - b.price); break;
      case 'price-desc': result = [...result].sort((a, b) => b.price - a.price); break;
      case 'name-asc': result = [...result].sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'rating-desc': result = [...result].sort((a, b) => b.avgRating - a.avgRating); break;
    }
    return result;
  }, [products, search, category, sort, maxPrice]);

  const hasActiveFilters = category !== 'All' || search !== '' || maxPrice < 50;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* Header */}
        <div className="shop-header">
          <div>
            <h1 className="shop-title">Our Products</h1>
            <p className="shop-sub">{filtered.length} item{filtered.length !== 1 ? 's' : ''} available</p>
          </div>
          <div className="shop-controls">
            <div className="search-wrap">
              <Search size={16} className="search-icon" />
              <input
                className="input search-input"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>
              )}
            </div>
            <select className="input" style={{ width: 'auto', cursor: 'pointer' }} value={sort} onChange={e => setSort(e.target.value as SortKey)}>
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="rating-desc">Highest Rated</option>
            </select>
            <button
              className={`btn btn-secondary${filtersOpen ? ' active' : ''}`}
              onClick={() => setFiltersOpen(v => !v)}
            >
              <SlidersHorizontal size={16} />
              Filters
              {hasActiveFilters && <span className="badge badge-green" style={{ padding: '2px 6px', fontSize: 11 }}>•</span>}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="filter-panel fade-in">
            <div className="filter-section">
              <p className="filter-label">Category</p>
              <div className="filter-chips">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`filter-chip${category === cat ? ' active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >{cat}</button>
                ))}
              </div>
            </div>
            <div className="filter-section">
              <p className="filter-label">Max Price: <strong>${maxPrice}</strong></p>
              <input
                type="range"
                min={1}
                max={50}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="price-range"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--neutral-400)', marginTop: 4 }}>
                <span>$1</span><span>$50</span>
              </div>
            </div>
            {hasActiveFilters && (
              <button
                className="btn btn-secondary"
                style={{ alignSelf: 'flex-start', fontSize: 13, padding: '6px 14px' }}
                onClick={() => { setCategory('All'); setSearch(''); setMaxPrice(50); }}
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Category quick-pills */}
        <div className="cat-pills">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`cat-pill${category === cat ? ' active' : ''}`}
              onClick={() => setCategory(cat)}
            >{cat}</button>
          ))}
        </div>

        {/* Products */}
        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'white', border: '1.5px solid var(--neutral-100)' }}>
                <div className="skeleton" style={{ aspectRatio: '4/3' }} />
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ height: 12, width: '35%' }} />
                  <div className="skeleton" style={{ height: 18, width: '65%' }} />
                  <div className="skeleton" style={{ height: 12, width: '85%' }} />
                  <div className="skeleton" style={{ height: 12, width: '75%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <div className="skeleton" style={{ height: 24, width: '30%' }} />
                    <div className="skeleton" style={{ height: 32, width: '25%', borderRadius: 6 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: 32 }}>🔍</p>
            <p style={{ fontWeight: 600, fontSize: 18 }}>No products found</p>
            <p style={{ color: 'var(--neutral-500)', fontSize: 14 }}>Try adjusting your search or filters.</p>
            <button className="btn btn-secondary" onClick={() => { setCategory('All'); setSearch(''); setMaxPrice(50); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="product-grid fade-in">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} avgRating={p.avgRating} reviewCount={p.reviewCount} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .shop-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .shop-title { font-family: var(--font-display); font-size: 36px; font-weight: 700; color: var(--neutral-900); }
        .shop-sub { font-size: 14px; color: var(--neutral-500); margin-top: 4px; }
        .shop-controls { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .search-wrap { position: relative; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--neutral-400); pointer-events: none; }
        .search-input { padding-left: 38px; padding-right: 34px; width: 240px; }
        .search-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: var(--neutral-400); padding: 2px; }
        .search-clear:hover { color: var(--neutral-600); }
        .filter-panel {
          background: white;
          border: 1.5px solid var(--neutral-200);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 24px;
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
          align-items: flex-start;
        }
        .filter-section { display: flex; flex-direction: column; gap: 10px; }
        .filter-label { font-size: 13px; font-weight: 600; color: var(--neutral-600); text-transform: uppercase; letter-spacing: 0.5px; }
        .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
        .filter-chip {
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          border: 1.5px solid var(--neutral-200);
          background: white;
          color: var(--neutral-600);
          transition: all 0.15s;
        }
        .filter-chip:hover { border-color: var(--green-400); color: var(--green-700); }
        .filter-chip.active { background: var(--green-600); border-color: var(--green-600); color: white; }
        .price-range { width: 200px; accent-color: var(--green-600); cursor: pointer; }
        .cat-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }
        .cat-pill {
          padding: 7px 18px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 500;
          border: 1.5px solid var(--neutral-200);
          background: white;
          color: var(--neutral-600);
          transition: all 0.15s;
        }
        .cat-pill:hover { border-color: var(--green-400); color: var(--green-700); }
        .cat-pill.active { background: var(--green-600); border-color: var(--green-600); color: white; }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        @media (max-width: 640px) {
          .shop-controls { flex-direction: column; align-items: stretch; }
          .search-input { width: 100%; }
          .shop-header { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
