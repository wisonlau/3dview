# 故障排除指南

## 常见问题及解决方案

### STL 文件加载失败

**问题**: 选择 STL 文件后显示 "Failed to load 3D model"

**原因**: STL 文件是二进制格式，需要使用 `ArrayBuffer` 读取，而不是文本格式。

**解决方案**: 
- ✅ 已在最新版本中修复
- 确保使用最新的构建版本
- 确认 STL 文件格式正确（ASCII 或 Binary STL）

### 文件格式不支持

**问题**: 某些文件格式无法加载

**解决方案**:
- 确认文件扩展名为以下之一：
  - `.obj` - Wavefront OBJ
  - `.glb` - Binary glTF
  - `.gltf` - JSON glTF
  - `.stl` - Stereolithography
- 确保文件没有损坏
- 尝试用其他 3D 软件验证文件是否正常

### 模型显示异常

**问题**: 模型加载后显示不正确或位置奇怪

**可能原因**:
1. 模型坐标系问题
2. 模型比例问题
3. 材质缺失

**解决方案**:
- 应用会自动居中模型
- 调整摄像机距离
- 检查模型文件的导出设置
- 尝试不同的文件格式

### 性能问题

**问题**: 加载大文件时卡顿或崩溃

**解决方案**:
- 优化模型面数（减少多边形数量）
- 使用更高效的格式（GLB 通常比 OBJ 更高效）
- 关闭其他占用 GPU 的应用
- 增加系统内存

### 开发模式无法启动

**问题**: `wails dev` 命令失败

**检查清单**:
1. Go 是否正确安装并配置
2. Node.js 是否正确安装
3. Wails CLI 是否正确安装
4. 依赖是否已安装 (`npm install`)
5. 端口 34115 是否被占用

**解决步骤**:
```bash
# 检查 Go 版本
go version

# 检查 Node.js 版本
node -v

# 检查 Wails CLI
wails version

# 重新安装依赖
cd frontend
rm -rf node_modules package-lock.json
npm install

cd ..
wails dev
```

### 构建失败

**问题**: `wails build` 失败

**常见错误及解决方案**:

1. **编译错误**:
   ```bash
   # 清理并重新构建
   go clean -cache
   wails build
   ```

2. **前端构建错误**:
   ```bash
   # 重新构建前端
   cd frontend
   npm run build
   cd ..
   wails build
   ```

3. **依赖问题**:
   ```bash
   # 更新依赖
   go mod tidy
   cd frontend
   npm update
   ```

### 浏览器兼容性

**问题**: 在某些浏览器中无法正常运行

**解决方案**:
- 推荐使用最新的 Chrome、Firefox 或 Edge
- 确保浏览器支持 WebGL
- 检查显卡驱动是否更新

### 材质和纹理丢失

**问题**: 模型加载后缺少材质或纹理

**可能原因**:
- OBJ 文件缺少 .mtl 材质文件
- 纹理文件路径不正确
- 文件引用路径问题

**解决方案**:
- 使用 GLB 格式（包含内嵌纹理）
- 确保 OBJ 文件和 MTL 文件在同一目录
- 检查纹理文件路径是否正确
- 使用支持内嵌纹理的格式

## 调试技巧

### 启用详细日志

1. **浏览器开发者工具**:
   - 打开开发者工具 (F12)
   - 查看 Console 标签的错误信息
   - 检查 Network 标签的加载情况

2. **Wails 日志**:
   ```bash
   # 开发模式下查看详细输出
   wails dev -v
   ```

### 测试文件

使用以下测试文件验证功能：
- 简单的 STL 文件（如立方体、球体）
- 带纹理的 GLB 文件
- 标准的 OBJ 文件

### 性能分析

使用浏览器性能分析工具：
```javascript
// 在浏览器控制台运行
performance.mark('start');
// ... 加载模型 ...
performance.mark('end');
performance.measure('loadTime', 'start', 'end');
console.log(performance.getEntriesByName('loadTime'));
```

## 获取帮助

如果问题仍未解决：
1. 查看项目文档
2. 搜索已知的 Issues
3. 提交新的 Issue（包含详细的错误信息和复现步骤）

## 版本信息

- **当前版本**: 1.0.0
- **最后更新**: 2026-04-15
- **已知问题**: 见项目 Issues