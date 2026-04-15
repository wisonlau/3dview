# 快速启动指南 (Quick Start Guide)

## 🚀 5 分钟开始使用

### 前置要求检查

确保您的系统已安装以下软件：

```bash
# 检查 Go 版本
go version
# 需要: Go 1.25+

# 检查 Node.js 版本  
node -v
# 需要: Node.js 18+

# 检查 Wails CLI
wails version
# 需要: Wails 2.11.0+
```

### 第一步：克隆或进入项目目录

```bash
cd /Users/wisonlau/wwwroot/yile/go/3dview/3dview
```

### 第二步：安装依赖

```bash
# 安装前端依赖
cd frontend
npm install
cd ..
```

### 第三步：启动应用

**方式 1: 使用启动脚本（推荐）**
```bash
# macOS/Linux
./start.sh

# Windows
start.bat
```

**方式 2: 使用 Wails CLI**
```bash
wails dev
```

**方式 3: 运行构建好的应用**
```bash
# macOS
open build/bin/3dview.app

# Windows
start build/bin/3dview.exe

# Linux
./build/bin/3dview
```

### 第四步：加载 3D 模型

1. 应用启动后，点击 **"📁 Select 3D Model"** 按钮
2. 选择一个 3D 模型文件：
   - `.obj` - Wavefront OBJ 文件
   - `.glb` - Binary glTF 文件
   - `.gltf` - JSON glTF 文件
   - `.stl` - Stereolithography 文件
3. 模型将自动加载并显示

### 第五步：交互操作

- **旋转模型**: 按住鼠标左键并拖动
- **缩放视图**: 滚动鼠标滚轮
- **平移视图**: 按住鼠标右键并拖动

## 📦 构建生产版本

### 使用构建脚本

```bash
# macOS/Linux
./build.sh
```

### 手动构建

```bash
# 构建前端
cd frontend
npm run build
cd ..

# 构建完整应用
wails build
```

构建完成后，可执行文件位于：
```
build/bin/3dview.app  (macOS)
build/bin/3dview.exe  (Windows)
build/bin/3dview      (Linux)
```

## 🛠️ 开发模式

开发模式支持热更新，修改代码后自动重新加载：

```bash
wails dev
```

开发服务器将在以下地址运行：
- **桌面应用**: 窗口中显示
- **开发服务器**: http://localhost:34115

## 📂 项目结构

```
3dview/
├── app.go                 # Go 后端逻辑
├── main.go               # Wails 入口
├── wails.json            # Wails 配置
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
└── build/bin/            # 构建输出
```

## 🐛 常见问题

### 问题 1: 启动失败

**解决方案**:
```bash
# 检查依赖是否安装
go version
node -v
wails version

# 重新安装依赖
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### 问题 2: STL 文件无法加载

**解决方案**:
- 确保使用最新版本 (v1.0.2+)
- 检查 STL 文件格式是否正确
- 查看浏览器控制台是否有错误

### 问题 3: 构建失败

**解决方案**:
```bash
# 清理缓存
go clean -cache

# 重新构建
cd frontend
npm run build
cd ..
wails build
```

## 📚 更多资源

- **完整文档**: 查看 `README.md` 和 `README_CN.md`
- **使用指南**: 查看 `USAGE.md`
- **故障排除**: 查看 `TROUBLESHOOTING.md`
- **测试指南**: 查看 `TEST_GUIDE.md`
- **更新日志**: 查看 `CHANGELOG.md`

## 💡 提示

1. **性能优化**: 使用 GLB 格式以获得最佳性能
2. **大文件**: 大文件可能需要较长加载时间，请耐心等待
3. **兼容性**: 确保使用支持的文件格式
4. **调试**: 遇到问题时，查看浏览器控制台获取详细错误信息

## 🆘 获取帮助

如果遇到问题：
1. 查看 `TROUBLESHOOTING.md` 故障排除指南
2. 检查浏览器控制台错误
3. 确保使用最新版本
4. 查看项目 Issues

---

**文档版本**: 1.0  
**适用版本**: v1.0.2+  
**最后更新**: 2026-04-15