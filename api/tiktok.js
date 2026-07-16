    // api/tiktok.js
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // 1. TikTok公式oEmbed APIを叩く
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const oembedRes = await fetch(oembedUrl);
    const oembedData = await oembedRes.json();

    // 2. 詳細なキャプション取得のため、HTMLをパース
    // TikTok側からのブロックを避けるため、User-Agentを設定
    const htmlRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
      }
    });
    const html = await htmlRes.text();

    // metaタグ(og:description)からキャプションを抽出
    const descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
    const caption = descMatch ? descMatch[1] : (oembedData.title || "");

    return res.status(200).json({
      title: oembedData.title,
      author: oembedData.author_name,
      caption: caption,
      thumbnail: oembedData.thumbnail_url
    });
  } catch (error) {
    console.error('TikTok Fetch Error:', error);
    return res.status(500).json({ error: 'Failed to fetch TikTok data' });
  }
}