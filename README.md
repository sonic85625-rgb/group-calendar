# 群友行程日历 — 部署指南

## 产品形态

一个网页链接分享到微信群，群友点开看到当月日历，点击日期添加自己的行程（昵称+内容），所有人实时同步看到。

每个群通过 URL 参数区分，例如：
- `https://你的域名.com/calendar.html?room=group001`（一群）
- `https://你的域名.com/calendar.html?room=group002`（二群）

---

## 架构

| 组件 | 技术 | 费用 |
|:---|:---|:---|
| 前端页面 | 纯 HTML/JS/CSS | 免费 |
| 前端托管 | GitHub Pages / Cloudflare Pages | 免费 |
| 后端 API | Cloudflare Worker | 免费（10万次/天）|
| 数据存储 | Cloudflare KV | 免费（1GB）|

---

## 部署步骤

### 第一步：部署后端（Cloudflare Worker）

1. 访问 https://dash.cloudflare.com/ 注册/登录
2. 左侧菜单 → **Workers & Pages** → **Create**
3. 选择 **Create Worker**
4. 给 Worker 起个名字（例如 `group-calendar-api`）
5. 点击 **Deploy**
6. 部署完成后点击 **Edit Code**
7. 把 `calendar-backend.js` 的内容完整粘贴进去，保存
8. 点击 **Settings** → **Variables** → **KV Namespace Bindings**
9. 点击 **Add binding**，Name 填 `GROUP_CALENDAR_KV`，选择或创建一个 KV namespace
10. 保存，返回代码页，重新 **Deploy**

记录你的 Worker 地址：`https://group-calendar-api.你的子域名.workers.dev`

### 第二步：修改前端配置

打开 `calendar.html`，找到这一行：

```javascript
const API_BASE = "https://你的-worker-地址.workers.dev";
```

替换为你的实际 Worker 地址。

### 第三步：部署前端（GitHub Pages）

1. 在 GitHub 新建一个公开仓库（例如 `group-calendar`）
2. 上传修改后的 `calendar.html` 到仓库根目录
3. 进入仓库 **Settings** → **Pages**
4. Source 选择 **Deploy from a branch**，Branch 选 `main`，文件夹选 `/ (root)`
5. 保存，等待几分钟，访问 `https://你的用户名.github.io/group-calendar/calendar.html?room=demo`

---

## 分享给群友

把链接发到微信群即可：

```
大家把本月行程填一下：
https://你的用户名.github.io/group-calendar/calendar.html?room=我们群
```

群友点开链接，在日历上点击日期 → 填昵称和行程 → 确定。所有人刷新都能看到。

---

## 注意事项

1. **安全性**：当前方案没有用户认证，任何人知道链接就能添加/删除。如需权限控制，需要在 Worker 代码里增加简单的密码验证。
2. **数据持久性**：Cloudflare KV 是最终一致性存储，极端情况下可能有秒级延迟。
3. **免费额度**：Cloudflare Workers 免费版每天 10 万次请求，普通小群完全够用。
4. **微信分享**：GitHub Pages 域名在国内访问偶尔较慢，如需更快速度，可将前端部署到 Cloudflare Pages 或国内托管服务。

---

## 文件说明

| 文件 | 说明 |
|:---|:---|
| `calendar-backend.js` | Cloudflare Worker 后端代码 |
| `calendar.html` | 前端日历页面 |
| `README.md` | 本部署指南 |

---

## 进阶：自有域名

如果你有自己的域名，可以：
1. 在 Cloudflare 添加自定义域名到 Worker
2. 前端托管到 Cloudflare Pages 并绑定同一域名
3. 最终链接变成 `https://你的域名.com/calendar.html?room=我们群`
