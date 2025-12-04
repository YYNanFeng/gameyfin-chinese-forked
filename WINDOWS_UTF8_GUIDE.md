# Windows 中文日志显示配置指南

## 问题描述

在 Windows 系统上运行 Gameyfin 时，控制台可能显示乱码，例如：
```
锟斤拷锟斤拷锟斤拷锟斤拷械锟斤拷锟斤拷锟斤拷止锟斤拷一锟斤拷锟窖斤拷锟斤拷锟斤拷锟斤拷锟接★拷
```

这是由于 Windows 默认控制台编码为 GBK，而 Java/Spring Boot 使用 UTF-8 编码导致的。

## 解决方案

### 方案 1：使用提供的启动脚本（推荐）

#### PowerShell 用户
```powershell
.\start-utf8.ps1
```

#### CMD 用户
```cmd
start-utf8.bat
```

这些脚本会自动设置正确的编码并启动应用。

### 方案 2：手动设置编码

#### PowerShell
```powershell
# 设置控制台编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$env:JAVA_TOOL_OPTIONS = "-Dfile.encoding=UTF-8 -Dconsole.encoding=UTF-8"

# 启动应用
.\gradlew.bat :app:bootRun
```

#### CMD
```cmd
chcp 65001
set JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF-8 -Dconsole.encoding=UTF-8
gradlew.bat :app:bootRun
```

### 方案 3：配置 Windows Terminal（长期解决方案）

如果使用 Windows Terminal，可以永久配置 UTF-8：

1. 打开 Windows Terminal 设置
2. 选择您的配置文件（PowerShell 或 CMD）
3. 在"高级"部分找到"文本编码"
4. 设置为 "UTF-8"

或者编辑 `settings.json`：
```json
{
    "profiles": {
        "defaults": {
            "fontFace": "Consolas",
            "fontSize": 10
        },
        "list": [
            {
                "commandline": "powershell.exe",
                "name": "Windows PowerShell",
                "startingDirectory": "%USERPROFILE%",
                "fontFace": "Consolas",
                "guid": "{61c54bbd-c2c6-5271-96e7-009a87ff44bf}"
            }
        ]
    }
}
```

### 方案 4：IDEA/IntelliJ 用户

在 IDEA 中运行时：

1. 打开 `Run` -> `Edit Configurations...`
2. 选择您的运行配置
3. 在 `VM options` 中添加：
   ```
   -Dfile.encoding=UTF-8 -Dconsole.encoding=UTF-8
   ```
4. 在 `Environment variables` 中添加：
   ```
   JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF-8
   ```

## 配置文件说明

项目已添加以下配置文件来支持 UTF-8：

### 1. `logback-spring.xml`
```xml
<encoder>
    <charset>UTF-8</charset>
</encoder>
```

配置了控制台和文件日志都使用 UTF-8 编码。

### 2. `application.yml`
```yaml
spring:
  http:
    encoding:
      charset: UTF-8
      enabled: true
      force: true
  messages:
    encoding: UTF-8
```

确保 HTTP 请求和消息都使用 UTF-8。

## 日志文件

应用会在 `logs/` 目录下生成日志文件：
- `gameyfin.log` - 当前日志
- `gameyfin.YYYY-MM-DD.log` - 按日期归档的历史日志

日志文件始终使用 UTF-8 编码，可以使用支持 UTF-8 的编辑器查看（如 VS Code、Notepad++ 等）。

## 验证编码设置

启动应用后，您应该能看到正确的中文输出，例如：
```
正在启动 Gameyfin...
控制台编码已设置为 UTF-8
2025-12-04T19:38:47.091+08:00  INFO 10004 --- [           main] o.g.GameyfinApplicationKt : 应用程序已启动
```

## 故障排除

### 如果仍然看到乱码

1. **确认终端编码**：
   ```powershell
   [Console]::OutputEncoding
   ```
   应显示：`BodyName : utf-8`

2. **检查 Java 编码**：
   ```cmd
   java -XshowSettings:properties -version 2>&1 | findstr "file.encoding"
   ```
   应显示：`file.encoding = UTF-8`

3. **清理并重新构建**：
   ```powershell
   .\gradlew.bat clean build
   ```

4. **检查日志文件**：
   日志文件 `logs/gameyfin.log` 应该始终显示正确的中文。如果控制台乱码但日志文件正常，说明是终端编码问题。

## 注意事项

- 启动脚本会自动创建 `logs` 目录
- 日志文件默认保留 30 天
- 修改日志配置后需要重启应用
- 建议使用 Windows Terminal 或支持 UTF-8 的现代终端
