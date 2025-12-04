@echo off
REM Gameyfin Docker 构建脚本 - Windows 版本
REM 
REM 使用方法：
REM   build-docker.bat          - 构建本地镜像
REM   build-docker.bat clean    - 清理后重新构建

echo ========================================
echo Gameyfin Docker 镜像构建脚本
echo ========================================
echo.

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Docker，请先安装 Docker Desktop
    echo 下载地址: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [1/4] Docker 环境检查通过
echo.

REM 检查是否需要清理
if "%1"=="clean" (
    echo [清理] 清除旧的构建文件...
    call gradlew.bat clean
    echo.
)

REM 构建项目
echo [2/4] 开始构建项目（这可能需要几分钟）...
echo.
call gradlew.bat build -x test

if errorlevel 1 (
    echo.
    echo [错误] 项目构建失败，请检查错误信息
    pause
    exit /b 1
)

echo.
echo [3/4] 项目构建成功！
echo.

REM 构建 Docker 镜像
echo [4/4] 构建 Docker 镜像...
echo.
docker build -f docker\Dockerfile -t gameyfin/gameyfin:latest .

if errorlevel 1 (
    echo.
    echo [错误] Docker 镜像构建失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 构建成功！
echo ========================================
echo.
echo 镜像名称: gameyfin/gameyfin:latest
echo.
echo 查看镜像:
echo   docker images gameyfin/gameyfin
echo.
echo 运行容器:
echo   方式1: docker-compose up -d
echo   方式2: 参考 DOCKER_BUILD_GUIDE.md
echo.
echo 首次使用前请:
echo   1. 编辑 docker-compose.yml
echo   2. 设置 APP_KEY (运行: openssl rand -base64 32)
echo   3. 配置游戏库路径
echo.

pause
