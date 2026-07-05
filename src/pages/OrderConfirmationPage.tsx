import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Order, OrderItem } from '../types';

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as { tracking?: string; total?: number } | null;

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const [{ data: ord }, { data: orderItems }] = await Promise.all([
        supabase.from('orders').select('*').eq('id', id).maybeSingle(),
        supabase.from('order_items').select('*').eq('order_id', id),
      ]);
      setOrder(ord);
      setItems(orderItems ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  function copyTracking(tracking: string) {
    navigator.clipboard.writeText(tracking).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const displayOrder = order;
  const tracking = state?.tracking ?? order?.tracking_number ?? '';
  const total = state?.total ?? order?.total ?? 0;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 720 }}>
        <div className="confirm-card">
          <div className="confirm-icon">
            <CheckCircle size={48} strokeWidth={1.5} />
          </div>
          <h1 className="confirm-title">Order Confirmed!</h1>
          <p className="confirm-sub">
            Thank you{displayOrder ? `, ${displayOrder.customer_name.split(' ')[0]}` : ''}! Your order has been received and is being prepared.
          </p>

          <div className="tracking-box">
            <p className="tracking-label">Your Tracking Number</p>
            <div className="tracking-num-row">
              <code className="tracking-num">{tracking}</code>
              <button className="copy-btn" onClick={() => copyTracking(tracking)}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--neutral-500)', marginTop: 8 }}>
              Save this number to track your order status.
            </p>
          </div>

          {displayOrder && (
            <div className="confirm-details">
              <div className="confirm-detail-row">
                <span>Order Date</span>
                <span>{new Date(displayOrder.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="confirm-detail-row">
                <span>Delivery Address</span>
                <span>{displayOrder.customer_address}</span>
              </div>
              <div className="confirm-detail-row">
                <span>Order Total</span>
                <span style={{ fontWeight: 700, color: 'var(--green-700)' }}>${total.toFixed(2)}</span>
              </div>
              <div className="confirm-detail-row">
                <span>Status</span>
                <span className="badge badge-amber" style={{ textTransform: 'capitalize' }}>
                  {displayOrder.status}
                </span>
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div className="confirm-items">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Items Ordered</h3>
              {items.map(item => (
                <div key={item.id} className="confirm-item">
                  <img src={item.product_image} alt={item.product_name} />
                  <div className="confirm-item__info">
                    <p className="confirm-item__name">{item.product_name}</p>
                    <p className="confirm-item__meta">Qty: {item.quantity} × ${item.unit_price.toFixed(2)}</p>
                  </div>
                  <span className="confirm-item__total">${(item.quantity * item.unit_price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="confirm-steps">
            {[
              { icon: '📦', label: 'Order Received', done: true },
              { icon: '🔄', label: 'Processing', done: displayOrder?.status !== 'pending' },
              { icon: '🚚', label: 'Shipped', done: displayOrder?.status === 'shipped' || displayOrder?.status === 'delivered' },
              { icon: '✅', label: 'Delivered', done: displayOrder?.status === 'delivered' },
            ].map((step, i) => (
              <div key={i} className={`confirm-step${step.done ? ' done' : ''}`}>
                <div className="confirm-step__dot">{step.done ? <Check size={12} /> : ''}</div>
                <span className="confirm-step__icon">{step.icon}</span>
                <span className="confirm-step__label">{step.label}</span>
              </div>
            ))}
          </div>

          <div className="confirm-actions">
            <Link to={`/track?q=${tracking}`} className="btn btn-primary">
              <Package size={16} /> Track Order
            </Link>
            <Link to="/shop" className="btn btn-secondary">Continue Shopping</Link>
          </div>
        </div>
      </div>

      <style>{`
        .confirm-card {
          background: white;
          border: 1.5px solid var(--neutral-100);
          border-radius: var(--radius-xl);
          padding: 48px;
          text-align: center;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .confirm-icon { color: var(--green-500); }
        .confirm-title { font-family: var(--font-display); font-size: 36px; font-weight: 700; }
        .confirm-sub { font-size: 16px; color: var(--neutral-500); max-width: 400px; }
        .tracking-box {
          background: var(--green-50);
          border: 1.5px solid var(--green-200);
          border-radius: var(--radius-lg);
          padding: 20px 28px;
          width: 100%;
        }
        .tracking-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--green-700); margin-bottom: 8px; }
        .tracking-num-row { display: flex; align-items: center; justify-content: center; gap: 12px; }
        .tracking-num { font-size: 24px; font-weight: 800; color: var(--green-800); letter-spacing: 2px; font-family: monospace; }
        .copy-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 12px; border-radius: var(--radius-sm);
          background: var(--green-600); color: white;
          font-size: 13px; font-weight: 600; transition: background 0.15s;
        }
        .copy-btn:hover { background: var(--green-700); }
        .confirm-details {
          width: 100%; text-align: left;
          background: var(--neutral-50); border-radius: var(--radius-lg);
          overflow: hidden; border: 1px solid var(--neutral-100);
        }
        .confirm-detail-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 20px; font-size: 14px;
          border-bottom: 1px solid var(--neutral-100);
        }
        .confirm-detail-row:last-child { border-bottom: none; }
        .confirm-detail-row span:first-child { color: var(--neutral-500); font-weight: 500; }
        .confirm-detail-row span:last-child { font-weight: 600; text-align: right; max-width: 60%; }
        .confirm-items { width: 100%; text-align: left; }
        .confirm-item {
          display: flex; align-items: center; gap: 14px;
          padding: 10px; background: var(--neutral-50); border-radius: var(--radius-md);
          margin-bottom: 8px; border: 1px solid var(--neutral-100);
        }
        .confirm-item img { width: 52px; height: 52px; object-fit: cover; border-radius: var(--radius-sm); flex-shrink: 0; }
        .confirm-item__info { flex: 1; }
        .confirm-item__name { font-size: 14px; font-weight: 600; }
        .confirm-item__meta { font-size: 13px; color: var(--neutral-400); }
        .confirm-item__total { font-weight: 700; font-size: 14px; }
        .confirm-steps {
          display: flex; align-items: flex-start; justify-content: center; gap: 0;
          width: 100%; position: relative;
        }
        .confirm-steps::before {
          content: '';
          position: absolute;
          top: 14px; left: 10%; right: 10%;
          height: 2px; background: var(--neutral-200); z-index: 0;
        }
        .confirm-step {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          flex: 1; position: relative; z-index: 1;
        }
        .confirm-step__dot {
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--neutral-200); color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          transition: background 0.3s;
        }
        .confirm-step.done .confirm-step__dot { background: var(--green-500); }
        .confirm-step__icon { font-size: 20px; }
        .confirm-step__label { font-size: 12px; font-weight: 600; color: var(--neutral-500); text-align: center; }
        .confirm-step.done .confirm-step__label { color: var(--green-700); }
        .confirm-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
        .spinner {
          width: 40px; height: 40px;
          border: 3px solid var(--neutral-200);
          border-top-color: var(--green-500);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .confirm-card { padding: 28px 20px; }
          .tracking-num { font-size: 18px; }
        }
      `}</style>
    </div>
  );
}
