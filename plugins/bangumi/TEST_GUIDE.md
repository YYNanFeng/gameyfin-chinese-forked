# Bangumi 插件 - 快速测试指南

## 🧪 构建插件

### 方法 1: 单独构建 Bangumi 插件

```powershell
# Windows
.\gradlew.bat :plugins:bangumi:build

# Linux/Mac
./gradlew :plugins:bangumi:build
```

构建产物位置：
```
plugins/bangumi/build/libs/bangumi-1.0.0.jar
```

### 方法 2: 构建所有插件

```powershell
# Windows
.\gradlew.bat :plugins:build

# Linux/Mac
./gradlew :plugins:build
```

### 方法 3: 构建整个项目（包括主应用）

```powershell
# Windows
.\gradlew.bat build

# Linux/Mac
./gradlew build
```

## 🚀 快速测试

### 1. 开发模式运行

```powershell
# 启动 Gameyfin（会自动加载插件）
.\gradlew.bat bootRun
```

访问: http://localhost:8080

### 2. 手动安装插件

如果已经有运行中的 Gameyfin：

1. 复制 JAR 文件：
```powershell
copy plugins\bangumi\build\libs\bangumi-1.0.0.jar <gameyfin-data>\plugins\
```

2. 重启 Gameyfin

3. 在管理界面中启用插件

### 3. Docker 测试

构建包含新插件的镜像：

```powershell
# 1. 构建项目
.\gradlew.bat clean build -x test

# 2. 构建 Docker 镜像
docker build -f docker\Dockerfile -t gameyfin/gameyfin:bangumi-test .

# 3. 运行
docker run -d \
  --name gameyfin-test \
  -p 8080:8080 \
  -e APP_KEY="test-key-123" \
  -v .\test-data:/opt/gameyfin/data \
  gameyfin/gameyfin:bangumi-test
```

## 🔍 测试用例

### 测试游戏列表

以下游戏在 Bangumi 上有完整数据，适合测试：

#### 日本游戏
```
1. 女神异闻录5 皇家版
   Bangumi ID: 259908
   
2. 塞尔达传说 旷野之息
   Bangumi ID: 191736
   
3. 最终幻想VII 重制版
   Bangumi ID: 273346
   
4. 尼尔：自动人形
   Bangumi ID: 180085
```

#### Galgame
```
1. 白色相簿2
   Bangumi ID: 18813
   
2. CLANNAD
   Bangumi ID: 575
   
3. Fate/stay night
   Bangumi ID: 1117
```

#### 国产游戏
```
1. 原神
   Bangumi ID: 302866
   
2. 黑神话：悟空
   Bangumi ID: 380841
```

### 测试步骤

1. **安装插件**
   - 在管理界面检查插件是否显示
   - 启用 Bangumi 插件

2. **搜索测试**
   - 在 Gameyfin 中搜索上面的测试游戏
   - 检查是否返回正确结果
   - 验证中文名称显示正确

3. **元数据测试**
   - 检查游戏封面是否加载
   - 检查评分是否显示
   - 检查简介是否为中文
   - 检查发行日期是否正确

4. **平台测试**
   - 检查游戏平台是否正确识别
   - 尝试不同平台的游戏

5. **性能测试**
   - 批量添加多个游戏
   - 观察请求是否被正确限流
   - 检查日志是否有错误

## 📊 验证清单

- [ ] 插件成功加载
- [ ] 可以搜索到测试游戏
- [ ] 游戏名称显示中文
- [ ] 封面图片正常加载
- [ ] 评分正确转换（10分制→百分制）
- [ ] 平台信息正确
- [ ] 简介内容完整
- [ ] 无 API 错误
- [ ] 限流工作正常
- [ ] 日志没有异常

## 🐛 调试技巧

### 查看插件日志

在 Gameyfin 日志中搜索：
```
[bangumi]
BangumiPlugin
BangumiMetadataProvider
```

### 启用详细日志

编辑 `application.yml`:
```yaml
logging.level:
  org.gameyfin.plugins.metadata.bangumi: DEBUG
```

### 手动测试 API

使用 curl 测试 Bangumi API：

```bash
# 搜索游戏
curl -H "User-Agent: Gameyfin/Test" \
  "https://api.bgm.tv/v0/search/subjects?type=4&keyword=女神异闻录5"

# 获取游戏详情
curl -H "User-Agent: Gameyfin/Test" \
  "https://api.bgm.tv/v0/subjects/259908"
```

### 检查插件状态

通过管理 API：
```bash
curl http://localhost:8080/api/plugins
```

## 🔧 常见问题

### 1. 插件无法加载
```
原因: 依赖缺失或版本不兼容
解决: 
- 检查 build.gradle.kts 依赖
- 重新构建: ./gradlew :plugins:bangumi:clean build
```

### 2. API 请求失败
```
原因: 网络问题或 User-Agent 被拒绝
解决:
- 检查网络连接
- 设置合适的 User-Agent
- 查看 Bangumi API 状态
```

### 3. 搜索不到游戏
```
原因: 游戏名称不匹配或不在数据库中
解决:
- 尝试使用不同的游戏名称
- 在 bgm.tv 上搜索确认游戏存在
- 使用游戏的日文原名
```

### 4. 平台识别错误
```
原因: Bangumi 标签信息不完整
解决:
- 手动在 Bangumi 添加正确标签
- 在 Gameyfin 中手动设置平台
```

## 📈 性能基准

预期性能指标：

```
搜索响应时间: < 2秒
详情获取时间: < 1秒
限流间隔: 1秒/请求
并发请求数: 最多2个
内存占用: < 50MB
```

## 🎯 下一步

测试通过后：

1. ✅ 提交代码到仓库
2. 📝 更新主 README
3. 🏷️ 创建 release tag
4. 📦 发布到插件市场（如果有）
5. 📢 通知用户更新

## 💬 反馈

测试中遇到问题？

- 提交 Issue 到 GitHub
- 在 Bangumi 开发小组发帖
- 发送邮件给维护者

---

**祝测试顺利！** 🚀
