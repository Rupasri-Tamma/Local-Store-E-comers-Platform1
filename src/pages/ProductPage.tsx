import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import StarRating from '../components/StarRating';
import type { Product, Review } from '../types';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Review form
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const { addItem, updateQty: updateCartQty, items, toggleCart } = useCart();

  useEffect(() => {
    if (!id) return;
    async function load() {
      const [{ data: prod }, { data: revs }] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).maybeSingle(),
        supabase.from('reviews').select('*').eq('product_id', id).order('created_at', { ascending: false }),
      ]);
      setProduct(prod);
      setReviews(revs ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  function handleAddToCart() {
    if (!product) return;
    const cartItem = items.find(i => i.product.id === product.id);
    if (cartItem) {
      updateCartQty(product.id, cartItem.quantity + qty);
    } else {
      for (let i = 0; i < qty; i++) addItem(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    toggleCart();
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !reviewName.trim() || !reviewComment.trim()) {
      setReviewError('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    setReviewError('');
    const { error } = await supabase.from('reviews').insert({
      product_id: id,
      reviewer_name: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
    });
    if (error) {
      setReviewError('Failed to submit review. Please try again.');
      setSubmitting(false);
      return;
    }
    const { data: revs } = await supabase.from('reviews').select('*').eq('product_id', id).order('created_at', { ascending: false });
    setReviews(revs ?? []);
    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
    setReviewSuccess(true);
    setSubmitting(false);
    setTimeout(() => setReviewSuccess(false), 4000);
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: 40 }}>
          <div className="prod-layout">
            <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-xl)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="skeleton" style={{ height: 14, width: '30%' }} />
              <div className="skeleton" style={{ height: 36, width: '70%' }} />
              <div className="skeleton" style={{ height: 16, width: '20%' }} />
              <div className="skeleton" style={{ height: 80, width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: 80, textAlign: 'center' }}>
          <p style={{ fontSize: 18, color: 'var(--neutral-500)' }}>Product not found.</p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }}>Back to Shop</Link>
        </div>
      </div>
    );
  }

  const ratingBreakdown = [5,4,3,2,1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <Link to="/shop" className="back-link">
          <ArrowLeft size={16} /> Back to Shop
        </Link>

        <div className="prod-layout">
          {/* Image */}
          <div className="prod-img-wrap">
            <img src={product.image_url} alt={product.name} className="prod-img" />
            {product.stock === 0 && (
              <div className="prod-out-overlay">Out of Stock</div>
            )}
          </div>

          {/* Info */}
          <div className="prod-info">
            <span className="badge badge-neutral" style={{ alignSelf: 'flex-start' }}>{product.category}</span>
            <h1 className="prod-name">{product.name}</h1>

            {reviews.length > 0 && (
              <div className="prod-rating-row">
                <StarRating rating={Math.round(avgRating)} size={18} />
                <span className="prod-rating-num">{avgRating.toFixed(1)}</span>
                <span className="prod-rating-count">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}

            <p className="prod-price">${product.price.toFixed(2)}</p>
            <p className="prod-desc">{product.description}</p>

            <div className="prod-stock">
              {product.stock > 0 ? (
                <span style={{ color: 'var(--green-600)', fontWeight: 600, fontSize: 14 }}>
                  ✓ In stock ({product.stock} available)
                </span>
              ) : (
                <span style={{ color: 'var(--red-500)', fontWeight: 600, fontSize: 14 }}>Out of stock</span>
              )}
            </div>

            {product.stock > 0 && (
              <div className="prod-actions">
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>
                    <Minus size={16} />
                  </button>
                  <span className="qty-value">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>
                    <Plus size={16} />
                  </button>
                </div>
                <button className="btn btn-primary btn-lg" onClick={handleAddToCart} style={{ flex: 1, justifyContent: 'center' }}>
                  {added ? (
                    <><CheckCircle size={18} /> Added!</>
                  ) : (
                    <><ShoppingCart size={18} /> Add to Cart</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews section */}
        <div className="reviews-section">
          <h2 className="reviews-title">Customer Reviews</h2>

          {reviews.length > 0 && (
            <div className="reviews-summary">
              <div className="reviews-avg">
                <span className="reviews-avg-num">{avgRating.toFixed(1)}</span>
                <StarRating rating={Math.round(avgRating)} size={28} />
                <span style={{ fontSize: 14, color: 'var(--neutral-500)' }}>{reviews.length} reviews</span>
              </div>
              <div className="reviews-breakdown">
                {ratingBreakdown.map(({ star, count }) => (
                  <div key={star} className="breakdown-row">
                    <span className="breakdown-label">{star} star</span>
                    <div className="breakdown-bar-wrap">
                      <div
                        className="breakdown-bar-fill"
                        style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="breakdown-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="reviews-cols">
            {/* Review list */}
            <div className="review-list">
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--neutral-500)', fontSize: 14 }}>No reviews yet. Be the first to review this product!</p>
              ) : (
                reviews.map(r => (
                  <div key={r.id} className="review-card">
                    <div className="review-card__header">
                      <div className="review-avatar">{r.reviewer_name[0].toUpperCase()}</div>
                      <div>
                        <p className="review-name">{r.reviewer_name}</p>
                        <StarRating rating={r.rating} size={13} />
                      </div>
                      <span className="review-date">{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <p className="review-comment">{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write review */}
            <div className="write-review">
              <h3 className="write-review__title">Write a Review</h3>
              {reviewSuccess && (
                <div className="success-banner fade-in">
                  <CheckCircle size={16} /> Thank you for your review!
                </div>
              )}
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">Your Name</label>
                  <input className="input" placeholder="John Doe" value={reviewName} onChange={e => setReviewName(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Rating</label>
                  <div style={{ marginTop: 6 }}>
                    <StarRating rating={reviewRating} size={28} interactive onChange={setReviewRating} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Comment</label>
                  <textarea className="input" placeholder="Share your experience..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} required style={{ minHeight: 100 }} />
                </div>
                {reviewError && <p style={{ color: 'var(--red-500)', fontSize: 13 }}>{reviewError}</p>}
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .back-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 14px; font-weight: 500; color: var(--neutral-500);
          margin-bottom: 32px; transition: color 0.15s;
        }
        .back-link:hover { color: var(--green-600); }
        .prod-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: start;
          margin-bottom: 72px;
        }
        .prod-img-wrap {
          position: relative;
          border-radius: var(--radius-xl);
          overflow: hidden;
          aspect-ratio: 1;
          box-shadow: var(--shadow-lg);
        }
        .prod-img { width: 100%; height: 100%; object-fit: cover; }
        .prod-out-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 20px; font-weight: 700;
        }
        .prod-info {
          display: flex; flex-direction: column; gap: 16px;
          position: sticky; top: 100px;
        }
        .prod-name { font-family: var(--font-display); font-size: 36px; font-weight: 700; color: var(--neutral-900); line-height: 1.2; }
        .prod-rating-row { display: flex; align-items: center; gap: 8px; }
        .prod-rating-num { font-size: 16px; font-weight: 700; color: var(--neutral-800); }
        .prod-rating-count { font-size: 14px; color: var(--neutral-400); }
        .prod-price { font-size: 36px; font-weight: 800; color: var(--green-700); }
        .prod-desc { font-size: 15px; color: var(--neutral-600); line-height: 1.7; }
        .prod-actions { display: flex; gap: 12px; align-items: center; margin-top: 8px; }
        .qty-control {
          display: flex; align-items: center; gap: 12px;
          background: var(--neutral-100); border-radius: var(--radius-md);
          padding: 6px 8px;
        }
        .qty-btn {
          width: 32px; height: 32px; border-radius: 50%;
          background: white; border: 1.5px solid var(--neutral-200);
          display: flex; align-items: center; justify-content: center;
          color: var(--neutral-700); transition: all 0.15s;
        }
        .qty-btn:hover { border-color: var(--green-500); color: var(--green-600); }
        .qty-value { font-size: 16px; font-weight: 700; min-width: 24px; text-align: center; }
        .reviews-section { padding-top: 48px; border-top: 1px solid var(--neutral-200); }
        .reviews-title { font-family: var(--font-display); font-size: 28px; font-weight: 700; margin-bottom: 28px; }
        .reviews-summary {
          display: flex; gap: 40px; align-items: flex-start;
          background: white; border-radius: var(--radius-lg); padding: 28px;
          border: 1.5px solid var(--neutral-100); margin-bottom: 32px; flex-wrap: wrap;
        }
        .reviews-avg { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 120px; }
        .reviews-avg-num { font-size: 56px; font-weight: 800; color: var(--neutral-900); line-height: 1; }
        .reviews-breakdown { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 8px; }
        .breakdown-row { display: flex; align-items: center; gap: 10px; }
        .breakdown-label { font-size: 13px; color: var(--neutral-500); white-space: nowrap; min-width: 40px; }
        .breakdown-bar-wrap { flex: 1; height: 8px; background: var(--neutral-100); border-radius: 999px; overflow: hidden; }
        .breakdown-bar-fill { height: 100%; background: var(--amber-400); border-radius: 999px; transition: width 0.5s ease; }
        .breakdown-count { font-size: 13px; color: var(--neutral-400); min-width: 20px; text-align: right; }
        .reviews-cols { display: grid; grid-template-columns: 1fr 380px; gap: 40px; align-items: start; }
        .review-list { display: flex; flex-direction: column; gap: 16px; }
        .review-card { background: white; border: 1.5px solid var(--neutral-100); border-radius: var(--radius-lg); padding: 20px; }
        .review-card__header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .review-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--green-100); color: var(--green-700);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700; flex-shrink: 0;
        }
        .review-name { font-weight: 600; font-size: 14px; margin-bottom: 2px; }
        .review-date { margin-left: auto; font-size: 12px; color: var(--neutral-400); white-space: nowrap; }
        .review-comment { font-size: 14px; color: var(--neutral-600); line-height: 1.6; }
        .write-review {
          background: white; border: 1.5px solid var(--neutral-100);
          border-radius: var(--radius-lg); padding: 28px;
          position: sticky; top: 100px;
        }
        .write-review__title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--neutral-600); margin-bottom: 6px; }
        .success-banner {
          display: flex; align-items: center; gap: 8px;
          background: var(--green-50); color: var(--green-700);
          border: 1px solid var(--green-200); border-radius: var(--radius-sm);
          padding: 10px 14px; font-size: 14px; font-weight: 500; margin-bottom: 16px;
        }
        @media (max-width: 900px) {
          .prod-layout { grid-template-columns: 1fr; gap: 32px; }
          .prod-info { position: static; }
          .reviews-cols { grid-template-columns: 1fr; }
          .write-review { position: static; }
        }
      `}</style>
    </div>
  );
}
