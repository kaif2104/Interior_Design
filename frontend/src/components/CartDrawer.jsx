import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orders';
import QRCodePayment from './QRCodePayment';
import './CartDrawer.css';

function CartDrawer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotal
  } = useCart();

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    clientName: user?.name || '',
    clientEmail: user?.email || '',
    clientPhone: user?.phone || '',
    street: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    paymentMethod: 'UPI / QR Code',
    notes: ''
  });

  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [orderReceipt, setOrderReceipt] = useState(null);

  if (!isCartOpen) return null;

  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    if (user) {
      setCheckoutForm((prev) => ({
        ...prev,
        clientName: prev.clientName || user.name || '',
        clientEmail: prev.clientEmail || user.email || '',
        clientPhone: prev.clientPhone || user.phone || ''
      }));
    }
    setShowCheckoutModal(true);
  };

  const handleProcessOrder = async (utrRef) => {
    setCheckoutError('');

    if (!checkoutForm.clientName || !checkoutForm.clientEmail || !checkoutForm.clientPhone) {
      setCheckoutError('Recipient name, email address, and phone number are required.');
      return;
    }

    if (!checkoutForm.street || !checkoutForm.city || !checkoutForm.pincode) {
      setCheckoutError('Please provide a complete delivery street address and PIN code.');
      return;
    }

    setProcessing(true);

    try {
      const orderPayload = {
        clientName: checkoutForm.clientName,
        clientEmail: checkoutForm.clientEmail,
        clientPhone: checkoutForm.clientPhone,
        items: cart.map((item) => ({
          itemId: item._id?.length === 24 ? item._id : undefined,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
          material: item.material,
          dimensions: item.dimensions
        })),
        totalAmount: cartSubtotal,
        shippingAddress: {
          street: checkoutForm.street,
          city: checkoutForm.city,
          state: checkoutForm.state,
          pincode: checkoutForm.pincode
        },
        paymentMethod: checkoutForm.paymentMethod,
        notes: utrRef ? `Paid via UPI (Ref: ${utrRef}). ${checkoutForm.notes || ''}` : checkoutForm.notes,
        userId: user?.id || user?._id || undefined
      };

      const res = await createOrder(orderPayload);
      setOrderReceipt(res.data.order);
      clearCart();
      setShowCheckoutModal(false);
    } catch (err) {
      console.error('Error placing cart order:', err);
      setCheckoutError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="cart-backdrop" onClick={closeCart}></div>

      {/* Slide-out Drawer */}
      <div className="cart-drawer-container">
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-header-title">
            <h3>Studio Shopping Cart</h3>
            <span className="cart-badge-pill">{cartCount} items</span>
          </div>
          <button className="btn-close-cart" onClick={closeCart}>
            ✕
          </button>
        </div>

        {/* Free Shipping Alert */}
        <div className="cart-shipping-banner">
          <span className="banner-icon">🚚</span>
          <span>
            <strong>Free Insured White-Glove Delivery</strong> unlocked on all interior studio orders!
          </span>
        </div>

        {/* Cart Body */}
        {cart.length === 0 ? (
          <div className="cart-empty-state">
            <div className="empty-cart-icon">🛋️</div>
            <h4>Your design cart is empty</h4>
            <p>
              Discover statement lighting, ergonomic seating, handcrafted cupboards, textured wallpapers, and luxury decor.
            </p>
            <button
              className="btn-explore-catalog"
              onClick={() => {
                closeCart();
                navigate('/items');
              }}
            >
              Explore Furnishings Catalog →
            </button>
          </div>
        ) : (
          <div className="cart-items-scroll">
            {cart.map((item) => (
              <div key={item._id} className="cart-item-card">
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-thumb"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                <div className="cart-item-details">
                  <span className="cart-item-category">{item.category}</span>
                  <h4 className="cart-item-name">{item.name}</h4>

                  {item.material && (
                    <div className="cart-item-spec">{item.material}</div>
                  )}

                  <div className="cart-item-price-row">
                    <div className="cart-item-price">
                      ₹{(item.price * item.quantity).toLocaleString()}
                      {item.quantity > 1 && (
                        <span className="cart-unit-price">
                          (₹{item.price.toLocaleString()} each)
                        </span>
                      )}
                    </div>

                    {/* Stepper Controls */}
                    <div className="cart-qty-stepper">
                      <button
                        type="button"
                        className="btn-qty-step"
                        onClick={() => updateQuantity(item._id, -1)}
                      >
                        -
                      </button>
                      <span className="qty-number">{item.quantity}</span>
                      <button
                        type="button"
                        className="btn-qty-step"
                        onClick={() => updateQuantity(item._id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  className="btn-remove-item"
                  title="Remove item"
                  onClick={() => removeFromCart(item._id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer with Summary & Checkout */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-line">
              <span>Subtotal:</span>
              <span>₹{cartSubtotal.toLocaleString()}</span>
            </div>
            <div className="cart-summary-line">
              <span>Delivery & Unpacking:</span>
              <span style={{ color: '#27ae60', fontWeight: 'bold' }}>FREE</span>
            </div>
            <div className="cart-summary-line">
              <span>GST (18% inclusive):</span>
              <span>Included</span>
            </div>
            <div className="cart-total-line">
              <span>Estimated Total:</span>
              <span className="cart-total-val">₹{cartSubtotal.toLocaleString()}</span>
            </div>

            <button className="btn-cart-checkout" onClick={handleStartCheckout}>
              Proceed to Checkout & Pay (₹{cartSubtotal.toLocaleString()}) →
            </button>

            <div className="cart-guarantee-row">
              <span>🔒 256-Bit Escrow Encrypted</span>
              <span>🛡️ 100% Quality Assured</span>
            </div>
          </div>
        )}
      </div>

      {/* MULTI-ITEM CHECKOUT MODAL WITH DYNAMIC QR CODE */}
      {showCheckoutModal && (
        <div className="cart-checkout-overlay" onClick={() => setShowCheckoutModal(false)}>
          <div className="cart-checkout-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-icon"
              onClick={() => setShowCheckoutModal(false)}
            >
              ✕
            </button>

            <div className="checkout-modal-header">
              <span className="modal-category-chip">Studio Direct Procurement</span>
              <h3>Complete Your Furnishings Order</h3>
              <p>
                Ordering <strong>{cartCount} items</strong> for a total of{' '}
                <strong>₹{cartSubtotal.toLocaleString()}</strong>.
              </p>
            </div>

            {checkoutError && (
              <div className="checkout-error-banner">{checkoutError}</div>
            )}

            {/* Order Items Preview Scroll */}
            <div className="checkout-items-preview">
              {cart.map((item) => (
                <div key={item._id} className="preview-chip">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: '11px', color: '#777' }}>
                      Qty: {item.quantity} x ₹{item.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (checkoutForm.paymentMethod !== 'UPI / QR Code') handleProcessOrder(); }}>
              <h4 className="checkout-section-heading">
                1. Delivery & Billing Address
              </h4>

              <div className="checkout-form-grid">
                <div className="checkout-field">
                  <label>Recipient Name *</label>
                  <input
                    type="text"
                    className="checkout-input"
                    value={checkoutForm.clientName}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, clientName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    className="checkout-input"
                    placeholder="+91 98765 43210"
                    value={checkoutForm.clientPhone}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, clientPhone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="checkout-field full-span">
                  <label>Billing Email (For Tax Invoice Slip) *</label>
                  <input
                    type="email"
                    className="checkout-input"
                    value={checkoutForm.clientEmail}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, clientEmail: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="checkout-field full-span">
                  <label>Delivery Street Address / Flat / Building *</label>
                  <input
                    type="text"
                    className="checkout-input"
                    placeholder="e.g. 402, Royal Palms, High Street"
                    value={checkoutForm.street}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, street: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label>City *</label>
                  <input
                    type="text"
                    className="checkout-input"
                    value={checkoutForm.city}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, city: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label>PIN Code *</label>
                  <input
                    type="text"
                    className="checkout-input"
                    placeholder="e.g. 400050"
                    value={checkoutForm.pincode}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, pincode: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <h4 className="checkout-section-heading">
                2. Select Payment Method
              </h4>

              <div className="checkout-payment-grid">
                <div
                  className={`checkout-payment-card ${
                    checkoutForm.paymentMethod === 'UPI / QR Code' ? 'selected' : ''
                  }`}
                  onClick={() =>
                    setCheckoutForm({ ...checkoutForm, paymentMethod: 'UPI / QR Code' })
                  }
                >
                  <div>📱 Instant Dynamic UPI / QR</div>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>GPay, PhonePe, Paytm</div>
                </div>

                <div
                  className={`checkout-payment-card ${
                    checkoutForm.paymentMethod === 'Credit / Debit Card' ? 'selected' : ''
                  }`}
                  onClick={() =>
                    setCheckoutForm({ ...checkoutForm, paymentMethod: 'Credit / Debit Card' })
                  }
                >
                  <div>💳 Cards</div>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>Visa, Mastercard, RuPay</div>
                </div>

                <div
                  className={`checkout-payment-card ${
                    checkoutForm.paymentMethod === 'Net Banking' ? 'selected' : ''
                  }`}
                  onClick={() =>
                    setCheckoutForm({ ...checkoutForm, paymentMethod: 'Net Banking' })
                  }
                >
                  <div>🏦 Net Banking</div>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>All Major Banks</div>
                </div>

                <div
                  className={`checkout-payment-card ${
                    checkoutForm.paymentMethod === 'Cash on Delivery' ? 'selected' : ''
                  }`}
                  onClick={() =>
                    setCheckoutForm({ ...checkoutForm, paymentMethod: 'Cash on Delivery' })
                  }
                >
                  <div>💵 Cash on Delivery</div>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>Pay upon delivery</div>
                </div>
              </div>

              {/* DYNAMIC QR CODE DISPLAY WHEN UPI IS SELECTED */}
              {checkoutForm.paymentMethod === 'UPI / QR Code' && (
                <QRCodePayment
                  amount={cartSubtotal}
                  orderRef={`CART-${Date.now().toString().slice(-6)}`}
                  clientName={checkoutForm.clientName}
                  onPaymentConfirmed={(utr) => handleProcessOrder(utr)}
                />
              )}

              {checkoutForm.paymentMethod !== 'UPI / QR Code' && (
                <button
                  type="submit"
                  className="btn-confirm-order"
                  disabled={processing}
                >
                  {processing
                    ? 'Processing Purchase & Generating Bill...'
                    : `Confirm Purchase (₹${cartSubtotal.toLocaleString()}) →`}
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ORDER CONFIRMATION & TAX INVOICE SLIP */}
      {orderReceipt && (
        <div className="cart-checkout-overlay" onClick={() => setOrderReceipt(null)}>
          <div className="cart-checkout-modal" style={{ maxWidth: '580px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', margin: '0 0 6px', color: '#141414' }}>
              Furnishings Order Confirmed!
            </h2>
            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 20px' }}>
              Your item order has been verified and registered with a digital tax invoice.
            </p>

            <div className="invoice-slip-card">
              <div className="invoice-slip-row">
                <span>Order Reference:</span>
                <strong>{orderReceipt.orderNumber}</strong>
              </div>
              <div className="invoice-slip-row">
                <span>Tax Invoice No:</span>
                <strong>{orderReceipt.receiptNumber}</strong>
              </div>
              <div className="invoice-slip-row">
                <span>Customer:</span>
                <span>{orderReceipt.clientName} ({orderReceipt.clientEmail})</span>
              </div>
              <div className="invoice-slip-row">
                <span>Destination:</span>
                <span>
                  {orderReceipt.shippingAddress?.street}, {orderReceipt.shippingAddress?.city} - {orderReceipt.shippingAddress?.pincode}
                </span>
              </div>
              <div className="invoice-slip-row">
                <span>Payment Method:</span>
                <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{orderReceipt.paymentMethod} (PAID)</span>
              </div>
              <div className="invoice-slip-row total">
                <span>Grand Total Paid:</span>
                <span style={{ color: '#27ae60' }}>₹{orderReceipt.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-confirm-order"
                onClick={() => {
                  setOrderReceipt(null);
                  closeCart();
                  navigate('/billing?tab=items');
                }}
              >
                📄 View in Decor & Furnishings Billing Portal →
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-secondary-action"
                  onClick={() => window.print()}
                >
                  🖨️ Print Tax Invoice
                </button>
                <button
                  className="btn-secondary-action"
                  onClick={() => {
                    setOrderReceipt(null);
                    closeCart();
                  }}
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CartDrawer;
