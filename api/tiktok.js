// api/tiktok.js
export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    // TikTokのoEmbedを試行
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const oembedRes = await fetch(oembedUrl);
    const oembedData = await oembedRes.json();

    // HTMLから詳細情報を取得
    const htmlRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
      }
    });
    const html = await htmlRes.text();

    // og:title と og:description を確実に抜き出す
    const title = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)?.[1] || oembedData.title || "";
    const description = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)?.[1] || "";

    // 特殊文字の変換を解除（&amp; → & など）
    const decode = (str) => str.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

    return res.status(200).json({
      title: decode(title),
      caption: decode(description)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch', message: error.message });
  }
}