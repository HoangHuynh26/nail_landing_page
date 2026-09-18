import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Badge } from '../ui/Badge';

export function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="section about-section" aria-labelledby="about-heading">
      <div className="container about-section__inner">
        {/* Left Interior Image */}
        <div className="about-section__visual">
          <div className="about-section__frame">
              <img
                src="/images/about.jpg"
                alt="Fashion Nails Morley Galleria serene interior"
                className="about-section__image"
                loading="lazy"
                decoding="async"
                width="600"
                height="480"
              />
              <div className="about-section__caption">
                <span>Fashion Nails • Morley Galleria Shopping Centre, WA</span>
              </div>
          </div>
        </div>

        {/* Right Story Narrative */}
        <div className="about-section__content">
          <Badge variant="gold" className="about-section__badge">
            {t('about.badge')}
          </Badge>

          <h2 id="about-heading" className="about-section__title">
            {t('about.title')}
          </h2>

          <div className="about-section__paragraphs">
            <p>{t('about.p1')}</p>
            <p>{t('about.p2')}</p>
          </div>

          <blockquote className="about-section__quote">
            <p>{t('about.quote')}</p>
            <cite className="about-section__author">{t('about.author')}</cite>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

export default About;
