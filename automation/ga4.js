'use strict';

async function fetchGA4Stats(propertyId, keyFile) {
  if (!propertyId || !keyFile) {
    return { available: false, pages: [], reason: 'GA4_PROPERTY_ID ou GA4_KEY_FILE non configuré' };
  }

  const fs = require('fs');
  if (!fs.existsSync(keyFile)) {
    return { available: false, pages: [], reason: `Fichier clé introuvable : ${keyFile}` };
  }

  try {
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });
    const client = await auth.getClient();
    const token  = (await client.getAccessToken()).token;

    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'averageSessionDuration' },
            { name: 'bounceRate' },
          ],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 100,
        }),
      }
    );

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    if (!data.rows) return { available: true, pages: [] };

    const pages = data.rows.map(row => ({
      page:        row.dimensionValues[0].value,
      sessions:    parseInt(row.metricValues[0].value, 10),
      views:       parseInt(row.metricValues[1].value, 10),
      avgDuration: Math.round(parseFloat(row.metricValues[2].value)),
      bounceRate:  Math.round(parseFloat(row.metricValues[3].value) * 100),
    }));

    return { available: true, pages };
  } catch (err) {
    return { available: false, pages: [], reason: err.message };
  }
}

function formatGA4Report(pages) {
  if (!pages.length) return '  (aucune donnée)';
  return pages.slice(0, 15).map((p, i) =>
    `  ${String(i + 1).padStart(2)}. ${p.page.padEnd(50)} ${String(p.sessions).padStart(5)} sessions  ${p.avgDuration}s`
  ).join('\n');
}

module.exports = { fetchGA4Stats, formatGA4Report };
