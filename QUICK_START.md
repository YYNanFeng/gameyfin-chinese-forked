# Gameyfin 快速部署指南

## 🚀 快速开始（3 步完成部署）

### 第 1 步：构建 Docker 镜像

**Windows 用户：**
```cmd
build-docker.bat
```

**Linux/Mac 用户：**
```bash
chmod +x build-docker.sh
./build-docker.sh
```

### 第 2 步：配置部署文件

1. **生成应用密钥：**

```bash
# 生成随机密钥
openssl rand -base64 32
```

2. **编辑 docker-compose.yml：**

找到并修改以下内容：

```yaml
environment:
  APP_KEY: "你的密钥"  # 粘贴上面生成的密钥
```

3. **配置游戏库路径：**

在 `volumes` 部分添加你的游戏文件夹：

```yaml
volumes:
  # Windows 示例
  - "D:/Games:/games"
  - "E:/SteamLibrary:/steam"
  
  # Linux 示例
  # - "/mnt/storage/games:/games"
```

### 第 3 步：启动服务

```bash
docker-compose up -d
```

## 🌐 访问应用

打开浏览器访问：**http://localhost:8080**

首次访问会进入设置向导：
1. 创建管理员账户
2. 配置游戏库路径
3. 安装需要的插件（IGDB、Steam 等）
4. 开始扫描游戏库

## 📋 常用命令

```bash
# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新并重启
docker-compose pull
docker-compose up -d
```

## 🎮 添加游戏库

在设置中添加游戏库路径，支持：
- 本地游戏文件夹
- Steam 库
- GOG 游戏
- Epic Games
- 复古游戏 ROM

## 🔌 推荐插件

- **IGDB** - 游戏元数据（必装）
- **SteamGridDB** - 游戏封面和图片
- **Steam** - Steam 游戏信息
- **DirectDownload** - 直接下载支持

## 📱 移动端访问

在同一网络下，使用电脑 IP 访问：
```
http://你的电脑IP:8080
```

例如：`http://192.168.1.100:8080`

## 🆘 遇到问题？

查看详细文档：`DOCKER_BUILD_GUIDE.md`

---

**祝你游戏管理愉快！** 🎉
