import { ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';

interface Props {
  product: Product;
  avgRating?: number;
  reviewCount?: number;
}

export default function ProductCard({ product, avgRating = 0, reviewCount = 0 }: Props) {
  const { addItem, toggleCart } = useCart();

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product);
    toggleCart();
  }

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card__img-wrap">
        <img src={product.image_url} alt={product.name} className="product-card__img" />
        {product.featured && <span className="badge badge-green product-card__badge">Featured</span>}
        {product.stock === 0 && (
          <div className="product-card__out">Out of Stock</div>
        )}
      </div>
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <h3 className="product-card__name">{product.name}</h3>
        {reviewCount > 0 && (
          <div className="product-card__rating">
            <Star size={13} fill="var(--amber-400)" stroke="var(--amber-400)" />
            <span>{avgRating.toFixed(1)}</span>
            <span className="product-card__rating-count">({reviewCount})</span>
          </div>
        )}
        <p className="product-card__desc">{product.description}</p>
        <div className="product-card__footer">
          <span className="product-card__price">${product.price.toFixed(2)}</span>
          <button
            className="btn btn-primary"
            style={{ padding: '8px 14px', fontSize: 13 }}
            onClick={handleAdd}
            disabled={product.stock === 0}
          >
            <ShoppingCart size={14} />
            Add
          </button>
        </div>
      </div>

      <style>{`
        .product-card {
          display: flex;
          flex-direction: column;
          background: var(--white);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          border: 1.5px solid var(--neutral-100);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          color: inherit;
        }
        .product-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .product-card__img-wrap { position: relative; aspect-ratio: 4/3; overflow: hidden; }
        .product-card__img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .product-card:hover .product-card__img { transform: scale(1.05); }
        .product-card__badge { position: absolute; top: 12px; left: 12px; }
        .product-card__out {
          position: absolute; inset: 0; background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 700; font-size: 15px; letter-spacing: 0.5px;
        }
        .product-card__body { display: flex; flex-direction: column; gap: 6px; padding: 16px; flex: 1; }
        .product-card__category { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--green-600); }
        .product-card__name { font-size: 16px; font-weight: 700; color: var(--neutral-800); line-height: 1.3; }
        .product-card__rating { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: var(--neutral-700); }
        .product-card__rating-count { color: var(--neutral-400); font-weight: 400; }
        .product-card__desc { font-size: 13px; color: var(--neutral-500); line-height: 1.5; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .product-card__footer { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
        .product-card__price { font-size: 20px; font-weight: 700; color: var(--green-700); }
      `}</style>
    </Link>
  );
}
