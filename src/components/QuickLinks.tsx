import React from 'react';
import { useCart } from '../context/CartContext.js';
import { IconBolt, IconTruck, IconCreditCard, IconLeaf, IconArrowRight } from './Icons.js';

export const QuickLinks: React.FC = () => {
  const { openCart } = useCart();

  const scrollToCatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    const catalogSection = document.getElementById('product-catalog-section');
    catalogSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const perks = [
    {
      icon: <IconBolt size={22} className="perk-icon text-amber" />,
      title: 'Lightning Deals',
      desc: 'Save up to 45% today',
      action: scrollToCatalog,
      badge: 'Limited'
    },
    {
      icon: <IconTruck size={22} className="perk-icon text-blue" />,
      title: 'Express Delivery',
      desc: 'Free on orders ₹499+',
      action: () => openCart(),
      badge: 'Fast'
    },
    {
      icon: <IconCreditCard size={22} className="perk-icon text-emerald" />,
      title: 'Secure Payments',
      desc: 'Razorpay UPI & Cards',
      action: () => openCart(),
      badge: 'Protected'
    },
    {
      icon: <IconLeaf size={22} className="perk-icon text-teal" />,
      title: 'Conscious Craft',
      desc: 'Eco-certified sourcing',
      action: scrollToCatalog,
      badge: '100% Genuine'
    }
  ];

  return (
    <section className="quick-links-modern" aria-label="Store Benefits & Value Highlights">
      {perks.map((perk, idx) => (
        <div
          key={idx}
          className="perk-card"
          onClick={perk.action}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              perk.action(e as unknown as React.MouseEvent);
            }
          }}
        >
          <div className="perk-icon-wrapper">{perk.icon}</div>
          <div className="perk-content">
            <div className="perk-header">
              <strong className="perk-title">{perk.title}</strong>
              <span className="perk-badge">{perk.badge}</span>
            </div>
            <span className="perk-desc">{perk.desc}</span>
          </div>
          <IconArrowRight size={14} className="perk-arrow" />
        </div>
      ))}
    </section>
  );
};
