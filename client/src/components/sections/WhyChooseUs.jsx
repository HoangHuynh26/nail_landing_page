import React from 'react';
import { Award, ShieldCheck, Leaf, Clock4 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SectionHeader } from '../ui/SectionHeader';

export function WhyChooseUs() {
  const { t } = useLanguage();

  const reasons = [
    {
      icon: Award,
      title: t('whyUs.card1.title'),
      desc: t('whyUs.card1.desc')
    },
    {
      icon: ShieldCheck,
      title: t('whyUs.card2.title'),
      desc: t('whyUs.card2.desc')
    },
    {
      icon: Leaf,
      title: t('whyUs.card3.title'),
      desc: t('whyUs.card3.desc')
    },
    {
      icon: Clock4,
      title: t('whyUs.card4.title'),
      desc: t('whyUs.card4.desc')
    }
  ];

  return (
    <section id="why-us" className="section why-us-section" aria-labelledby="why-us-heading">
      <div className="container">
        <SectionHeader
          title={t('whyUs.title')}
          subtitle={t('whyUs.subtitle')}
        />

        <div className="why-us-grid">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div key={index} className="why-us-card">
                <div className="why-us-card__icon-box">
                  <Icon size={24} className="why-us-card__icon" aria-hidden="true" />
                </div>
                <h3 className="why-us-card__title">{reason.title}</h3>
                <p className="why-us-card__desc">{reason.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
