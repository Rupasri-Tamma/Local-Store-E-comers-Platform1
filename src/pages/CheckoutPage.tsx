import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';

function generateTracking() {
  const prefix = 'LM';
  const digits = Math.floor(Math.random() * 9000000000 + 1000000000);
  return `${prefix}${digits}`;
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const shipping = subtotal >= 30 ? 0 : 4.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError('');

    const tracking = generateTracking();

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        tracking_number: tracking,
        customer_name: form.name.trim(),
        customer_email: form.email.trim(),
        customer_phone: form.phone.trim(),
        customer_address: form.address.trim(),
        notes: form.notes.trim() || null,
        total,
      })
      .select()
      .maybeSingle();

    if (orderErr || !order) {
      setError('Failed to place order. Please try again.');
      setSubmitting(false);
      return;
    }

    const orderItems = items.map(i => ({
      order_id: order.id,
      product_id: i.product.id,
      product_name: i.product.name,
      product_image: i.product.image_url,
      quantity: i.quantity,
      unit_price: i.product.price,
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) {
      setError('Failed to place order. Please try again.');
      setSubmitting(false);
      return;
    }

    clearCart();
    navigate(`/order-confirmation/${order.id}`, { state: { tracking, total } });
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: 80, textAlign: 'center' }}>
          <p style={{ fontSize: 18, color: 'var(--neutral-500)' }}>Your cart is empty.</p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }}>Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <Link to="/shop" className="back-link">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-layout">
          {/* Form */}
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-section">
              <h2 className="checkout-section-title">Contact Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="input" placeholder="John Doe" value={form.name} onChange={e => update('name', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="input" type="email" placeholder="john@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Phone Number *</label>
                  <input className="input" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => update('phone', e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="checkout-section">
              <h2 className="checkout-section-title">Delivery Address</h2>
              <div className="form-group">
                <label className="form-label">Full Address *</label>
                <textarea className="input" placeholder="123 Main St, Apt 4B, City, State, ZIP" value={form.address} onChange={e => update('address', e.target.value)} required style={{ minHeight: 80 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Order Notes (optional)</label>
                <textarea className="input" placeholder="Special delivery instructions..." value={form.notes} onChange={e => update('notes', e.target.value)} style={{ minHeight: 80 }} />
              </div>
            </div>

            {error && <p style={{ color: 'var(--red-500)', fontSize: 14, padding: '12px 16px', background: '#fef2f2', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca' }}>{error}</p>}

            <button className="btn btn-primary btn-lg" type="submit" disabled={submitting} style={{ justifyContent: 'center' }}>
              <Lock size={16} />
              {submitting ? 'Placing Order...' : `Place Order — $${total.toFixed(2)}`}
            </button>
            <p style={{ fontSize: 12, color: 'var(--neutral-400)', textAlign: 'center' }}>
              By placing this order you agree to our terms of service.
            </p>
          </form>

          {/* Order summary */}
          <div className="order-summary">
            <h2 className="checkout-section-title">Order Summary</h2>
            <div className="summary-items">
              {items.map(item => (
                <div key={item.product.id} className="summary-item">
                  <div className="summary-item__img-wrap">
                    <img src={item.product.image_url} alt={item.product.name} />
                    <span className="summary-item__qty">{item.quantity}</span>
                  </div>
                  <div className="summary-item__info">
                    <p className="summary-item__name">{item.product.name}</p>
                    <p className="summary-item__price">${item.product.price.toFixed(2)} each</p>
                  </div>
                  <span className="summary-item__total">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span style={{ color: 'var(--green-600)', fontWeight: 600 }}>Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              {shipping === 0 && (
                <p style={{ fontSize: 12, color: 'var(--green-600)', marginTop: -4 }}>Free shipping on orders over $30!</p>
              )}
              <div className="summary-row">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .back-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 14px; font-weight: 500; color: var(--neutral-500);
          margin-bottom: 28px; transition: color 0.15s;
        }
        .back-link:hover { color: var(--green-600); }
        .checkout-title {
          font-family: var(--font-display); font-size: 36px; font-weight: 700;
          color: var(--neutral-900); margin-bottom: 40px;
        }
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 40px;
          align-items: start;
        }
        .checkout-form { display: flex; flex-direction: column; gap: 28px; }
        .checkout-section {
          background: white;
          border: 1.5px solid var(--neutral-100);
          border-radius: var(--radius-lg);
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .checkout-section-title { font-size: 17px; font-weight: 700; color: var(--neutral-800); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 13px; font-weight: 600; color: var(--neutral-600); }
        .order-summary {
          background: white;
          border: 1.5px solid var(--neutral-100);
          border-radius: var(--radius-lg);
          padding: 28px;
          position: sticky;
          top: 100px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .summary-items { display: flex; flex-direction: column; gap: 14px; }
        .summary-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px; background: var(--neutral-50); border-radius: var(--radius-md);
        }
        .summary-item__img-wrap { position: relative; flex-shrink: 0; }
        .summary-item__img-wrap img { width: 56px; height: 56px; object-fit: cover; border-radius: var(--radius-sm); }
        .summary-item__qty {
          position: absolute; top: -6px; right: -6px;
          width: 20px; height: 20px;
          background: var(--green-600); color: white;
          border-radius: 50%; font-size: 11px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .summary-item__info { flex: 1; min-width: 0; }
        .summary-item__name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .summary-item__price { font-size: 12px; color: var(--neutral-400); }
        .summary-item__total { font-size: 14px; font-weight: 700; color: var(--neutral-800); flex-shrink: 0; }
        .summary-totals { display: flex; flex-direction: column; gap: 10px; padding-top: 16px; border-top: 1px solid var(--neutral-100); }
        .summary-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--neutral-600); }
        .summary-total { font-size: 18px; font-weight: 800; color: var(--neutral-900); padding-top: 10px; border-top: 1px solid var(--neutral-200); }
        @media (max-width: 900px) {
          .checkout-layout { grid-template-columns: 1fr; }
          .order-summary { position: static; }
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
