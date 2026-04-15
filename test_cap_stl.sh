#!/bin/bash

# 3D Model Viewer 自动化测试脚本
# 用于测试 cap.stl 文件

echo "🏆 3D Model Viewer 自动化测试"
echo "================================"
echo ""

# 文件信息
TEST_FILE="/Users/wisonlau/Sync/模型/SynologyDrive/Screw_box_957092/files/cap.stl"
APP_PATH="/Users/wisonlau/wwwroot/yile/go/3dview/3dview/build/bin/3dview.app"

echo "📋 测试文件信息"
echo "================"
if [ -f "$TEST_FILE" ]; then
    echo "✅ 文件存在: $TEST_FILE"
    FILE_SIZE=$(ls -lh "$TEST_FILE" | awk '{print $5}')
    echo "📦 文件大小: $FILE_SIZE"
    
    # 检查文件格式
    FILE_HEADER=$(head -c 80 "$TEST_FILE")
    if [[ "$FILE_HEADER" == *"solid"* ]]; then
        echo "📝 文件格式: ASCII STL"
    else
        echo "📝 文件格式: Binary STL"
        echo "🔍 文件头: $(echo $FILE_HEADER | cut -c1-50)..."
    fi
else
    echo "❌ 错误: 测试文件不存在"
    exit 1
fi

echo ""
echo "🔧 应用检查"
echo "============"
if [ -d "$APP_PATH" ]; then
    echo "✅ 应用存在: $APP_PATH"
    APP_VERSION=$(defaults read "$(dirname "$APP_PATH")/Info" CFBundleShortVersionString 2>/dev/null || echo "未知")
    echo "📱 应用版本: $APP_VERSION"
else
    echo "❌ 错误: 应用未构建"
    echo "💡 请先运行: wails build"
    exit 1
fi

echo ""
echo "🚀 启动测试"
echo "============"
echo "应用将自动打开，请执行以下步骤："
echo ""
echo "1️⃣  应用启动后，点击 '📁 Select 3D Model' 按钮"
echo "2️⃣  导航到文件路径:"
echo "   $TEST_FILE"
echo "3️⃣  选择 cap.stl 文件"
echo "4️⃣  观察模型是否正确加载和显示"
echo "5️⃣  测试交互功能:"
echo "   - 左键拖动旋转模型"
echo "   - 滚轮缩放视图"
echo "   - 右键拖动平移视图"
echo ""

echo "🎯 测试清单"
echo "============"
echo "请确认以下功能是否正常:"
echo ""
echo "□ 文件选择对话框正常打开"
echo "□ STL 文件被识别和接受"
echo "□ 模型在查看器中显示"
echo "□ 模型正确居中"
echo "□ 旋转功能正常"
echo "□ 缩放功能正常"
echo "□ 平移功能正常"
echo "□ 模型材质和光照正常"
echo "□ 无错误消息显示"
echo "□ 性能表现良好"
echo ""

echo "📊 性能测试"
echo "============"
echo "请记录:"
echo "- 文件加载时间: _____ 秒"
echo "- 模型渲染帧率: _____ FPS"
echo "- 内存使用: _____ MB"
echo ""

echo "🐛 错误检查"
echo "============"
echo "如果遇到问题，请记录:"
echo "- 错误消息: _____________________"
echo "- 控制台错误: ____________________"
echo "- 复现步骤: _____________________"
echo ""

# 打开应用
echo "📱 启动应用..."
open "$APP_PATH"

echo ""
echo "✅ 测试环境已准备就绪"
echo "💡 请按照上述步骤完成测试"
echo ""
echo "📝 测试完成后，请将结果反馈给开发者"
echo "================================"
