// api/tiktok.js
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // 1. TikTok oEmbed API（基本情報）
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const oembedRes = await fetch(oembedUrl);
    const oembedData = await oembedRes.json();

    // 2. 詳細なキャプション取得のためのHTML取得
    const htmlRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      }
    });
    const html = await htmlRes.text();

    // og:description (キャプション) の抽出精度を上げる
    let caption = "";
    const descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
    if (descMatch) {
      caption = descMatch[1];
    } else {
      // 予備の抽出方法（name="description"）
      const nameMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
      caption = nameMatch ? nameMatch[1] : oembedData.title || "";
    }

    // HTML実体参照（&amp; 等）を解除
    caption = caption.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');

    return res.status(200).json({
      title: oembedData.title || "",
      author: oembedData.author_name || "",
      caption: caption || ""
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return res.status(500).json({ error: '取得に失敗しました' });
  }
}