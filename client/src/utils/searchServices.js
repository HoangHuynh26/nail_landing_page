/**
 * Accent-Insensitive and Relevance-Ranked Search for Fashion Nails Services
 * Finds all matching services across the entire catalog and ranks best matches first.
 */

export function removeDiacritics(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .trim();
}

export const removeVietnameseTones = removeDiacritics;

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
  const cleanQ = removeDiacritics(trimmed);
  const queryTokens = cleanQ.split(/\s+/).filter(Boolean);

  const scored = allServices.map(service => {
    let score = 0;
    const name = (service.name || service.name_en || '').toLowerCase();
    const desc = (service.description || service.description_en || '').toLowerCase();
    const cat = (service.category || '').toLowerCase();

    // 1. Exact name match (Highest priority)
    if (name === rawQ) {
      score += 300;
    }

    // 2. Name starts with query
    if (name.startsWith(rawQ)) {
      score += 150;
    }

    // 3. Name contains full query
    if (name.includes(rawQ)) {
      score += 90;
    }

    // 4. Description contains full query
    if (desc.includes(rawQ)) {
      score += 45;
    }

    // 5. Category matches query
    if (cat === rawQ || cat.includes(rawQ) || rawQ.includes(cat)) {
      score += 40;
    }

    // 6. Token matching in name and description
    let nameTokenMatches = 0;
    let descTokenMatches = 0;

    queryTokens.forEach(token => {
      const lowerToken = token.toLowerCase();
      if (name.includes(lowerToken)) {
        score += 30;
        nameTokenMatches++;
      } else if (desc.includes(lowerToken)) {
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
