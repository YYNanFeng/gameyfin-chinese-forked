# 代理服务器功能测试指南

## 测试前准备

### 1. 构建项目

由于添加了新的后端代码，需要重新构建项目以生成 Vaadin Hilla 的 TypeScript 类型定义。

```powershell
# Windows PowerShell
.\gradlew.bat clean build -x test
```

这个过程可能需要几分钟，会生成以下文件：
- `Frontend/generated/endpoints.ts` - 包含 ProxyEndpoint
- `Frontend/generated/org/gameyfin/app/proxy/dto/` - DTO 类型
- `Frontend/generated/org/gameyfin/app/proxy/entities/` - 实体类型

### 2. 启动应用

```powershell
# 开发模式启动
.\gradlew.bat bootRun
```

或者直接运行生成的 JAR:

```powershell
java -jar app/build/libs/app.jar
```

等待应用启动，看到以下日志表示成功：
```
INFO  ProxyInitializer - No proxy configuration found or proxy is disabled
INFO  GameyfinApplication - Started GameyfinApplication
```

### 3. 访问应用

打开浏览器访问: http://localhost:8080

## 测试场景

### 场景 1: 配置 HTTP 代理（无认证）

**目标**: 测试基本的 HTTP 代理配置

**步骤**:
1. 以管理员身份登录 Gameyfin
2. 进入 **管理** → **代理**
3. 启用 **启用代理** 开关
4. 配置参数:
   - 代理类型: `HTTP`
   - 代理主机: `127.0.0.1` (或你的代理服务器地址)
   - 代理端口: `8080` (或你的代理端口)
   - 用户名: 留空
   - 密码: 留空
5. 点击 **测试连接**

**预期结果**:
- 如果代理可用: 显示 "✓ 代理连接成功" 和响应时间
- 如果代理不可用: 显示错误信息

6. 点击 **保存**

**预期结果**:
- 显示 "代理设置已保存"
- 查看应用日志，应该看到:
  ```
  INFO  ProxyService - Proxy config updated: enabled=true, host=127.0.0.1:8080
  INFO  ProxyService - System proxy properties set
  ```

### 场景 2: 配置需要认证的代理

**目标**: 测试带用户名密码的代理

**步骤**:
1. 在代理设置页面
2. 配置参数:
   - 代理类型: `HTTP`
   - 代理主机: `proxy.company.com`
   - 代理端口: `3128`
   - 用户名: `testuser`
   - 密码: `testpass`
3. 点击 **测试连接**
4. 点击 **保存**

**预期结果**:
- 测试连接根据代理服务器返回相应结果
- 配置保存成功
- 密码在数据库中加密存储

### 场景 3: 配置 SOCKS 代理

**目标**: 测试 SOCKS 代理（常用于 Clash、V2Ray 等）

**步骤**:
1. 在代理设置页面
2. 配置参数:
   - 代理类型: `SOCKS`
   - 代理主机: `127.0.0.1`
   - 代理端口: `7890` (Clash 默认端口)
   - 用户名: 留空
   - 密码: 留空
3. 点击 **测试连接**
4. 点击 **保存**

**预期结果**:
- 如果本地运行了 Clash: 测试成功
- 配置保存成功

### 场景 4: 测试插件使用代理

**目标**: 验证 Bangumi 插件是否通过代理访问 API

**前置条件**: 
- 已配置并保存代理
- 已启用代理

**步骤**:
1. 进入 **管理** → **插件**
2. 确保 Bangumi 插件已启用
3. 尝试搜索或刮削一个游戏（例如搜索 "塞尔达传说"）
4. 查看应用日志

**预期结果**:
- 日志中应该看到 Bangumi API 请求
- 如果使用了抓包工具（如 Charles），应该能看到请求经过代理
- 游戏元数据成功获取

**验证方法**:
```powershell
# 在另一个终端查看日志
.\gradlew.bat bootRun | Select-String "bangumi"
```

### 场景 5: 禁用代理

**目标**: 测试禁用代理功能

**步骤**:
1. 在代理设置页面
2. 关闭 **启用代理** 开关
3. 点击 **保存**

**预期结果**:
- 显示 "代理设置已保存"
- 查看日志:
  ```
  INFO  ProxyService - System proxy properties cleared
  ```
- 插件不再使用代理访问 API

### 场景 6: 应用重启后配置保持

**目标**: 验证代理配置持久化

**步骤**:
1. 配置并保存代理（启用状态）
2. 停止应用 (Ctrl+C)
3. 重新启动应用
4. 查看启动日志

**预期结果**:
```
INFO  ProxyInitializer - Proxy initialized on startup: 127.0.0.1:8080
```

5. 进入代理设置页面

**预期结果**:
- 之前的配置仍然存在
- 启用状态保持

### 场景 7: 错误处理测试

**目标**: 测试错误场景

#### 7.1 无效的主机
**步骤**:
- 主机: `invalid.proxy.server.that.does.not.exist`
- 端口: `8080`
- 点击 **测试连接**

**预期结果**:
- 显示 "✗ 代理连接失败"
- 显示具体错误信息（如 "连接失败: UnknownHostException"）

#### 7.2 错误的端口
**步骤**:
- 主机: `127.0.0.1`
- 端口: `9999` (假设该端口没有服务)
- 点击 **测试连接**

**预期结果**:
- 显示 "✗ 代理连接失败"
- 显示连接超时或拒绝连接的错误

