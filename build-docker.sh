#!/bin/bash
# Gameyfin Docker 构建脚本 - Linux/Mac 版本
# 
# 使用方法：
#   ./build-docker.sh          - 构建本地镜像
#   ./build-docker.sh clean    - 清理后重新构建
#   ./build-docker.sh multi    - 多平台构建（需要 buildx）

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "Gameyfin Docker 镜像构建脚本"
echo "========================================"
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[错误] 未检测到 Docker，请先安装 Docker${NC}"
    echo "安装指南: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${GREEN}[1/4] Docker 环境检查通过${NC}"
echo ""

# 检查是否需要清理
if [ "$1" = "clean" ]; then
    echo -e "${YELLOW}[清理] 清除旧的构建文件...${NC}"
    ./gradlew clean
    echo ""
fi

# 构建项目
echo -e "${YELLOW}[2/4] 开始构建项目（这可能需要几分钟）...${NC}"
echo ""
./gradlew build -x test

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}[错误] 项目构建失败，请检查错误信息${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}[3/4] 项目构建成功！${NC}"
echo ""

# 构建 Docker 镜像
if [ "$1" = "multi" ]; then
    echo -e "${YELLOW}[4/4] 构建多平台 Docker 镜像...${NC}"
    echo ""
    
    # 创建 buildx builder（如果不存在）
    if ! docker buildx inspect gameyfin-builder &> /dev/null; then
        echo "创建 buildx builder..."
        docker buildx create --use --name gameyfin-builder
    else
        docker buildx use gameyfin-builder
    fi
    
    docker buildx build \
        --platform linux/amd64,linux/arm64 \
        -f docker/Dockerfile \
        -t gameyfin/gameyfin:latest \
        --load \
        .
else
    echo -e "${YELLOW}[4/4] 构建 Docker 镜像...${NC}"
    echo ""
    docker build -f docker/Dockerfile -t gameyfin/gameyfin:latest .
fi

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}[错误] Docker 镜像构建失败${NC}"
    exit 1
fi

echo ""
echo "========================================"
echo -e "${GREEN}✅ 构建成功！${NC}"
echo "========================================"
echo ""
echo "镜像名称: gameyfin/gameyfin:latest"
echo ""
echo "查看镜像:"
echo "  docker images gameyfin/gameyfin"
echo ""
echo "运行容器:"
echo "  方式1: docker-compose up -d"
echo "  方式2: 参考 DOCKER_BUILD_GUIDE.md"
echo ""
echo "首次使用前请:"
echo "  1. 编辑 docker-compose.yml"
echo "  2. 设置 APP_KEY (运行: openssl rand -base64 32)"
echo "  3. 配置游戏库路径"
echo ""
