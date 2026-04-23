// Vercel Serverless Function - 群友行程日历 API
// 使用 Upstash Redis (通过 @vercel/kv 兼容层)

import { createClient } from "@vercel/kv";

// 创建 KV 客户端，自动读取 Vercel 注入的环境变量
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

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
      const data = await kv.get(key);
      const events = data ? JSON.parse(data) : [];
      return res.status(200).json(events);
    } catch (err) {
      console.error("GET error:", err);
      return res.status(500).json({ error: "Failed to fetch events" });
    }
  }

  // POST - 添加行程
  if (req.method === "POST") {
    try {
      const { name, date, content } = req.body;
      const data = await kv.get(key);
      const events = data ? JSON.parse(data) : [];

      const newEvent = {
        id: Date.now().toString(),
        name: name || "匿名",
        date,
        content,
        createdAt: new Date().toISOString(),
      };

      events.push(newEvent);
      await kv.set(key, JSON.stringify(events));

      return res.status(200).json(newEvent);
    } catch (err) {
      console.error("POST error:", err);
      return res.status(500).json({ error: "Failed to add event" });
    }
  }

  // DELETE - 删除行程
  if (req.method === "DELETE") {
    try {
      const data = await kv.get(key);
      let events = data ? JSON.parse(data) : [];

      events = events.filter((e) => e.id !== id);
      await kv.set(key, JSON.stringify(events));

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("DELETE error:", err);
      return res.status(500).json({ error: "Failed to delete event" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
