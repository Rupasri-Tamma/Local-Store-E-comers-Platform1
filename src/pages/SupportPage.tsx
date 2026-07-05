import { useState } from 'react';
import { MessageSquare, Phone, Mail, MapPin, Clock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

const FAQS = [
  { q: 'How long does delivery take?', a: 'Same-day delivery is available for orders placed before 2 PM. Standard orders are delivered within 1-2 business days.' },
  { q: 'Is there a minimum order value?', a: 'There is no minimum order value. However, orders under $30 incur a $4.99 delivery fee. Orders $30 and above qualify for free shipping.' },
  { q: 'How do I track my order?', a: 'After placing an order, you will receive a tracking number. Visit our Order Tracking page and enter your tracking number to see real-time status.' },
  { q: 'What is your return policy?', a: 'We accept returns within 24 hours of delivery for any damaged or incorrect items. Please contact us with your order tracking number and photos of the issue.' },
  { q: 'Are your products fresh and local?', a: 'Yes! All our products are sourced from local farms and suppliers within a 50-mile radius. We restock daily to ensure freshness.' },
  { q: 'Can I modify or cancel my order?', a: 'You can modify or cancel your order within 30 minutes of placing it. After that, orders are already in preparation. Contact support immediately if you need to make changes.' },
];

export default function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const { error: err } = await supabase.from('support_tickets').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    if (err) {
      setError('Failed to submit. Please try again or contact us directly.');
      setSubmitting(false);
      return;
    }
    setSuccess(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setSubmitting(false);
  }

  return (
    <div className="page">
      <div className="support-hero">
        <div className="container support-hero__content">
          <MessageSquare size={40} strokeWidth={1.5} style={{ color: 'var(--green-400)' }} />
          <h1 className="support-hero__title">Customer Support</h1>
          <p className="support-hero__sub">We're here to help! Reach out via any of the channels below.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>
        {/* Contact cards */}
        <div className="contact-cards">
          {[
            { icon: Phone, label: 'Call Us', value: '+1 (555) 123-4567', sub: 'Mon–Sat, 8 AM – 8 PM' },
            { icon: Mail, label: 'Email Us', value: 'support@localmart.com', sub: 'We reply within 24 hours' },
            { icon: MapPin, label: 'Visit Us', value: '42 Market Street, Downtown', sub: 'Mon–Sat 8 AM – 9 PM, Sun 9 AM – 6 PM' },
            { icon: Clock, label: 'Store Hours', value: 'Mon–Sun: Open Daily', sub: 'Online orders 24/7' },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="contact-card">
              <div className="contact-card__icon"><Icon size={22} strokeWidth={1.8} /></div>
              <div>
                <p className="contact-card__label">{label}</p>
                <p className="contact-card__value">{value}</p>
                <p className="contact-card__sub">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="support-layout">
          {/* Contact form */}
          <div className="support-form-card">
            <h2 className="support-section-title">Send Us a Message</h2>
            {success ? (
              <div className="success-msg fade-in">
                <CheckCircle size={40} strokeWidth={1.5} style={{ color: 'var(--green-500)' }} />
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button className="btn btn-secondary" onClick={() => setSuccess(false)}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Your Name *</label>
                    <input className="input" placeholder="John Doe" value={form.name} onChange={e => update('name', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="input" type="email" placeholder="john@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <select className="input" value={form.subject} onChange={e => update('subject', e.target.value)} required style={{ cursor: 'pointer' }}>
                    <option value="">Select a topic...</option>
                    <option>Order Issue</option>
                    <option>Delivery Problem</option>
                    <option>Product Quality</option>
                    <option>Billing Question</option>
                    <option>Return / Refund</option>
                    <option>General Inquiry</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea className="input" placeholder="Describe your issue or question in detail..." value={form.message} onChange={e => update('message', e.target.value)} required style={{ minHeight: 140 }} />
                </div>
                {error && <p style={{ color: 'var(--red-500)', fontSize: 13 }}>{error}</p>}
                <button className="btn btn-primary btn-lg" type="submit" disabled={submitting} style={{ justifyContent: 'center' }}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* FAQs */}
          <div>
            <h2 className="support-section-title">Frequently Asked Questions</h2>
            <div className="faq-list">
              {FAQS.map((faq, i) => (
                <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                  <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{faq.q}</span>
                    {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {openFaq === i && (
                    <div className="faq-answer fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .support-hero {
          background: linear-gradient(135deg, var(--green-800) 0%, var(--green-700) 100%);
          padding: 80px 0 60px;
        }
        .support-hero__content {
          display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;
        }
        .support-hero__title { font-family: var(--font-display); font-size: 40px; font-weight: 700; color: white; }
        .support-hero__sub { font-size: 16px; color: rgba(255,255,255,0.75); }
        .contact-cards {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 16px; margin-bottom: 56px;
        }
        .contact-card {
          background: white; border: 1.5px solid var(--neutral-100);
          border-radius: var(--radius-lg); padding: 20px;
          display: flex; gap: 14px; align-items: flex-start;
          box-shadow: var(--shadow-sm); transition: box-shadow 0.2s;
        }
        .contact-card:hover { box-shadow: var(--shadow-md); }
        .contact-card__icon {
          width: 44px; height: 44px; border-radius: var(--radius-md);
          background: var(--green-50); color: var(--green-600);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .contact-card__label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--green-600); margin-bottom: 4px; }
        .contact-card__value { font-size: 14px; font-weight: 700; color: var(--neutral-800); }
        .contact-card__sub { font-size: 12px; color: var(--neutral-400); margin-top: 2px; }
        .support-layout { display: grid; grid-template-columns: 1fr 440px; gap: 40px; align-items: start; }
        .support-form-card {
          background: white; border: 1.5px solid var(--neutral-100);
          border-radius: var(--radius-lg); padding: 32px;
        }
        .support-section-title { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--neutral-900); margin-bottom: 24px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 13px; font-weight: 600; color: var(--neutral-600); }
        .success-msg {
          text-align: center; padding: 40px 20px;
          display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .success-msg h3 { font-size: 20px; font-weight: 700; }
        .success-msg p { font-size: 15px; color: var(--neutral-500); }
        .faq-list { display: flex; flex-direction: column; gap: 8px; }
        .faq-item {
          background: white; border: 1.5px solid var(--neutral-100);
          border-radius: var(--radius-md); overflow: hidden;
          transition: border-color 0.2s;
        }
        .faq-item.open { border-color: var(--green-300); }
        .faq-question {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: 16px 20px; font-size: 14px; font-weight: 600;
          color: var(--neutral-800); text-align: left;
          transition: background 0.15s; background: white;
        }
        .faq-question:hover { background: var(--green-50); }
        .faq-item.open .faq-question { background: var(--green-50); color: var(--green-800); }
        .faq-answer {
          padding: 0 20px 16px;
          font-size: 14px; color: var(--neutral-600); line-height: 1.7;
          background: var(--green-50);
        }
        @media (max-width: 1100px) {
          .contact-cards { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .support-layout { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .contact-cards { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
