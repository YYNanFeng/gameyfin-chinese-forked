# Gameyfin Docker 构建和部署指南

本指南将帮助你构建 Gameyfin 的 Docker 镜像并进行部署。

## 前置要求

- Docker 20.10+ 或更高版本
- Docker Compose (可选，用于简化部署)
- 至少 2GB 可用内存
- 至少 10GB 可用磁盘空间

## 方法一：构建 Docker 镜像（推荐用于开发和自定义）

### 步骤 1：构建项目

在项目根目录执行：

**Windows (PowerShell):**
```powershell
# 构建整个项目（包括前端和后端）
.\gradlew.bat clean build -x test
```

**Linux/Mac:**
```bash
# 构建整个项目（包括前端和后端）
./gradlew clean build -x test
```

构建完成后，你会看到：
- `app/build/libs/app.jar` - 主应用 JAR
- `plugins/*/build/libs/*.jar` - 各个插件的 JAR

### 步骤 2：构建 Docker 镜像

**单平台构建（本地使用）:**
```bash
# 构建 AMD64 镜像（适用于大多数 PC）
docker build -f docker/Dockerfile -t gameyfin/gameyfin:latest .
```

**多平台构建（如果需要 ARM 支持）:**
```bash
# 创建并使用 buildx builder
docker buildx create --use --name gameyfin-builder

# 构建多平台镜像
docker buildx build --platform linux/amd64,linux/arm64 \
  -f docker/Dockerfile \
  -t gameyfin/gameyfin:latest \
  --load .
```

### 步骤 3：验证镜像

```bash
# 查看构建的镜像
docker images | grep gameyfin

# 预期输出类似：
# gameyfin/gameyfin   latest   abc123def456   2 minutes ago   450MB
```

## 方法二：使用预构建镜像（推荐用于快速部署）

如果官方仓库有镜像，可以直接拉取：

```bash
docker pull ghcr.io/gameyfin/gameyfin:2
```

## 部署方式

### 选项 A：使用 Docker Compose（推荐）

1. **创建部署目录：**

```bash
mkdir gameyfin-deploy
cd gameyfin-deploy
```

2. **创建 docker-compose.yml：**

参考下面的配置文件（已创建为 `docker-compose.yml`）

3. **生成应用密钥：**

```bash
# 生成随机密钥
openssl rand -base64 32
```

4. **编辑 docker-compose.yml，填入密钥和配置**

5. **启动服务：**

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f gameyfin

# 停止服务
docker-compose down
```

### 选项 B：直接使用 Docker 命令

```bash
# 生成应用密钥
APP_KEY=$(openssl rand -base64 32)

# 创建数据目录
mkdir -p gameyfin/{db,data,plugindata,logs,games}

# 运行容器
docker run -d \
  --name gameyfin \
  --restart unless-stopped \
  -p 8080:8080 \
  -e APP_KEY="$APP_KEY" \
  -e APP_URL="http://localhost:8080" \
  -v $(pwd)/gameyfin/db:/opt/gameyfin/db \
  -v $(pwd)/gameyfin/data:/opt/gameyfin/data \
  -v $(pwd)/gameyfin/plugindata:/opt/gameyfin/plugindata \
  -v $(pwd)/gameyfin/logs:/opt/gameyfin/logs \
  -v $(pwd)/gameyfin/games:/games \
  gameyfin/gameyfin:latest

# 查看日志
docker logs -f gameyfin
```

## 访问应用

应用启动后，通过以下地址访问：

```
http://localhost:8080
```

首次访问会进入设置向导，按提示完成初始配置。

## 常用管理命令

```bash
# 查看容器状态
docker ps | grep gameyfin

# 查看实时日志
docker logs -f gameyfin

# 重启容器
docker restart gameyfin

# 停止容器
docker stop gameyfin

# 删除容器
docker rm gameyfin

# 进入容器 Shell
docker exec -it gameyfin sh

# 查看容器资源占用
docker stats gameyfin
```

## 数据备份

重要数据目录：

- `./db/` - 数据库文件（用户、游戏信息等）
- `./data/` - 游戏封面、截图等媒体文件
- `./plugindata/` - 插件数据
- `./logs/` - 日志文件

**备份命令：**

```bash
# 停止容器
docker-compose stop gameyfin

# 备份数据
tar -czf gameyfin-backup-$(date +%Y%m%d).tar.gz db/ data/ plugindata/

# 启动容器
docker-compose start gameyfin
```

## 更新镜像

```bash
# 使用 Docker Compose
docker-compose pull
docker-compose up -d

# 或手动更新
docker pull gameyfin/gameyfin:latest
docker stop gameyfin
docker rm gameyfin
# 然后重新运行 docker run 命令
```

## 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker logs gameyfin

# 检查端口占用
netstat -an | grep 8080
```

### 权限问题

```bash
# 检查目录权限
ls -la db/ data/ plugindata/

# 修复权限（使用 PUID/PGID）
docker-compose down
# 在 docker-compose.yml 中设置 PUID 和 PGID
docker-compose up -d
```

### 内存不足

在 docker-compose.yml 中添加内存限制：

```yaml
deploy:
  resources:
    limits:
      memory: 2G
    reservations:
      memory: 1G
```

## 高级配置

### 反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name gameyfin.example.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 使用 Traefik

参考 `docker-compose.traefik.yml`（如需创建）

## 性能优化

在 docker-compose.yml 中设置 JVM 参数：

```yaml
environment:
  JAVA_OPTS: "-Xms512m -Xmx2048m -XX:+UseG1GC"
```

## 安全建议

1. ✅ 始终使用强随机的 APP_KEY
2. ✅ 不要暴露 8080 端口到公网，使用反向代理
3. ✅ 定期备份数据库
4. ✅ 启用 HTTPS（通过反向代理）
5. ✅ 定期更新镜像版本

## 支持

- 官方文档：https://gameyfin.org
- GitHub Issues：https://github.com/gameyfin/gameyfin/issues
