import Exa from 'exa-js';

let _exa: InstanceType<typeof Exa> | null = null;

/**
 * Lazily construct the Exa client. Returns null when EXA_API_KEY is unset so callers can
 * degrade gracefully instead of throwing (cold-start must still work key-less).
 */
function getExa(): InstanceType<typeof Exa> | null {
  if (!process.env.EXA_API_KEY) return null;
  if (!_exa) _exa = new Exa(process.env.EXA_API_KEY);
  return _exa;
}

export interface ResearchResult {
  findings: string;
  sources: { title: string; url: string }[];
}

export interface ColdResearchBrief {
  sites_involved: string[];
  estimated_steps: number;
  cross_site_moments: string[];
  known_failure_points: string[];
  sources: { title: string; url: string; relevance: number }[];
  raw_docs: string;
}

export async function researchFailure(
  site: string,
  errorSignal: string,
  nodeInstruction: string
): Promise<ResearchResult> {
  const exa = getExa();
  if (!exa) return { findings: '', sources: [] };
  try {
    const query = `${site} ${nodeInstruction} error ${errorSignal}`;
    const results = await exa.searchAndContents(query, {
      type: 'auto',
      numResults: 3,
      text: { maxCharacters: 4000, includeHtmlTags: false },
    });

    if (!results.results || results.results.length === 0) {
      return { findings: '', sources: [] };
    }

    const findings = results.results
      .map((r) => `### ${r.title}\nSource: ${r.url}\n\n${r.text}`)
      .join('\n\n---\n\n');

    const sources = results.results.map((r) => ({
      title: r.title || 'Untitled',
      url: r.url,
    }));

    return { findings, sources };
  } catch {
    return { findings: '', sources: [] };
  }
}

export async function researchColdFlow(
  userQuery: string,
  site?: string
): Promise<ColdResearchBrief> {
  const exa = getExa();

  // No Exa key → degrade to "plan from the query alone": detect sites from query keywords
  // only, emit an empty doc corpus. The planner still runs against the user's request.
  if (!exa) {
    const detectedSites = extractSiteDomains([], userQuery);
    const crossSiteMoments =
      detectedSites.length > 1
        ? [`Flow involves ${detectedSites.length} sites: ${detectedSites.join(' → ')}`]
        : [];
    return {
      sites_involved: detectedSites,
      estimated_steps: 6,
      cross_site_moments: crossSiteMoments,
      known_failure_points: [],
      sources: [],
      raw_docs: '',
    };
  }

  // Multi-query research campaign
  const queries = buildSearchQueries(userQuery, site);

  const results = await Promise.all(
    queries.map(async (q) => {
      try {
        const res = await exa.searchAndContents(q.query, {
          type: 'auto',
          numResults: q.numResults || 3,
          text: { maxCharacters: q.maxChars || 5000, includeHtmlTags: false },
        });
        return { category: q.category, results: res.results || [] };
      } catch {
        return { category: q.category, results: [] };
      }
    })
  );

  // Extract sites involved from URLs
  const allUrls = results.flatMap((r) => r.results.map((rr) => rr.url));
  const detectedSites = extractSiteDomains(allUrls, userQuery);

  // Compile sources with relevance
  const sources = results.flatMap((r) =>
    r.results.map((rr) => ({
      title: rr.title || 'Untitled',
      url: rr.url,
      relevance: rr.score ?? 0.5,
    }))
  );

  // Separate failure-specific findings
  const failureResults = results.find((r) => r.category === 'failures');
  const knownFailures = failureResults?.results
    .map((r) => r.title || '')
    .filter((t) => t.length > 0)
    .slice(0, 5) || [];

  // Compile raw docs for planner
  const rawDocs = results
    .flatMap((r) =>
      r.results.map(
        (rr) => `### ${rr.title}\nCategory: ${r.category}\nSource: ${rr.url}\n\n${rr.text}`
      )
    )
    .join('\n\n---\n\n');

  // Estimate steps from doc content length and complexity
  const estimatedSteps = Math.max(4, Math.min(15, Math.ceil(rawDocs.length / 3000)));

  // Detect cross-site moments
  const crossSiteMoments: string[] = [];
  if (detectedSites.length > 1) {
    crossSiteMoments.push(
      `Flow involves ${detectedSites.length} sites: ${detectedSites.join(' → ')}`
    );
  }

  return {
    sites_involved: detectedSites,
    estimated_steps: estimatedSteps,
    cross_site_moments: crossSiteMoments,
    known_failure_points: knownFailures,
    sources: sources.sort((a, b) => b.relevance - a.relevance).slice(0, 10),
    raw_docs: rawDocs,
  };
}

function buildSearchQueries(userQuery: string, site?: string) {
  const queries = [];
  const siteHint = site || '';

  // Primary: official docs from the software itself
  queries.push({
    category: 'official',
    query: `${userQuery} official documentation setup guide ${siteHint}`,
    numResults: 4,
    maxChars: 6000,
  });

  // Secondary: the OTHER site's perspective (for cross-site flows)
  const crossSiteTerms = extractCrossSiteTerms(userQuery);
  if (crossSiteTerms) {
    queries.push({
      category: 'cross_site',
      query: `${crossSiteTerms} integration setup documentation`,
      numResults: 3,
      maxChars: 5000,
    });
  }

  // Freshness: recent guides (catches UI changes)
  queries.push({
    category: 'recent',
    query: `${userQuery} step by step guide 2024 2025`,
    numResults: 3,
    maxChars: 4000,
  });

  // Failures: known error modes (pre-loads failure context for node verify_conditions)
  queries.push({
    category: 'failures',
    query: `${userQuery} common errors troubleshooting problems`,
    numResults: 3,
    maxChars: 3000,
  });

  return queries;
}

function extractCrossSiteTerms(query: string): string | null {
  const crossIndicators = [
    /(\w+)\s+(?:to|with|into|from)\s+(\w+)/i,
    /connect\s+(\w+)\s+(\w+)/i,
    /integrate\s+(\w+)\s+(\w+)/i,
  ];

  for (const regex of crossIndicators) {
    const match = query.match(regex);
    if (match) {
      return `${match[1]} ${match[2]}`;
    }
  }
  return null;
}

function extractSiteDomains(urls: string[], query: string): string[] {
  const domains = new Set<string>();

  for (const url of urls) {
    try {
      const host = new URL(url).hostname.replace('www.', '');
      if (host.includes('help.') || host.includes('docs.') || host.includes('support.')) {
        const parts = host.split('.');
        const brand = parts.find((p) => !['help', 'docs', 'support', 'com', 'io', 'dev'].includes(p));
        if (brand) domains.add(brand);
      }
    } catch { /* invalid URL */ }
  }

  // Also extract from query keywords
  const knownSites: Record<string, string> = {
    shopify: 'admin.shopify.com',
    stripe: 'dashboard.stripe.com',
    meta: 'business.facebook.com',
    facebook: 'business.facebook.com',
    google: 'ads.google.com',
    mailchimp: 'admin.mailchimp.com',
    hubspot: 'app.hubspot.com',
  };

  const queryLower = query.toLowerCase();
  for (const [keyword, domain] of Object.entries(knownSites)) {
    if (queryLower.includes(keyword)) {
      domains.add(domain);
    }
  }

  return Array.from(domains);
}
