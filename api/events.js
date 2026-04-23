// Vercel Serverless Function - 群友行程日历 API
// 部署方式：推送到 GitHub，在 Vercel 导入仓库自动部署

export default async function handler(req, res) {
  // CORS 头
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { room = "default", id } = req.query;
  const key = `events_${room}`;

  // GET - 获取行程列表
  if (req.method === "GET") {
    try {
      const data = await getKVData(key);
      const events = data ? JSON.parse(data) : [];
      return res.status(200).json(events);
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch events" });
    }
  }

  // POST - 添加行程
  if (req.method === "POST") {
    try {
      const { name, date, content } = req.body;
      const data = await getKVData(key);
      const events = data ? JSON.parse(data) : [];

      const newEvent = {
        id: Date.now().toString(),
        name: name || "匿名",
        date,
        content,
        createdAt: new Date().toISOString(),
      };

      events.push(newEvent);
      await setKVData(key, JSON.stringify(events));

      return res.status(200).json(newEvent);
    } catch (err) {
      return res.status(500).json({ error: "Failed to add event" });
    }
  }

  // DELETE - 删除行程
  if (req.method === "DELETE") {
    try {
      const data = await getKVData(key);
      let events = data ? JSON.parse(data) : [];

      events = events.filter((e) => e.id !== id);
      await setKVData(key, JSON.stringify(events));

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete event" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}

// 使用 Vercel KV 存储数据
// 注意：需要在 Vercel 控制台绑定 KV 存储
async function getKVData(key) {
  // 这里使用 Vercel KV 的 API
  // 实际部署时需要在 Vercel 控制台配置 KV 绑定
  const { kv } = await import("@vercel/kv");
  return kv.get(key);
}

async function setKVData(key, value) {
  const { kv } = await import("@vercel/kv");
  return kv.set(key, value);
}
