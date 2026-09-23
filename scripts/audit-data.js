const fs = require('fs');

// 1. Audit services.js
const { servicesData } = require('../client/src/data/services.js');
console.log('--- AUDIT services.js ---');
console.log(`Total services: ${servicesData.length}`);
servicesData.forEach((s, idx) => {
  if (!s.name_vi || !s.name_en) console.log(`Service #${idx} (${s.id}) missing name: vi=${!!s.name_vi}, en=${!!s.name_en}`);
  if (!s.description_vi || !s.description_en) console.log(`Service #${idx} (${s.id}) missing desc: vi=${!!s.description_vi}, en=${!!s.description_en}`);
});

// 2. Audit testimonials.js
const { testimonialsData, googleMapsCommunityPhotos } = require('../client/src/data/testimonials.js');
console.log('\n--- AUDIT testimonials.js ---');
console.log(`Total testimonials: ${testimonialsData.length}`);
testimonialsData.forEach((t, idx) => {
  if (!t.quote_vi || !t.quote_en) console.log(`Testimonial #${idx} (${t.id}) missing quote: vi=${!!t.quote_vi}, en=${!!t.quote_en}`);
  if (!t.service_vi || !t.service_en) console.log(`Testimonial #${idx} (${t.id}) missing service: vi=${!!t.service_vi}, en=${!!t.service_en}`);
});
console.log(`Total Google community photos: ${googleMapsCommunityPhotos.length}`);
googleMapsCommunityPhotos.forEach((p, idx) => {
  if (!p.captionVi || !p.captionEn) console.log(`Photo #${idx} (${p.id}) missing caption: vi=${!!p.captionVi}, en=${!!p.captionEn}`);
});

// 3. Audit caseStudies.js
const { caseStudiesData } = require('../client/src/data/caseStudies.js');
console.log('\n--- AUDIT caseStudies.js ---');
console.log(`Total case studies: ${caseStudiesData.length}`);
caseStudiesData.forEach((c, idx) => {
  const fields = ['title', 'serviceName', 'shape', 'duration', 'technique', 'description', 'category'];
  fields.forEach(f => {
    if (!c[`${f}_vi`] || !c[`${f}_en`]) console.log(`Case study #${idx} (${c.id}) missing ${f}: vi=${!!c[`${f}_vi`]}, en=${!!c[`${f}_en`]}`);
  });
  if (!c.highlights_vi || !c.highlights_en) console.log(`Case study #${idx} (${c.id}) missing highlights`);
});

// 4. Audit faqData.js
const { FAQ_CATEGORIES, FAQ_ITEMS } = require('../client/src/data/faqData.js');
console.log('\n--- AUDIT faqData.js ---');
console.log(`Total categories: ${FAQ_CATEGORIES.length}`);
FAQ_CATEGORIES.forEach((cat, idx) => {
  if (!cat.labelVi || !cat.labelEn) console.log(`FAQ Category #${idx} missing label`);
});
console.log(`Total FAQ items: ${FAQ_ITEMS.length}`);
FAQ_ITEMS.forEach((item, idx) => {
  if (!item.qVi || !item.qEn) console.log(`FAQ item #${idx} (${item.id}) missing question`);
  if (!item.aVi || !item.aEn) console.log(`FAQ item #${idx} (${item.id}) missing answer`);
  if (!item.tagVi || !item.tagEn) console.log(`FAQ item #${idx} (${item.id}) missing tag`);
});

console.log('\nAudit complete!');
