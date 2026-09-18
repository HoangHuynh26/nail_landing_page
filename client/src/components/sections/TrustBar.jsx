import React from 'react';
import { Sparkles, Shield, HeartHandshake, Coffee } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function TrustBar() {
  const { t } = useLanguage();

  const trustItems = [
    {
      icon: Sparkles,
      title: t('trust.item1.title'),
      desc: t('trust.item1.desc')
    },
    {
      icon: Shield,
      title: t('trust.item2.title'),
      desc: t('trust.item2.desc')
    },
    {
      icon: HeartHandshake,
      title: t('trust.item3.title'),
      desc: t('trust.item3.desc')
    },
    {
      icon: Coffee,
      title: t('trust.item4.title'),
      desc: t('trust.item4.desc')
    }
  ];

  return (
    <section className="trust-bar" aria-label="Our Core Standards">
      <div className="container trust-bar__inner">
        <div className="trust-bar__grid">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="trust-bar__card">
                <div className="trust-bar__icon-box">
                  <Icon size={20} className="trust-bar__icon" aria-hidden="true" />
                </div>
                <div className="trust-bar__content">
                  <h3 className="trust-bar__title">{item.title}</h3>
                  <p className="trust-bar__desc">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TrustBar;
