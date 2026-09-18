/**
 * Vietnamese Diacritic-Insensitive and Relevance-Ranked Search for Fashion Nails Services
 * Finds all matching services across the entire catalog and ranks best matches first.
 */

export function removeVietnameseTones(str) {
  if (!str) return '';
  let s = str.toLowerCase();
  s = s.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  s = s.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  s = s.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  s = s.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  s = s.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  s = s.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  s = s.replace(/đ/g, 'd');
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return s.trim();
}

/**
 * Searches servicesData across all categories with relevance scoring
 */
export function rankAndFilterServices(allServices, query, activeCategory) {
  const trimmed = query ? query.trim() : '';

  // If no search query, filter strictly by selected category
  if (!trimmed) {
    if (activeCategory === 'all') return allServices;
    return allServices.filter(s => s.category === activeCategory);
  }

  // Global search across ALL services
  const rawQ = trimmed.toLowerCase();
  const cleanQ = removeVietnameseTones(trimmed);
  const queryTokens = cleanQ.split(/\s+/).filter(Boolean);

  const scored = allServices.map(service => {
    let score = 0;
    const nameVi = service.name_vi.toLowerCase();
    const nameEn = service.name_en.toLowerCase();
    const descVi = service.description_vi.toLowerCase();
    const descEn = service.description_en.toLowerCase();
    const cat = service.category.toLowerCase();

    const cNameVi = removeVietnameseTones(service.name_vi);
    const cNameEn = removeVietnameseTones(service.name_en);
    const cDescVi = removeVietnameseTones(service.description_vi);
    const cDescEn = removeVietnameseTones(service.description_en);

    // 1. Exact name match (Highest priority)
    if (nameVi === rawQ || nameEn === rawQ || cNameVi === cleanQ || cNameEn === cleanQ) {
      score += 300;
    }

    // 2. Name starts with query
    if (cNameVi.startsWith(cleanQ) || cNameEn.startsWith(cleanQ) || nameVi.startsWith(rawQ) || nameEn.startsWith(rawQ)) {
      score += 150;
    }

    // 3. Name contains full query
    if (cNameVi.includes(cleanQ) || cNameEn.includes(cleanQ) || nameVi.includes(rawQ) || nameEn.includes(rawQ)) {
      score += 90;
    }

    // 4. Description contains full query
    if (cDescVi.includes(cleanQ) || cDescEn.includes(cleanQ) || descVi.includes(rawQ) || descEn.includes(rawQ)) {
      score += 45;
    }

    // 5. Category matches query
    if (cat === cleanQ || cat.includes(cleanQ) || cleanQ.includes(cat)) {
      score += 40;
    }

    // 6. Token matching in name and description
    let nameTokenMatches = 0;
    let descTokenMatches = 0;

    queryTokens.forEach(token => {
      if (cNameVi.includes(token) || cNameEn.includes(token)) {
        score += 30;
        nameTokenMatches++;
      } else if (cDescVi.includes(token) || cDescEn.includes(token)) {
        score += 12;
        descTokenMatches++;
      }
    });

    const totalTokenMatches = nameTokenMatches + descTokenMatches;

    // Multi-word queries: penalize if not all tokens matched
    if (queryTokens.length > 1) {
      if (totalTokenMatches < queryTokens.length) {
        score = 0; // Filter out partial non-matches
      } else {
        score += 60; // Big bonus for matching all words!
        if (nameTokenMatches === queryTokens.length) {
          score += 40; // All words appear in the service name!
        }
      }
    }

    // Featured bonus as subtle tie-breaker (ONLY if there is already a real match)
    if (score > 0 && service.featured) {
      score += 2;
    }

    return { service, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.service);
}
