package org.gameyfin.app.config

import org.springframework.boot.logging.LogLevel
import java.io.Serializable
import kotlin.reflect.KClass

sealed class ConfigProperties<T : Serializable>(
    val type: KClass<T>,
    val key: String,
    val description: String,
    val default: T? = null,
    val allowedValues: List<T>? = null,
    val min: Number? = null,
    val max: Number? = null,
    val step: Number? = null
) {

    /** Libraries */
    sealed class Libraries {
        data object AllowPublicAccess : ConfigProperties<Boolean>(
            Boolean::class,
            "library.allow-public-access",
            "允许无需登录访问 Gameyfin",
            false
        )

        sealed class Scan {
            data object EnableFilesystemWatcher : ConfigProperties<Boolean>(
                Boolean::class,
                "library.scan.enable-filesystem-watcher",
                "启用使用文件系统监视器的自动库扫描（即将推出™）",
                false
            )

            data object ScanEmptyDirectories : ConfigProperties<Boolean>(
                Boolean::class,
                "library.scan.scan-empty-directories",
                "扫描空目录",
                false
            )

            data object ExtractTitleUsingRegex : ConfigProperties<Boolean>(
                Boolean::class,
                "library.scan.extract-title-using-regex",
                "使用正则表达式从文件名提取标题",
                false
            )

            data object TitleExtractionRegex : ConfigProperties<String>(
                String::class,
                "library.scan.title-extraction-regex",
                "从文件名提取标题的正则表达式",
                "^[^\\[]+"
            )

            data object TitleMatchMinRatio : ConfigProperties<Int>(
                Int::class,
                "library.scan.title-match-min-ratio",
                "标题匹配的最小比率。值越高匹配越严格。",
                default = 90,
                min = 0,
                max = 100,
                step = 1
            )

            data object GameFileExtensions : ConfigProperties<Array<String>>(
                Array<String>::class,
                "library.scan.game-file-extensions",
                "被视为游戏的文件扩展名",
                arrayOf(
                    "zip",
                    "tar",
                    "gz",
                    "rar",
                    "7z",
                    "bz2",
                    "xz",
                    "iso",
                    "jar",
                    "tgz",
                    "exe",
                    "bat",
                    "cmd",
                    "com",
                    "msi",
                    "bin",
                    "run",
                    "app",
                    "dmg",
                    "elf"
                )
            )
        }

        sealed class Metadata {
            data object UpdateEnabled : ConfigProperties<Boolean>(
                Boolean::class,
                "library.metadata.update.enabled",
                "启用视频游戏元数据的定期刷新",
                true
            )

            data object UpdateSchedule : ConfigProperties<String>(
                String::class,
                "library.metadata.update.schedule",
                "元数据定期刷新的计划（Spring cron 格式）",
                "@daily"
            )
        }
    }

    /** Requests */
    sealed class Requests {
        sealed class Games {
            data object Enabled : ConfigProperties<Boolean>(
                Boolean::class,
                "requests.games.enabled",
                "启用游戏请求提交",
                true
            )

            data object AllowGuestsToRequestGames : ConfigProperties<Boolean>(
                Boolean::class,
                "requests.games.allow-guests-to-request-games",
                "允许访客（未登录）创建游戏请求",
                false
            )

            data object MaxOpenRequestsPerUser : ConfigProperties<Int>(
                Int::class,
                "requests.games.max-open-requests-per-user",
                "每个用户的最大待处理请求数。设置为 0 表示无限制。",
                10
            )
        }
    }

    /** Downloads */
    sealed class Downloads {
        data object BandwidthLimitEnabled : ConfigProperties<Boolean>(
            Boolean::class,
            "downloads.bandwidth-limit.enabled",
            "启用每用户下载带宽限制",
            false
        )

        data object BandwidthLimitMbps : ConfigProperties<Int>(
            Int::class,
            "downloads.bandwidth-limit.mbps",
            "最大下载速度（Mbps - 兆比特每秒）",
            100
        )
    }

    /** User management */
    sealed class Users {
        sealed class SignUps {
            data object Allow : ConfigProperties<Boolean>(
                Boolean::class,
                "users.sign-ups.allow",
                "允许新用户自行注册",
                false
            )

            data object ConfirmationRequired : ConfigProperties<Boolean>(
                Boolean::class,
                "users.sign-ups.confirmation-required",
                "管理员需要确认新用户",
                true
            )
        }
    }

    /** Single Sign-On */
    sealed class SSO {
        sealed class OIDC {
            data object Enabled : ConfigProperties<Boolean>(
                Boolean::class,
                "sso.oidc.enabled",
                "启用通过 OIDC/OAuth2 的单点登录",
                false
            )

            data object MatchExistingUsersBy : ConfigProperties<MatchUsersBy>(
                MatchUsersBy::class,
                "sso.oidc.match-existing-users-by",
                "匹配现有用户的方式",
                MatchUsersBy.username,
                MatchUsersBy.entries
            )

            data object AutoRegisterNewUsers : ConfigProperties<Boolean>(
                Boolean::class,
                "sso.oidc.auto-register-new-users",
                "注册后自动创建新用户",
                true
            )

            data object RolesClaim : ConfigProperties<String>(
                String::class,
                "sso.oidc.roles-claim",
                "用于提取角色的 JWT 声明",
                "roles"
            )

            data object OAuthScopes : ConfigProperties<Array<String>>(
                Array<String>::class,
                "sso.oidc.oauth-scopes",
                "要请求的 OAuth2 作用域",
                arrayOf("openid", "profile", "email", "roles")
            )

            data object ClientId : ConfigProperties<String>(
                String::class,
                "sso.oidc.client-id",
                "客户端 ID"
            )

            data object ClientSecret : ConfigProperties<String>(
                String::class,
                "sso.oidc.client-secret",
                "客户端密钥"
            )

            data object IssuerUrl : ConfigProperties<String>(
                String::class,
                "sso.oidc.issuer-url",
                "签发者 URL"
            )

            data object AuthorizeUrl : ConfigProperties<String>(
                String::class,
                "sso.oidc.authorize-url",
                "授权 URL"
            )

            data object TokenUrl : ConfigProperties<String>(
                String::class,
                "sso.oidc.token-url",
                "令牌 URL"
            )

            data object UserInfoUrl : ConfigProperties<String>(
                String::class,
                "sso.oidc.userinfo-url",
                "用户信息 URL"
            )

            data object JwksUrl : ConfigProperties<String>(
                String::class,
                "sso.oidc.jwks-url",
                "JWKS URL"
            )

            data object LogoutUrl : ConfigProperties<String>(
                String::class,
                "sso.oidc.logout-url",
                "登出 URL"
            )
        }
    }

    /** Messages */
    sealed class Messages {
        sealed class Providers {
            sealed class Email {
                data object Enabled : ConfigProperties<Boolean>(
                    Boolean::class,
                    "messages.providers.email.enabled",
                    "启用电子邮件通知",
                    false
                )

                data object Host : ConfigProperties<String>(
                    String::class,
                    "messages.providers.email.host",
                    "邮件服务器地址"
                )

                data object Port : ConfigProperties<Int>(
                    Int::class,
                    "messages.providers.email.port",
                    "邮件服务器端口",
                    587
                )

                data object Username : ConfigProperties<String>(
                    String::class,
                    "messages.providers.email.username",
                    "邮件账户用户名"
                )

                data object Password : ConfigProperties<String>(
                    String::class,
                    "messages.providers.email.password",
                    "邮件账户密码"
                )
            }
        }
    }

    /** Logs */
    sealed class Logs {
        data object Folder : ConfigProperties<String>(
            String::class,
            "logs.folder",
            "日志文件存储文件夹",
            "./logs"
        )

        data object MaxHistoryDays : ConfigProperties<Int>(
            Int::class,
            "logs.max-history-days",
            "日志保留天数",
            30
        )

        sealed class Level {
            data object Gameyfin : ConfigProperties<LogLevel>(
                LogLevel::class,
                "logs.level.gameyfin",
                "日志级别（Gameyfin）",
                LogLevel.INFO,
                LogLevel.entries
            )

            data object Root : ConfigProperties<LogLevel>(
                LogLevel::class,
                "logs.level.root",
                "日志级别（根级别）",
                LogLevel.WARN,
                LogLevel.entries
            )
        }
    }
}

enum class MatchUsersBy {
    username, email
}