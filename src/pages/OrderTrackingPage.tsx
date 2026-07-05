import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Order, OrderItem } from '../types';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock, desc: 'We received your order and are processing it.' },
  { key: 'processing', label: 'Processing', icon: Package, desc: 'Your items are being prepared and packed.' },
  { key: 'shipped', label: 'Shipped', icon: Truck, desc: 'Your order is on its way to you.' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, desc: 'Your order has been delivered successfully.' },
];

const STATUS_ORDER: Record<string, number> = { pending: 0, processing: 1, shipped: 2, delivered: 3 };

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [searched, setSearched] = useState(!!searchParams.get('q'));
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); handleSearch(q); }
  }, []);

  async function handleSearch(trackingOverride?: string) {
    const q = (trackingOverride ?? query).trim().toUpperCase();
    if (!q) return;
    setLoading(true);
    setSearched(true);

    const { data: ord } = await supabase
      .from('orders')
      .select('*')
      .eq('tracking_number', q)
      .maybeSingle();

    setOrder(ord ?? null);

    if (ord) {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', ord.id);
      setItems(orderItems ?? []);
    } else {
      setItems([]);
    }
    setLoading(false);
  }

  const currentStep = order ? STATUS_ORDER[order.status] ?? 0 : 0;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 760 }}>
        <div className="track-header">
          <Package size={40} strokeWidth={1.5} style={{ color: 'var(--green-600)' }} />
          <h1 className="track-title">Track Your Order</h1>
          <p className="track-sub">Enter your tracking number to see the status of your order.</p>
        </div>

        <div className="track-search">
          <input
            className="input track-input"
            placeholder="e.g. LM1234567890"
            value={query}
            onChange={e => setQuery(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn btn-primary" onClick={() => handleSearch()} disabled={loading || !query.trim()}>
            <Search size={16} />
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>

        {searched && !loading && order === null && (
          <div className="track-not-found fade-in">
            <AlertCircle size={40} strokeWidth={1.5} style={{ color: 'var(--red-500)' }} />
            <h2>Order Not Found</h2>
            <p>No order found with tracking number <strong>{query}</strong>. Please check the number and try again.</p>
          </div>
        )}

        {order && !loading && (
          <div className="track-result fade-in">
            {/* Status timeline */}
            <div className="track-card">
              <div className="track-card__header">
                <div>
                  <p className="track-order-num">Order #{order.tracking_number}</p>
                  <p className="track-order-date">Placed {new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <span className={`badge status-badge-${order.status}`} style={{ textTransform: 'capitalize', fontSize: 14, padding: '6px 16px' }}>
                  {order.status}
                </span>
              </div>

              <div className="status-timeline">
                {STATUS_STEPS.map((step, i) => {
                  const isDone = i <= currentStep;
                  const isCurrent = i === currentStep;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className={`timeline-step${isDone ? ' done' : ''}${isCurrent ? ' current' : ''}`}>
                      <div className="timeline-connector" />
                      <div className="timeline-dot">
                        <Icon size={16} strokeWidth={2} />
                      </div>
                      <div className="timeline-content">
                        <p className="timeline-label">{step.label}</p>
                        {isCurrent && <p className="timeline-desc">{step.desc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery info */}
            <div className="track-info-grid">
              <div className="track-info-card">
                <h3>Customer Details</h3>
                <p><strong>Name:</strong> {order.customer_name}</p>
                <p><strong>Email:</strong> {order.customer_email}</p>
                <p><strong>Phone:</strong> {order.customer_phone}</p>
              </div>
              <div className="track-info-card">
                <h3>Delivery Address</h3>
                <p>{order.customer_address}</p>
                {order.notes && <p style={{ marginTop: 8, color: 'var(--neutral-500)', fontStyle: 'italic', fontSize: 13 }}>Note: {order.notes}</p>}
              </div>
            </div>

            {/* Items */}
            {items.length > 0 && (
              <div className="track-items-card">
                <h3 style={{ font: '700 16px var(--font-body)', marginBottom: 16 }}>Items in this order</h3>
                {items.map(item => (
                  <div key={item.id} className="track-item">
                    <img src={item.product_image} alt={item.product_name} />
                    <div className="track-item__info">
                      <p className="track-item__name">{item.product_name}</p>
                      <p className="track-item__meta">Qty: {item.quantity} × ${item.unit_price.toFixed(2)}</p>
                    </div>
                    <span className="track-item__total">${(item.quantity * item.unit_price).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 0 0', borderTop: '1px solid var(--neutral-100)', marginTop: 8 }}>
                  <span style={{ font: '700 18px var(--font-body)', color: 'var(--green-700)' }}>Total: ${order.total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .track-header { text-align: center; margin-bottom: 36px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .track-title { font-family: var(--font-display); font-size: 36px; font-weight: 700; }
        .track-sub { font-size: 16px; color: var(--neutral-500); }
        .track-search { display: flex; gap: 12px; margin-bottom: 40px; }
        .track-input { flex: 1; font-size: 16px; font-family: monospace; letter-spacing: 1px; }
        .track-not-found {
          text-align: center; padding: 60px 20px;
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: var(--radius-lg);
          display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .track-not-found h2 { font-size: 20px; font-weight: 700; color: var(--neutral-900); }
        .track-not-found p { font-size: 15px; color: var(--neutral-600); }
        .track-result { display: flex; flex-direction: column; gap: 20px; }
        .track-card {
          background: white; border: 1.5px solid var(--neutral-100);
          border-radius: var(--radius-lg); padding: 28px;
        }
        .track-card__header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
        .track-order-num { font-size: 20px; font-weight: 800; font-family: monospace; letter-spacing: 1px; color: var(--neutral-900); }
        .track-order-date { font-size: 13px; color: var(--neutral-500); margin-top: 4px; }
        .status-badge-pending { background: #fef3c7; color: #92400e; }
        .status-badge-processing { background: #dbeafe; color: #1e40af; }
        .status-badge-shipped { background: #ede9fe; color: #5b21b6; }
        .status-badge-delivered { background: var(--green-100); color: var(--green-800); }
        .status-timeline { display: flex; flex-direction: column; gap: 0; }
        .timeline-step { display: flex; gap: 16px; align-items: flex-start; position: relative; padding-bottom: 24px; }
        .timeline-step:last-child { padding-bottom: 0; }
        .timeline-connector {
          position: absolute; left: 19px; top: 32px; bottom: 0;
          width: 2px; background: var(--neutral-200);
        }
        .timeline-step:last-child .timeline-connector { display: none; }
        .timeline-step.done .timeline-connector { background: var(--green-400); }
        .timeline-dot {
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          background: var(--neutral-200); color: var(--neutral-400);
          display: flex; align-items: center; justify-content: center;
          position: relative; z-index: 1;
          transition: all 0.3s;
        }
        .timeline-step.done .timeline-dot { background: var(--green-500); color: white; }
        .timeline-step.current .timeline-dot { background: var(--green-600); color: white; box-shadow: 0 0 0 4px var(--green-100); }
        .timeline-content { padding-top: 8px; }
        .timeline-label { font-size: 15px; font-weight: 700; color: var(--neutral-400); }
        .timeline-step.done .timeline-label { color: var(--green-700); }
        .timeline-step.current .timeline-label { color: var(--neutral-900); }
        .timeline-desc { font-size: 13px; color: var(--neutral-500); margin-top: 4px; }
        .track-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .track-info-card {
          background: white; border: 1.5px solid var(--neutral-100);
          border-radius: var(--radius-lg); padding: 20px;
          font-size: 14px; color: var(--neutral-600);
          display: flex; flex-direction: column; gap: 6px;
        }
        .track-info-card h3 { font-size: 15px; font-weight: 700; color: var(--neutral-900); margin-bottom: 8px; }
        .track-items-card {
          background: white; border: 1.5px solid var(--neutral-100);
          border-radius: var(--radius-lg); padding: 24px;
        }
        .track-item {
          display: flex; align-items: center; gap: 14px;
          padding: 10px; background: var(--neutral-50); border-radius: var(--radius-md);
          margin-bottom: 8px; border: 1px solid var(--neutral-100);
        }
        .track-item img { width: 56px; height: 56px; object-fit: cover; border-radius: var(--radius-sm); flex-shrink: 0; }
        .track-item__info { flex: 1; }
        .track-item__name { font-size: 14px; font-weight: 600; }
        .track-item__meta { font-size: 13px; color: var(--neutral-400); }
        .track-item__total { font-weight: 700; font-size: 14px; }
        @media (max-width: 640px) {
          .track-info-grid { grid-template-columns: 1fr; }
          .track-search { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
