const fetch = require('node-fetch');

// Node script to call the archive_activity_feed RPC.
// Usage: node scripts/run_archive_node.js <SUPABASE_URL> <SERVICE_KEY> [days] [limit]

async function main() {
  const [,, supabaseUrl, serviceKey, days = '90', limit = '2000'] = process.argv;
  if (!supabaseUrl || !serviceKey) {
    console.error('Usage: node scripts/run_archive_node.js <SUPABASE_URL> <SERVICE_KEY> [days] [limit]');
    process.exit(1);
  }

  const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/archive_activity_feed`;
  const body = { p_days: Number(days), p_limit: Number(limit) };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  console.log('Status:', res.status);
  console.log(text);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
