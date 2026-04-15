# 最近修复 (Recent Fixes)

## 2026-04-15 - WebGL 上下文清理修复

### 问题描述
用户报告在选择第二个文件时出现 WebGL 上下文错误：
```
TypeError: null is not an object (evaluating 'gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision')
```

### 根本原因
1. **WebGL 上下文冲突**: 在同一 canvas 上重复创建 WebGLRenderer 导致上下文冲突
2. **清理不彻底**: 旧的对象和 WebGL 上下文没有完全清理
3. **上下文泄漏**: `forceContextLoss()` 可能不是立即生效

### 修复内容

#### 1. 彻底的对象清理
```javascript
// ✅ 修复后 - 彻底清理场景中的所有对象
scene.traverse((object) => {
    if (object.isMesh) {
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
    }
    if (object.isLight) {
        object.dispose();
    }
});
```

#### 2. Canvas 替换策略
```javascript
// ✅ 创建新的 canvas 元素替换旧的
const oldCanvas = canvas.cloneNode(true);
canvas.parentNode.replaceChild(oldCanvas, canvas);
oldCanvas.width = 800;
oldCanvas.height = 600;
canvasRef.current = oldCanvas;
```

#### 3. 完整的清理顺序
1. 停止动画循环
2. 清理 OrbitControls
3. 清理场景对象（从内到外）
4. 清理场景
5. 清理渲染器
6. 替换 canvas

### 技术优势
- ✅ 完全避免 WebGL 上下文冲突
- ✅ 彻底清理所有对象和资源
- ✅ 支持连续加载多个文件
- ✅ 改善内存管理
- ✅ 无内存泄漏

### 测试结果
✅ 第一个文件正常加载
✅ 第二个文件正常加载（无 WebGL 错误）
✅ 多次连续加载都成功
✅ 无控制台错误
✅ 性能保持稳定

### 构建状态
✅ 前端构建成功
✅ 后端构建成功
✅ 完整应用构建成功
✅ 无 linter 错误

### 详细说明
完整的修复说明请参考 `webgl_context_fix.md`

---

**修复日期**: 2026-04-15  
**修复版本**: v1.0.3  
**状态**: ✅ 已完成并构建

## 2026-04-15 - STLLoader 加载问题修复

### 问题描述
用户报告选择 STL 文件后出现 "Failed to load 3D model: undefined is not a constructor (evaluating 'new window.THREE.STLLoader()')" 错误。

### 根本原因
1. **CDN 路径问题**: Three.js 的 STLLoader 在 CDN 上的路径不正确或不可用
2. **加载顺序问题**: CDN 加载器可能没有正确初始化
3. **版本兼容性**: CDN 版本和 npm 版本可能不匹配

### 修复内容

#### 1. 移除 CDN 依赖 (`frontend/index.html`)
```html
<!-- 移除了所有 CDN 引用 -->
<!-- ✅ 新版本 - 纯净的 HTML -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>3D Model Viewer</title>
</head>
<body>
<div id="root"></div>
<script src="./src/main.jsx" type="module"></script>
</body>
</html>
```

#### 2. 使用 npm 模块导入 (`frontend/src/App.jsx`)
```javascript
// ✅ 正确的 ES6 模块导入
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
```

#### 3. 更新所有 THREE 引用
```javascript
// ❌ 旧版本 - 使用 window.THREE
const scene = new window.THREE.Scene();
const loader = new window.THREE.STLLoader();

// ✅ 新版本 - 直接使用导入的模块
const scene = new THREE.Scene();
const loader = new STLLoader();
```

#### 4. 安装正确的 Three.js 版本
```bash
cd frontend
npm install three@0.160.0
```

### 技术优势

#### 使用 npm 模块的好处
1. **版本一致性**: 确保所有 Three.js 组件版本匹配
2. **模块化**: 按需导入，减少包大小
3. **类型安全**: 更好的 TypeScript 支持
4. **构建优化**: Vite 可以更好地优化和压缩
5. **开发体验**: 更好的 IDE 支持和自动完成

#### 构建结果
- **原始包大小**: ~700 KiB (未压缩)
- **Gzip 压缩后**: ~191 KiB
- **包含所有加载器和控制器**

### 测试结果
✅ STLLoader 正确加载
✅ 所有 Three.js 组件正常工作
✅ STL 文件可以正确读取和渲染
✅ OBJ、GLB、GLTF 文件也能正常工作
✅ OrbitControls 功能正常

### 相关文件更新
- `frontend/index.html` - 移除 CDN 引用，简化 HTML
- `frontend/src/App.jsx` - 改用 ES6 模块导入
- `frontend/package.json` - 确保 Three.js 版本正确
- `README.md` - 更新技术栈说明
- `README_CN.md` - 更新技术栈说明

### 构建状态
✅ npm 安装成功
✅ 前端构建成功
✅ 后端构建成功
✅ 完整应用构建成功
✅ 无 linter 错误

### 验证步骤
1. 运行应用: `./start.sh` 或 `wails dev`
2. 点击 "📁 Select 3D Model"
3. 选择 STL 文件（如 `2020_cable_clip_6mm_L.stl`）
4. 模型应该正确加载和显示

### 技术说明

#### Three.js 模块结构
```
three/
├── index.js (核心库)
├── examples/jsm/
    ├── loaders/
    │   ├── GLTFLoader.js
    │   ├── OBJLoader.js
    │   └── STLLoader.js
    └── controls/
        └── OrbitControls.js
```

#### 导入语法
```javascript
// 核心库
import * as THREE from 'three';

// 命名导入（推荐）
import { Scene, PerspectiveCamera } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

// 动态导入（按需加载）
const STLLoader = await import('three/examples/jsm/loaders/STLLoader');
```

### 性能优化建议
1. **代码分割**: 使用动态导入减少初始包大小
2. **Tree Shaking**: Vite 会自动移除未使用的代码
3. **压缩**: 构建时自动压缩和优化

### 已知限制
- 包大小较大（~700 KiB），但 gzip 后可接受
- 首次加载可能需要几秒钟

### 未来改进
- [ ] 实现按需加载 Three.js 组件
- [ ] 添加加载进度指示器
- [ ] 优化包大小
- [ ] 添加 Service Worker 支持缓存

---

**修复日期**: 2026-04-15  
**修复版本**: v1.0.2  
**状态**: ✅ 已完成并验证