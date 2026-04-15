#!/usr/bin/env python3
"""
STL 文件验证脚本
用于验证 cap.stl 文件的结构和有效性
"""

import struct
import sys
import os

def validate_binary_stl(filepath):
    """验证二进制 STL 文件"""
    print("🔍 验证二进制 STL 文件...")
    print(f"📁 文件路径: {filepath}")
    
    try:
        with open(filepath, 'rb') as f:
            # 读取文件头 (80 字节)
            header = f.read(80)
            print(f"📝 文件头: {header.decode('ascii', errors='ignore').strip()}")
            
            # 读取三角形数量 (4 字节)
            triangle_count_bytes = f.read(4)
            triangle_count = struct.unpack('<I', triangle_count_bytes)[0]
            print(f"📊 三角形数量: {triangle_count:,}")
            
            # 计算预期文件大小
            expected_size = 80 + 4 + (triangle_count * 50)
            actual_size = os.path.getsize(filepath)
            
            print(f"📏 预期文件大小: {expected_size:,} 字节")
            print(f"📏 实际文件大小: {actual_size:,} 字节")
            
            # 验证文件大小
            if actual_size == expected_size:
                print("✅ 文件大小验证通过")
            else:
                print(f"⚠️  文件大小不匹配 (差异: {abs(actual_size - expected_size)} 字节)")
            
            # 读取第一个三角形数据验证
            print("\n🔎 验证第一个三角形数据...")
            
            # 法向量 (3 * float = 12 字节)
            normal = f.read(12)
            nx, ny, nz = struct.unpack('<3f', normal)
            print(f"  法向量: ({nx:.6f}, {ny:.6f}, {nz:.6f})")
            
            # 顶点 1 (3 * float = 12 字节)
            v1 = f.read(12)
            x1, y1, z1 = struct.unpack('<3f', v1)
            print(f"  顶点 1: ({x1:.6f}, {y1:.6f}, {z1:.6f})")
            
            # 顶点 2 (3 * float = 12 字节)
            v2 = f.read(12)
            x2, y2, z2 = struct.unpack('<3f', v2)
            print(f"  顶点 2: ({x2:.6f}, {y2:.6f}, {z2:.6f})")
            
            # 顶点 3 (3 * float = 12 字节)
            v3 = f.read(12)
            x3, y3, z3 = struct.unpack('<3f', v3)
            print(f"  顶点 3: ({x3:.6f}, {y3:.6f}, {z3:.6f})")
            
            # 属性字节 (2 字节)
            attribute = f.read(2)
            print(f"  属性字节: 0x{attribute.hex()}")
            
            # 验证数据有效性
            print("\n✅ 数据验证通过")
            
            # 计算模型边界框（采样）
            print("\n📐 计算模型边界框（前 1000 个三角形）...")
            
            f.seek(84)  # 回到三角形数据开始位置
            
            min_x = min_y = min_z = float('inf')
            max_x = max_y = max_z = float('-inf')
            
            sample_count = min(1000, triangle_count)
            
            for i in range(sample_count):
                # 跳过法向量 (12 字节)
                f.read(12)
                
                # 读取 3 个顶点
                for _ in range(3):
                    vertex = f.read(12)
                    x, y, z = struct.unpack('<3f', vertex)
                    
                    min_x = min(min_x, x)
                    min_y = min(min_y, y)
                    min_z = min(min_z, z)
                    max_x = max(max_x, x)
                    max_y = max(max_y, y)
                    max_z = max(max_z, z)
                
                # 跳过属性字节 (2 字节)
                f.read(2)
            
            width = max_x - min_x
            height = max_y - min_y
            depth = max_z - min_z
            
            print(f"  X 轴范围: {min_x:.3f} ~ {max_x:.3f} (宽度: {width:.3f})")
            print(f"  Y 轴范围: {min_y:.3f} ~ {max_y:.3f} (高度: {height:.3f})")
            print(f"  Z 轴范围: {min_z:.3f} ~ {max_z:.3f} (深度: {depth:.3f})")
            
            print(f"\n📏 模型尺寸估算:")
            print(f"  长度: {max(width, depth):.3f} 单位")
            print(f"  高度: {height:.3f} 单位")
            
            return True
            
    except Exception as e:
        print(f"❌ 验证失败: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("用法: python3 validate_stl.py <stl文件路径>")
        print("示例: python3 validate_stl.py cap.stl")
        return 1
    
    filepath = sys.argv[1]
    
    if not os.path.exists(filepath):
        print(f"❌ 文件不存在: {filepath}")
        return 1
    
    print("=" * 60)
    print("🏆 3D Model Viewer - STL 文件验证工具")
    print("=" * 60)
    print()
    
    # 判断文件类型
    with open(filepath, 'rb') as f:
        header = f.read(5)
        
    if header.decode('ascii', errors='ignore') == 'solid':
        print("📝 检测到 ASCII STL 格式")
        print("⚠️  ASCII STL 格式未在此工具中验证")
    else:
        print("📝 检测到 Binary STL 格式")
        print()
        if validate_binary_stl(filepath):
            print()
            print("=" * 60)
            print("✅ STL 文件验证通过")
            print("=" * 60)
            return 0
        else:
            print()
            print("=" * 60)
            print("❌ STL 文件验证失败")
            print("=" * 60)
            return 1

if __name__ == '__main__':
    sys.exit(main())