# 设置控制台编码为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$env:JAVA_TOOL_OPTIONS = "-Dfile.encoding=UTF-8 -Dconsole.encoding=UTF-8"

Write-Host "正在启动 Gameyfin..." -ForegroundColor Green
Write-Host "控制台编码已设置为 UTF-8" -ForegroundColor Cyan

# 运行 Gradle bootRun
& .\gradlew.bat :app:bootRun
