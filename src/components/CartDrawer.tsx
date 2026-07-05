import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { items, isOpen, removeItem, updateQty, closeCart, subtotal, itemCount } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  function handleCheckout() {
    closeCart();
    navigate('/checkout');
  }

  return (
    <>
      <div className="overlay" onClick={closeCart} />
      <div className="cart-drawer fade-in">
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">
            <ShoppingBag size={20} />
            Cart {itemCount > 0 && <span className="badge badge-green">{itemCount}</span>}
          </h2>
          <button className="cart-drawer__close" onClick={closeCart}><X size={20} /></button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <ShoppingBag size={48} strokeWidth={1.5} style={{ color: 'var(--neutral-300)' }} />
            <p>Your cart is empty</p>
            <button className="btn btn-primary" onClick={() => { closeCart(); navigate('/shop'); }}>
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {items.map(item => (
                <div key={item.product.id} className="cart-item">
                  <img src={item.product.image_url} alt={item.product.name} className="cart-item__img" />
                  <div className="cart-item__info">
                    <p className="cart-item__name">{item.product.name}</p>
                    <p className="cart-item__price">${item.product.price.toFixed(2)}</p>
                    <div className="cart-item__qty">
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => updateQty(item.product.id, item.quantity - 1)}
                      ><Minus size={12} /></button>
                      <span>{item.quantity}</span>
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => updateQty(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      ><Plus size={12} /></button>
                    </div>
                  </div>
                  <div className="cart-item__right">
                    <span className="cart-item__total">${(item.product.price * item.quantity).toFixed(2)}</span>
                    <button className="cart-item__remove" onClick={() => removeItem(item.product.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-drawer__footer">
              <div className="cart-drawer__subtotal">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <p className="cart-drawer__note">Shipping & taxes calculated at checkout</p>
              <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCheckout}>
                Checkout
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .cart-drawer {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: min(420px, 100vw);
          background: white;
          z-index: 50;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-xl);
        }
        .cart-drawer__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--neutral-200);
        }
        .cart-drawer__title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 700;
        }
        .cart-drawer__close {
          padding: 6px;
          border-radius: var(--radius-sm);
          color: var(--neutral-500);
          transition: background 0.15s;
        }
        .cart-drawer__close:hover { background: var(--neutral-100); }
        .cart-drawer__empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 40px;
          color: var(--neutral-500);
          font-size: 15px;
        }
        .cart-drawer__items {
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .cart-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: var(--neutral-50);
          border-radius: var(--radius-md);
          border: 1px solid var(--neutral-100);
        }
        .cart-item__img {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }
        .cart-item__info { flex: 1; min-width: 0; }
        .cart-item__name { font-size: 14px; font-weight: 600; color: var(--neutral-800); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cart-item__price { font-size: 13px; color: var(--neutral-500); margin-bottom: 8px; }
        .cart-item__qty { display: flex; align-items: center; gap: 8px; }
        .cart-item__qty span { font-size: 14px; font-weight: 600; min-width: 20px; text-align: center; }
        .cart-item__qty-btn {
          width: 24px; height: 24px;
          border-radius: 50%;
          background: var(--white);
          border: 1.5px solid var(--neutral-200);
          display: flex; align-items: center; justify-content: center;
          color: var(--neutral-600);
          transition: all 0.15s;
        }
        .cart-item__qty-btn:hover:not(:disabled) { border-color: var(--green-500); color: var(--green-600); }
        .cart-item__qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .cart-item__right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .cart-item__total { font-size: 15px; font-weight: 700; color: var(--green-700); }
        .cart-item__remove {
          color: var(--neutral-400);
          padding: 4px;
          border-radius: 4px;
          transition: color 0.15s, background 0.15s;
        }
        .cart-item__remove:hover { color: var(--red-500); background: var(--neutral-100); }
        .cart-drawer__footer {
          padding: 20px 24px;
          border-top: 1px solid var(--neutral-200);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .cart-drawer__subtotal {
          display: flex;
          justify-content: space-between;
          font-size: 18px;
          font-weight: 700;
        }
        .cart-drawer__note { font-size: 12px; color: var(--neutral-400); text-align: center; }
      `}</style>
    </>
  );
}
