# HyperBoard Node.js OOM 问题排查文档

## 问题现象

Node.js 进程崩溃，报 `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory`。

堆内存从正常水平（~15MB）瞬间飙升至堆上限，GC 无法回收任何对象（`current mu = 0.000`）。

## 根本原因（已确认）

### `chunkText()` 函数无限循环（`src/utils/chunker.js`）

这是所有 OOM 崩溃的真正原因。

当文本长度在 `chunkSize`（500）到 `chunkSize + overlap * 2`（600）之间时，或当最后一块剩余文本比 `overlap`（50）短时，`start` 指针永远无法前进，导致 `while` 循环无限执行，`chunks` 数组无限增长直到堆内存耗尽。

**Bug 复现条件**：文本长度恰好使最后一次迭代的 `end - overlap` 回退到与上一次 `start` 相同的位置。

**关键日志证据**（通过逐行内存追踪定位）：

```
[RAG-MEM] index-message-9-start: heap=14.7MB / 21.1MB
[RAG-MEM] after-remove: heap=15.0MB / 21.1MB
[RAG-MEM] after-sample len=1063: heap=15.0MB / 21.1MB
FATAL ERROR: heap out of memory   ← chunkText() 在此处进入无限循环
```

内存从 15MB 飙升到 768MB，全部被无限增长的 `chunks` 数组占用。

**修复**：在 `chunkText()` 中添加退出条件：

```js
// 旧代码（有 bug）
start = end - overlap;
if (start <= (chunks.length > 1 ? end - chunkSize + overlap : 0)) {
  start = end;
}

// 新代码（已修复）
if (end >= text.length) break;
const prevStart = start;
start = end - overlap;
if (start <= prevStart) break;
```

## 其他已修复的相关问题

### 1. 堆内存限制过低

`docker-compose.yml` 中 `--max-old-space-size=256` 过于紧张。已调整为 768MB。

### 2. axios 响应无大小限制

`embedding.js` 和 `ai-handler.js` 的 axios 调用没有 `maxContentLength`/`maxBodyLength` 限制。如果 API 返回异常大的响应，可能导致内存问题。已添加 2MB 上限。

### 3. RAG 索引截断过短

`indexContent` 原来只索引前 2000 字符，超长帖子（如八字报告）的关键数据在后面会被丢失。已改为 `sampleText()` 采样策略：取前 1000 + 后 1000 字符，确保语义覆盖。

### 4. RAG 上下文过小

`buildContext` 原来只取 top 3 结果、截断到 1500 字符。已改为 top 5、4000 字符，并通过 `fetchFullContent()` 从 SQLite 取完整帖子内容提供给 AI。

## 当前配置

```yaml
# docker-compose.yml
environment:
  - NODE_OPTIONS=--max-old-space-size=768
restart: unless-stopped
```

正常运行的内存水平：

```
[Memory] RSS: 86.5MB | Heap: 11.6MB / 20.5MB | External: 3.6MB
```

## 相关文件

| 文件 | 作用 |
|------|------|
| `src/utils/chunker.js` | **OOM 根因** — 文本分块（已修复） |
| `src/utils/rag-service.js` | RAG 服务（索引/搜索/上下文） |
| `src/utils/ai-handler.js` | AI 回复生成（LLM API + RAG 上下文） |
| `src/utils/embedding.js` | 嵌入向量 API 调用 |
| `src/database/vec-migration.js` | 向量数据库迁移 |
| `src/index.js` | 应用入口（含 `/api/admin/reindex` 手动触发接口） |
| `docker-compose.yml` | Docker 配置 |

## 手动重新索引

如果需要重建向量索引（例如数据库变更后），调用：

```bash
curl -X POST http://localhost:61989/api/admin/reindex
```
