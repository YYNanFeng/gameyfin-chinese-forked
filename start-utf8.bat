@echo off
chcp 65001 >nul
set JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF-8 -Dconsole.encoding=UTF-8

echo 正在启动 Gameyfin...
echo 控制台编码已设置为 UTF-8

gradlew.bat :app:bootRun
