# 3D Model Viewer

一个基于 Wails 和 Three.js 的 3D 模型预览工具，支持 OBJ、GLB/GLTF 和 STL 格式。
![1.png](img/1.png)
![2.png](img/2.png)

## ✅ 最近修复

- **修复 STL 文件加载问题**：STL 文件现在使用 ArrayBuffer 而不是文本正确加载
- **改进错误处理**：更好的错误消息和日志记录，便于故障排除
- **增强文件验证**：在尝试加载前正确检查文件格式

## 功能特性

- 🏆 **多格式支持**：支持 OBJ、GLB、GLTF 和 STL 格式的 3D 模型
- 🎨 **现代界面**：基于 React 的美观用户界面
- 🖱️ **交互式查看**：支持旋转、缩放和平移操作
- 🚀 **高性能**：使用 WebGL 进行硬件加速渲染
- 📦 **跨平台**：使用 Wails 构建，支持 macOS、Windows 和 Linux
- 🔧 **稳健加载**：正确处理二进制和文本文件格式
- 📊 **模型统计**：实时计算顶点数、三角形数、尺寸、体积和表面积

## 技术栈

- **后端**：Go + Wails
- **前端**：React + Vite + Three.js
- **3D 渲染**：Three.js (WebGL) ES6 模块
- **文件解析**：Trophy 库
- **构建系统**：Vite（优化打包）

### Three.js 架构
- 核心库和加载器通过 npm 模块导入
- 无 CDN 依赖 - 确保版本兼容性
- 使用 gzip 压缩优化打包大小（约 191 KiB）
- 实时几何体分析和统计计算

## 安装和运行

### 前置要求

- Go 1.25 或更高版本
- Node.js 18 或更高版本
- Wails CLI v2.11.0

### 安装 Wails CLI

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### 运行开发环境

1. 克隆项目或导航到项目目录：
```bash
cd 3dview
```

2. 安装前端依赖：
```bash
cd frontend
npm install
```

3. 运行开发服务器：
```bash
cd ..
wails dev
```

### 快速启动脚本

```bash
# macOS/Linux
./start.sh

# Windows
start.bat
```

### 构建生产版本

```bash
wails build
```

构建后的应用将在 `build/bin/` 目录中。

## 使用方法

1. 启动应用程序
2. 点击 "📁 Select 3D Model" 按钮
3. 选择一个 3D 模型文件（.obj, .glb, .gltf, .stl）
4. 模型将自动加载并显示在查看器中

### 交互控制

- **左键拖动**：旋转模型
- **滚轮**：缩放视图
- **右键拖动**：平移视图

## 支持的文件格式

| 格式 | 扩展名 | 说明 |
|------|--------|------|
| OBJ | .obj | Wavefront OBJ 格式（文本） |
| GLB | .glb | 二进制 glTF（包含内嵌纹理） |
| GLTF | .gltf | JSON glTF 格式 |
| STL | .stl | 立体光刻格式（二进制/ASCII） ✅ **已修复** |

## 项目结构

```
3dview/
├── app.go                 # Go 后端主应用
├── main.go               # Wails 入口文件
├── wails.json            # Wails 配置
├── README.md             # 英文文档
├── README_CN.md          # 中文文档（本文件）
├── USAGE.md              # 详细使用指南
├── TROUBLESHOOTING.md    # 故障排除指南
├── PROJECT_SUMMARY.md    # 项目总结
├── start.sh              # macOS/Linux 启动脚本
├── start.bat             # Windows 启动脚本
├── build.sh              # 构建脚本
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # React 主组件
│   │   ├── App.css       # 应用样式
│   │   └── main.jsx      # React 入口
│   ├── index.html        # HTML 模板
│   └── package.json      # 前端依赖
└── build/                # 构建输出
```

## 开发说明

### 添加新的 3D 格式支持

1. 在 `app.go` 中的 `getFileFormat` 方法添加新格式
2. 在 `frontend/src/App.jsx` 中的 `loadThreeJSModel` 方法添加对应的加载器
3. 确定格式是需要 ArrayBuffer 还是文本读取
4. 更新文件选择器的 `accept` 属性

### 自定义样式

编辑 `frontend/src/App.css` 文件来自定义应用的外观。

## 故障排除

如果遇到问题：
1. 查看 [TROUBLESHOOTING.md](TROUBLESHOOTING.md) 指南
2. 验证您的文件格式受支持
3. 检查浏览器控制台获取详细错误信息
4. 确保使用最新构建版本

## 许可证

MIT License

## 致谢

- [Wails](https://wails.io/) - 用于构建桌面应用的 Go 框架
- [Three.js](https://threejs.org/) - 3D Web 渲染库
- [Trophy](https://github.com/taigrr/trophy) - 3D 模型解析库

## 版本历史

### v1.0.4 (2026-04-16)
- ✅ 新增详细的模型统计信息面板（含单位）
- ✅ 实时计算顶点数、三角形数和尺寸
- ✅ 模型体积和表面积计算功能
- ✅ 优化统计信息展示卡片布局

### v1.0.3 (2026-04-15)
- ✅ 修复加载多个文件时的 WebGL 上下文冲突
- ✅ 实现完整的对象清理和内存管理
- ✅ 添加 Canvas 替换策略以避免上下文冲突
- ✅ 支持连续加载多个模型而不出错

### v1.0.2 (2026-04-15)
- ✅ 修复 STLLoader 构造函数错误
- ✅ 从 CDN 迁移到 npm 模块加载 Three.js
- ✅ 改进 Vite 打包优化
- ✅ 增强版本兼容性和可靠性

### v1.0.1 (2026-04-15)
- 修复 STL 文件加载问题
- 改进错误处理和日志记录
- 更好的文件格式验证

### v1.0.0 (2026-04-15)
- 初始版本
- 基本的 3D 模型查看功能
- 支持 OBJ、GLB、GLTF 和 STL 格式