#### 7.3 认证失败
**步骤**:
- 配置需要认证的代理
- 输入错误的用户名/密码
- 点击 **测试连接**

**预期结果**:
- 显示 "✗ 代理连接失败: HTTP 407" (Proxy Authentication Required)

## 高级测试

### 使用本地代理工具测试

#### Charles Proxy

1. 启动 Charles Proxy
2. Charles 默认端口: `8888`
3. 配置 Gameyfin 代理:
   - 主机: `localhost`
   - 端口: `8888`
4. 在 Gameyfin 中搜索游戏
5. 在 Charles 中查看请求

**预期结果**:
- Charles 应该捕获到 Gameyfin 发往 IGDB/Steam/Bangumi 的请求
- 可以看到完整的 HTTP 请求和响应

#### Clash

1. 启动 Clash
2. 确认 HTTP 代理端口（通常是 `7890`）
3. 配置 Gameyfin 代理:
   - 类型: `HTTP` 或 `SOCKS`
   - 主机: `127.0.0.1`
   - 端口: `7890`
4. 测试连接和使用

### 数据库验证

查看代理配置是否正确存储:

```sql
-- 查看 proxy_config 表
SELECT * FROM proxy_config;
```

**预期结果**:
- 表中有一条记录
- `enabled` 字段为 true/false
- `host`, `port`, `type` 正确
- `password` 字段应该是加密的（不是明文）

### 系统属性验证

在应用运行时，通过 JMX 或日志验证系统属性是否设置:

添加临时日志代码:
```kotlin
// 在 ProxyInitializer.kt 的 initializeProxy() 方法中添加
log.info { "http.proxyHost = ${System.getProperty("http.proxyHost")}" }
log.info { "http.proxyPort = ${System.getProperty("http.proxyPort")}" }
```

## 性能测试

### 测试代理对性能的影响

**步骤**:
1. 不使用代理，搜索 10 个游戏，记录总时间
2. 启用代理，搜索相同的 10 个游戏，记录总时间
3. 比较差异

**预期结果**:
- 使用代理会增加一些延迟（取决于代理服务器的位置和性能）
- 差异应该在可接受范围内（通常 < 200ms）

## 常见问题排查

### 问题 1: TypeScript 编译错误

**症状**: 
```
找不到模块"Frontend/generated/endpoints"
```

**解决方案**:
```powershell
# 清理并重新构建
.\gradlew.bat clean build -x test
```

### 问题 2: 代理测试总是失败

**排查步骤**:
1. 确认代理服务器是否运行
2. 尝试用 curl 测试代理:
   ```powershell
   curl -x http://127.0.0.1:8080 https://www.google.com
   ```
3. 检查防火墙设置
4. 查看应用日志中的详细错误信息

### 问题 3: 插件不使用代理

**排查步骤**:
1. 确认代理已启用并保存
2. 重启应用
3. 查看启动日志中的 ProxyInitializer 信息
4. 在插件代码中添加日志验证:
   ```kotlin
   log.info { "Proxy host: ${System.getProperty("http.proxyHost")}" }
   ```

### 问题 4: 数据库连接错误

**症状**: 
```
Table "PROXY_CONFIG" not found
```

**解决方案**:
- Hibernate 应该自动创建表
- 如果没有，检查 `application.yml` 中的 JPA 配置
- 或手动运行 SQL:
  ```sql
  CREATE TABLE proxy_config (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      enabled BOOLEAN NOT NULL,
      type VARCHAR(10) NOT NULL,
      host VARCHAR(255) NOT NULL,
      port INT NOT NULL,
      username VARCHAR(255),
      password VARCHAR(255),
      updated_at TIMESTAMP NOT NULL
  );
  ```

## 测试清单

- [ ] 构建项目成功
- [ ] 启动应用成功
- [ ] 访问代理设置页面
- [ ] 配置 HTTP 代理（无认证）
- [ ] 测试连接成功
- [ ] 保存配置成功
- [ ] 配置 HTTP 代理（需要认证）
- [ ] 配置 SOCKS 代理
- [ ] 测试 Bangumi 插件使用代理
- [ ] 测试 Steam 插件使用代理
- [ ] 禁用代理功能
- [ ] 重启后配置保持
- [ ] 错误处理正常
- [ ] 中英文界面切换正常
- [ ] 移动端界面正常

## 成功标准

✅ 所有测试场景通过  
✅ 没有控制台错误  
✅ 日志记录正确  
✅ 配置持久化正常  
✅ 插件正常使用代理  
✅ 性能影响可接受  

## 测试报告模板

```
测试日期: ___________
测试人员: ___________
测试环境: Windows / Linux / macOS
代理工具: Charles / Clash / 其他

| 测试场景 | 状态 | 备注 |
|---------|------|------|
| 场景 1: HTTP 代理（无认证） | ✅/❌ |  |
| 场景 2: HTTP 代理（需认证） | ✅/❌ |  |
| 场景 3: SOCKS 代理 | ✅/❌ |  |
| 场景 4: 插件使用代理 | ✅/❌ |  |
| 场景 5: 禁用代理 | ✅/❌ |  |
| 场景 6: 配置持久化 | ✅/❌ |  |
| 场景 7: 错误处理 | ✅/❌ |  |

问题记录:
1. ___________
2. ___________

总体评价: ___________
```

---

如有问题，请参考 `PROXY_CONFIGURATION_GUIDE.md` 或提交 Issue。
