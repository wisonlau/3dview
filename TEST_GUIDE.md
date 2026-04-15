# 测试指南 (Testing Guide)

## v1.0.2 验证测试

### 测试目标
验证 STLLoader 修复和 npm 模块迁移是否成功。

### 测试环境
- **操作系统**: macOS
- **Go 版本**: 1.25+
- **Node.js 版本**: 18+
- **Wails 版本**: 2.11.0
- **Three.js 版本**: 0.160.0

### 测试文件
准备以下测试文件：
- STL 文件：`2020_cable_clip_6mm_L.stl` (或其他 STL 文件)
- OBJ 文件：任何 `.obj` 文件
- GLB 文件：任何 `.glb` 文件
- GLTF 文件：任何 `.gltf` 文件

### 测试步骤

#### 1. 启动应用
```bash
cd /Users/wisonlau/wwwroot/yile/go/3dview/3dview
./start.sh
```

或使用构建好的应用：
```bash
open /Users/wisonlau/wwwroot/yile/go/3dview/3dview/build/bin/3dview.app
```

#### 2. 测试 STL 文件加载
1. 点击 "📁 Select 3D Model" 按钮
2. 选择 `2020_cable_clip_6mm_L.stl` 文件
3. **预期结果**：
   - ✅ 无错误消息
   - ✅ 模型正确显示在查看器中
   - ✅ 模型自动居中
   - ✅ 可以使用鼠标交互（旋转、缩放、平移）
   - ✅ 模型信息显示正确的格式和文件名

#### 3. 测试其他格式
重复步骤 2，测试其他文件格式：
- ✅ OBJ 文件
- ✅ GLB 文件  
- ✅ GLTF 文件

#### 4. 交互测试
对加载的模型进行交互测试：
- ✅ 左键拖动旋转模型
- ✅ 滚轮缩放视图
- ✅ 右键拖动平移视图
- ✅ 模型响应流畅，无卡顿

### 错误检查清单

#### 应该不再出现的错误
- ❌ `undefined is not a constructor (evaluating 'new window.THREE.STLLoader()')`
- ❌ `Failed to load 3D model` (STL 格式)
- ❌ `file does not exist` 错误

#### 应该正常工作的功能
- ✅ 文件选择对话框
- ✅ 文件读取和解析
- ✅ 3D 渲染
- ✅ 模型居中和缩放
- ✅ 交互控制
- ✅ 模型信息显示

### 浏览器控制台检查

#### 打开开发者工具
1. 在运行的应用中，按 `F12` 或 `Cmd+Opt+I` 打开开发者工具
2. 切换到 "Console" 标签

#### 检查控制台输出
**正常输出示例**：
```javascript
// 应该没有红色错误消息
// 可以看到文件加载和渲染相关信息
```

**错误输出示例（不应该出现）**：
```javascript
❌ Uncaught TypeError: undefined is not a constructor
❌ Failed to load 3D model
❌ Error loading model
```

### 性能测试

#### 加载时间测试
- **小文件 (< 1MB)**: 应该在 1-2 秒内加载
- **中文件 (1-10MB)**: 应该在 2-5 秒内加载
- **大文件 (> 10MB)**: 应该在 5-10 秒内加载

#### 内存使用测试
- 打开应用前：检查内存使用
- 加载模型后：检查内存使用
- 应该合理，无明显内存泄漏

### 构建验证

#### 检查构建产物
```bash
ls -lh /Users/wisonlau/wwwroot/yile/go/3dview/3dview/build/bin/3dview.app
```

#### 检查前端构建
```bash
ls -lh /Users/wisonlau/wwwroot/yile/go/3dview/3dview/frontend/dist/
```

**预期输出**：
- `dist/assets/index.a151922d.js` (~706 KiB 未压缩，~191 KiB gzip)
- `dist/assets/index.fd7720ab.css` (~2.89 KiB 未压缩，~1.11 KiB gzip)
- `dist/index.html` (~0.36 KiB)

### 回归测试

#### 测试之前修复的功能
- ✅ STL 文件使用 ArrayBuffer 读取（不是文本）
- ✅ 文件格式正确验证
- ✅ 错误消息详细且有帮助
- ✅ 材质设置正确

#### 测试所有受支持的格式
- ✅ OBJ - Wavefront OBJ 格式
- ✅ GLB - Binary glTF 格式
- ✅ GLTF - JSON glTF 格式
- ✅ STL - Stereolithography 格式

### 已知限制测试

#### 大文件测试
- 测试大文件是否会导致性能问题
- 记录加载时间和内存使用

#### 特殊格式测试
- 测试 ASCII STL vs Binary STL
- 测试带纹理的 GLB 文件
- 测试带材质的 OBJ 文件

### 问题报告模板

如果发现问题，请按以下格式报告：

```markdown
## 问题描述
[详细描述问题]

## 重现步骤
1. [步骤 1]
2. [步骤 2]
3. [步骤 3]

## 预期行为
[描述应该发生什么]

## 实际行为
[描述实际发生了什么]

## 环境信息
- 操作系统: [macOS/Windows/Linux]
- Go 版本: [go version]
- Node.js 版本: [node -v]
- 文件格式: [OBJ/GLB/GLTF/STL]
- 文件大小: [文件大小]

## 错误消息
[控制台错误消息]
[应用错误消息]

## 截图
[如果相关，附上截图]
```

### 测试完成清单

- [ ] STL 文件加载成功
- [ ] OBJ 文件加载成功
- [ ] GLB 文件加载成功
- [ ] GLTF 文件加载成功
- [ ] 交互控制正常工作
- [ ] 模型正确居中
- [ ] 缩放功能正常
- [ ] 旋转功能正常
- [ ] 平移功能正常
- [ ] 无控制台错误
- [ ] 性能表现良好
- [ ] 内存使用正常

### 测试结果总结

**测试日期**: [填写测试日期]
**测试人员**: [填写测试人员]
**测试版本**: v1.0.2
**测试结果**: [通过/失败]
**备注**: [其他观察或备注]

---

**文档版本**: 1.0  
**最后更新**: 2026-04-15  
**适用版本**: v1.0.2+