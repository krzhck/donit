# donit 项目说明文档

## 1. 技术选型
- **编程语言**：TypeScript 前端 + Python 后端；理由：TS 提供更安全和清晰的的静态类型。
- **框架/库**：前端：React + Vite + Tailwind CSS；后端：FastAPI。理由：React 组件化便于扩展且生态成熟；Vite 提升开发效率和体验；Tailwind 可高效开发简洁现代的前端样式；FastAPI 类型校验与自动文档支持良好，可快速搭建类型安全的 REST API。
- **数据库/存储**：SQLite，理由：轻量易部署，适合快速 demo。  
- 替代方案对比：纯前端 + localStorage 无法跨设备同步；MongoDB 不适合强结构的 todo task；Django 对于该项目来说过重。

## 2. 项目结构设计
- 采用前后端分离的结构，前端通过 REST API 与后端通信，后端负责持久化与业务逻辑。
- 目录结构示例：
  ```
  frontend/
    src/
    	api/
      components/
      contexts/
      locales/
      pages/
  backend/
    app/
    	crud.py
    	database.py
    	main.py
    	models.py
    	schemas.py
  ```
- 模块职责说明。  

## 3. 需求细节与决策
- 描述是否必填？如何处理空输入？  
- 已完成的任务在 UI 或 CLI 中如何显示？  
- 任务排序逻辑（默认按创建时间，用户可选按优先级）。  
- 如果涉及扩展功能（例如同步/提醒），简述设计思路。  

## 4. AI 使用说明
- 是否使用 AI 工具？（ChatGPT / Copilot / Cursor / 其他）  
- 使用 AI 的环节：  
  - 代码片段生成  
  - Bug 定位  
  - 文档初稿编写  
- AI 输出如何修改：例如“AI 给出的方案用了 localStorage，我改成了 IndexedDB 以支持更复杂数据”。  

## 5. 运行与测试方式
### 本地运行

#### 后端

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload # http://127.0.0.1:8000
```

#### 前端

```bash
cd frontend
npm install
npm run dev # http://localhost:5173
```

### 已测试环境

Node.js v24; Python 3.8; macOS 26

## 6. 总结与反思
- 如果有更多时间，你会如何改进？  
- 你觉得这个实现的最大亮点是什么？  
