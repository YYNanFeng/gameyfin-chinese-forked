# 代理服务器配置说明

## 功能概述

Gameyfin 现在支持配置代理服务器,用于访问外部API(如 IGDB、Steam、Bangumi、SteamGridDB等)。此功能允许您:

- 在企业网络环境中通过代理访问外部API
- 在受限网络环境(如中国大陆)中访问被屏蔽的服务
- 通过代理进行网络调试和监控

## 配置步骤

### 1. 访问代理设置页面

1. 以管理员身份登录 Gameyfin
2. 进入 **管理** 页面
3. 在左侧菜单中选择 **代理**

### 2. 配置代理参数

在代理设置页面,您可以配置以下参数:

- **启用代理**: 开关按钮,控制是否使用代理服务器
- **代理类型**: 选择代理协议类型
  - `HTTP`: 标准HTTP代理
  - `HTTPS`: HTTPS代理
  - `SOCKS`: SOCKS代理
- **代理主机**: 代理服务器的主机名或IP地址 (例如: `proxy.example.com` 或 `192.168.1.100`)
- **代理端口**: 代理服务器的端口号 (例如: `8080`, `3128`, `1080`)
- **用户名** (可选): 如果代理服务器需要身份验证,请输入用户名
- **密码** (可选): 如果代理服务器需要身份验证,请输入密码

### 3. 测试连接

配置完成后,点击 **测试连接** 按钮验证代理设置:

- 系统会尝试通过代理访问 `https://www.google.com`
- 如果连接成功,会显示 ✓ 代理连接成功,并显示响应时间
- 如果连接失败,会显示错误信息

### 4. 保存配置

测试成功后,点击 **保存** 按钮保存代理配置。

配置保存后会立即生效,所有插件的HTTP请求将通过配置的代理服务器发送。

## 支持的插件

以下插件已支持代理配置:

- ✅ **Bangumi Plugin** - 访问 bgm.tv API
- ✅ **Steam Plugin** - 访问 Steam Store API
- ✅ **SteamGridDB Plugin** - 访问 SteamGridDB API
- ✅ **IGDB Plugin** - 访问 IGDB API (通过系统属性)

## 技术实现

### 后端实现

1. **数据存储**: 代理配置存储在 `proxy_config` 数据库表中
2. **系统属性**: 配置会设置 Java 系统属性:
   - `http.proxyHost` / `https.proxyHost`
   - `http.proxyPort` / `https.proxyPort`
   - `http.proxyUser` / `https.proxyUser`
   - `http.proxyPassword` / `https.proxyPassword`
3. **自动初始化**: 应用启动时自动加载并应用代理配置

### HTTP 客户端配置

不同插件使用不同的HTTP客户端库:

#### OkHttp (Bangumi Plugin)

```kotlin
val proxy = Proxy(Proxy.Type.HTTP, InetSocketAddress(proxyHost, proxyPort))
val client = OkHttpClient.Builder()
    .proxy(proxy)
    .proxyAuthenticator { _, response ->
        val credential = Credentials.basic(username, password)
        response.request.newBuilder()
            .header("Proxy-Authorization", credential)
            .build()
    }
    .build()
```

#### Ktor HttpClient (Steam, SteamGridDB Plugins)

```kotlin
val client = HttpClient(CIO) {
    engine {
        proxy = ProxyBuilder.http(URL("http://$host:$port"))
    }
}
```

## 常见问题

### Q: 配置代理后API请求仍然失败?

**A**: 请检查:
1. 代理服务器地址和端口是否正确
2. 代理服务器是否正在运行
3. 如果需要身份验证,用户名和密码是否正确
4. 防火墙是否允许连接到代理服务器
5. 使用"测试连接"功能验证代理配置

### Q: 如何禁用代理?

**A**: 在代理设置页面,关闭 **启用代理** 开关,然后点击 **保存**。

### Q: 代理配置何时生效?

**A**: 代理配置在保存后立即生效,不需要重启应用。

### Q: 支持哪些代理协议?

**A**: 目前支持:
- HTTP 代理
- HTTPS 代理
- SOCKS 代理

### Q: 代理配置是否影响所有网络请求?

**A**: 仅影响插件访问外部API的请求,不影响:
- 用户浏览器访问 Gameyfin 的请求
- Gameyfin 内部服务间的通信
- 数据库连接

## Docker 部署

如果使用 Docker 部署,代理配置通过 Web UI 管理,无需修改 docker-compose.yml。

### 示例: 使用代理访问被屏蔽的API

```yaml
# docker-compose.yml
version: '3.8'
services:
  gameyfin:
    image: gameyfin/gameyfin:latest
    ports:
      - "8080:8080"
    volumes:
      - ./data:/data
    # 注意: 代理配置现在通过 Web UI 管理,无需环境变量
```

启动容器后:
1. 访问 http://localhost:8080
2. 登录管理员账户
3. 进入 管理 → 代理
4. 配置代理服务器 (例如: `127.0.0.1:7890` 用于 Clash)
5. 测试并保存

## 安全建议

1. **使用 HTTPS**: 如果代理服务器支持,建议选择 HTTPS 类型
2. **保护密码**: 代理密码会加密存储在数据库中
3. **限制访问**: 确保只有管理员可以访问代理设置页面
4. **定期审计**: 定期检查代理配置和使用日志

## 日志

代理相关日志会记录在应用日志中:

```
INFO  ProxyService - Proxy config updated: enabled=true, host=proxy.example.com:8080
INFO  ProxyInitializer - Proxy initialized on startup: proxy.example.com:8080
INFO  BangumiPlugin - Using proxy for API requests
```

## 更新历史

- **v1.0.0** (2025-12-04)
  - 初始版本
  - 支持 HTTP/HTTPS/SOCKS 代理
  - Web UI 配置界面
  - 连接测试功能
  - 自动初始化代理配置
  - Bangumi、Steam、SteamGridDB 插件支持

---

如有问题,请访问 [GitHub Issues](https://github.com/gameyfin/gameyfin/issues) 提交反馈。
