# Bangumi Metadata Plugin

Bangumi（番组计划）游戏元数据插件，为 Gameyfin 提供从 [Bangumi](https://bgm.tv) 获取游戏信息的功能。

## 功能特性

- 🔍 通过游戏名称搜索
- 📊 获取游戏评分和排名
- 🎮 支持多平台游戏
- 🌐 中文游戏信息友好
- ⚡ 自动限流（遵守 Bangumi API 限制）

## 配置说明

### User Agent
- **默认值**: `Gameyfin/2.2.1`
- **说明**: 自定义 User Agent，建议使用格式 `AppName/Version`

### API Base URL
- **默认值**: `https://api.bgm.tv`
- **说明**: Bangumi API 地址（通常不需要修改）

## 使用方法

1. 在 Gameyfin 管理界面中安装此插件
2. 启用插件
3. 扫描游戏库时会自动从 Bangumi 获取元数据

## 支持的平台

- PC
- PlayStation 系列 (PS1-PS5, PSP, PS Vita)
- Xbox 系列 (Xbox, Xbox 360, Xbox One, Xbox Series)
- Nintendo 系列 (Switch, Wii, Wii U, 3DS, DS, GB, GBA)
- 移动平台 (iOS, Android)

## API 限制

- 每秒最多 1 个请求
- 遵守 Bangumi API 使用规范

## 数据来源

数据来自 [Bangumi 番组计划](https://bgm.tv)，一个专注于 ACG 领域的条目收录站。

## 相关链接

- [Bangumi 官网](https://bgm.tv)
- [Bangumi API 文档](https://bangumi.github.io/api/)
- [Bangumi GitHub](https://github.com/bangumi)

## 许可证

AGPL-3.0

## 注意事项

1. 请遵守 Bangumi 的使用条款
2. 建议设置有意义的 User Agent
3. Bangumi 主要收录日本游戏，对欧美游戏覆盖较少
4. 某些游戏可能需要手动匹配
