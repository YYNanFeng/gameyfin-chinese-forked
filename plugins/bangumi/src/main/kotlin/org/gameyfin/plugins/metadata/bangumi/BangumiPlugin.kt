package org.gameyfin.plugins.metadata.bangumi

import io.github.resilience4j.bulkhead.Bulkhead
import io.github.resilience4j.bulkhead.BulkheadConfig
import io.github.resilience4j.decorators.Decorators
import io.github.resilience4j.ratelimiter.RateLimiter
import io.github.resilience4j.ratelimiter.RateLimiterConfig
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import me.xdrop.fuzzywuzzy.FuzzySearch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.gameyfin.pluginapi.core.config.ConfigMetadata
import org.gameyfin.pluginapi.core.config.PluginConfigMetadata
import org.gameyfin.pluginapi.core.wrapper.ConfigurableGameyfinPlugin
import org.gameyfin.pluginapi.gamemetadata.*
import org.pf4j.Extension
import org.pf4j.PluginWrapper
import java.net.URI
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

class BangumiPlugin(wrapper: PluginWrapper) : ConfigurableGameyfinPlugin(wrapper) {

    override val configMetadata: PluginConfigMetadata = listOf(
        ConfigMetadata(
            key = "userAgent",
            type = String::class.java,
            label = "User Agent",
            description = "自定义 User Agent（建议格式：AppName/Version）"
        ),
        ConfigMetadata(
            key = "apiBaseUrl",
            type = String::class.java,
            label = "API Base URL",
            description = "Bangumi API 地址"
        )
    )

    override fun start() {
        log.info("Bangumi plugin started")
    }

    override fun stop() {
        log.info("Bangumi plugin stopped")
    }

    @Suppress("Unused")
    @Extension(ordinal = 3)
    class BangumiMetadataProvider : GameMetadataProvider {

        companion object {
            private val log = org.slf4j.LoggerFactory.getLogger(BangumiMetadataProvider::class.java)
            
            private const val API_BASE_URL = "https://api.bgm.tv"
            private const val DEFAULT_USER_AGENT = "Gameyfin/2.2.1"

            // Bangumi API 限流：每秒1请求
            private val rateLimiter: RateLimiter = RateLimiter.of(
                "bangumi-api",
                RateLimiterConfig.custom()
                    .limitForPeriod(1)
                    .limitRefreshPeriod(Duration.ofSeconds(1))
                    .timeoutDuration(Duration.ofMinutes(5))
                    .build()
            )

            private val bulkhead: Bulkhead = Bulkhead.of(
                "bangumi-api",
                BulkheadConfig.custom()
                    .maxConcurrentCalls(2)
                    .maxWaitDuration(Duration.ofMinutes(5))
                    .build()
            )

            private val json = Json {
                ignoreUnknownKeys = true
                isLenient = true
            }

            private val httpClient: OkHttpClient
                get() = createHttpClient()

            private fun createHttpClient(): OkHttpClient {
                val builder = OkHttpClient.Builder()
                    .connectTimeout(Duration.ofSeconds(30))
                    .readTimeout(Duration.ofSeconds(30))

                // Configure proxy from system properties
                val proxyHost = System.getProperty("http.proxyHost")
                val proxyPort = System.getProperty("http.proxyPort")?.toIntOrNull()

                if (proxyHost != null && proxyPort != null) {
                    val proxy = java.net.Proxy(
                        java.net.Proxy.Type.HTTP,
                        java.net.InetSocketAddress(proxyHost, proxyPort)
                    )
                    builder.proxy(proxy)

                    // Add proxy authentication if credentials are provided
                    val proxyUser = System.getProperty("http.proxyUser")
                    val proxyPassword = System.getProperty("http.proxyPassword")
                    if (proxyUser != null && proxyPassword != null) {
                        builder.proxyAuthenticator { _, response ->
                            val credential = okhttp3.Credentials.basic(proxyUser, proxyPassword)
                            response.request.newBuilder()
                                .header("Proxy-Authorization", credential)
                                .build()
                        }
                    }
                }

                return builder.build()
            }
        }

        override val supportedPlatforms: Set<Platform> = setOf(
            Platform.PC_MICROSOFT_WINDOWS,
            Platform.PLAYSTATION_5,
            Platform.PLAYSTATION_4,
            Platform.PLAYSTATION_3,
            Platform.PLAYSTATION_2,
            Platform.PLAYSTATION,
            Platform.PLAYSTATION_VITA,
            Platform.PLAYSTATION_PORTABLE,
            Platform.XBOX_SERIES_X_S,
            Platform.XBOX_ONE,
            Platform.XBOX_360,
            Platform.XBOX,
            Platform.NINTENDO_SWITCH,
            Platform.WII_U,
            Platform.WII,
            Platform.NINTENDO_GAMECUBE,
            Platform.NINTENDO_64,
            Platform.NINTENDO_3DS,
            Platform.NINTENDO_DS,
            Platform.GAME_BOY_ADVANCE,
            Platform.GAME_BOY,
            Platform.ANDROID,
            Platform.IOS,
            Platform.MAC,
            Platform.LINUX
        )

        override fun fetchByTitle(
            gameTitle: String,
            platformFilter: Set<Platform>,
            maxResults: Int
        ): List<GameMetadata> {
            return Decorators.ofSupplier<List<GameMetadata>> {
                searchInternal(gameTitle, maxResults)
            }
                .withRateLimiter(rateLimiter)
                .withBulkhead(bulkhead)
                .get()
        }

        override fun fetchById(id: String): GameMetadata? {
            return Decorators.ofSupplier<GameMetadata?> {
                fetchByIdInternal(id)
            }
                .withRateLimiter(rateLimiter)
                .withBulkhead(bulkhead)
                .get()
        }

        private fun searchInternal(title: String, maxResults: Int): List<GameMetadata> {
            try {
                // 使用 POST 请求搜索游戏 (type=4 表示游戏)
                val searchBody = """
                    {
                        "keyword": "${title.replace("\"", "\\\"")}",
                        "filter": {
                            "type": [4]
                        }
                    }
                """.trimIndent()

                val mediaType = "application/json; charset=utf-8".toMediaType()
                val requestBody = searchBody.toRequestBody(mediaType)
                
                val request = Request.Builder()
                    .url("$API_BASE_URL/v0/search/subjects?limit=${maxResults * 2}")
                    .header("User-Agent", DEFAULT_USER_AGENT)
                    .header("Accept", "application/json")
                    .post(requestBody)
                    .build()

                httpClient.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        log.warn("Bangumi search failed: HTTP ${response.code} - ${response.message}")
                        return emptyList()
                    }

                    val body = response.body?.string() ?: return emptyList()
                    val searchResponse = json.decodeFromString<BangumiSearchResponse>(body)

                    // 使用模糊匹配排序结果
                    val results = searchResponse.data?.mapNotNull { subject ->
                        val displayName = if (subject.nameCn.isNullOrBlank()) subject.name else subject.nameCn
                        val matchScore = FuzzySearch.tokenSetRatio(title.lowercase(), displayName.lowercase())
                        
                        // 获取详细信息并转换为 GameMetadata
                        try {
                            fetchByIdInternal(subject.id.toString())?.let { metadata ->
                                metadata to matchScore
                            }
                        } catch (e: Exception) {
                            log.warn("Failed to fetch details for subject ${subject.id}: ${e.message}")
                            null
                        }
                    }
                        ?.sortedByDescending { it.second }
                        ?.take(maxResults)
                        ?.map { it.first }
                        ?: emptyList()

                    return results
                }
            } catch (e: Exception) {
                log.error("Error searching Bangumi: ${e.message}", e)
                return emptyList()
            }
        }

        private fun fetchByIdInternal(id: String): GameMetadata? {
            try {
                val request = Request.Builder()
                    .url("$API_BASE_URL/v0/subjects/$id")
                    .header("User-Agent", DEFAULT_USER_AGENT)
                    .header("Accept", "application/json")
                    .get()
                    .build()

                httpClient.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        log.warn("Bangumi metadata fetch failed: HTTP ${response.code}")
                        return null
                    }

                    val body = response.body?.string() ?: return null
                    val subject = json.decodeFromString<BangumiSubject>(body)

                    return mapToGameMetadata(subject)
                }
            } catch (e: Exception) {
                log.error("Error fetching Bangumi metadata: ${e.message}", e)
                return null
            }
        }

        private fun mapToGameMetadata(subject: BangumiSubject): GameMetadata {
            // 解析发行日期
            val releaseInstant = subject.date?.let { dateStr ->
                try {
                    LocalDate.parse(dateStr).atStartOfDay(ZoneId.systemDefault()).toInstant()
                } catch (e: Exception) {
                    null
                }
            }

            // 解析用户评分 (Bangumi 评分是 0-10 分,我们转换为 0-100)
            val userRating = subject.rating?.score?.times(10)?.toInt()

            // 解析封面图
            val coverUrls = subject.images?.large?.let { setOf(URI.create(it)) }

            // 解析标签作为关键词
            val keywords = subject.tags?.map { it.name }?.toSet()

            // 尝试从平台字段推断平台
            val platforms = subject.platform?.let { parsePlatforms(it) } ?: setOf(Platform.PC_MICROSOFT_WINDOWS)

            return GameMetadata(
                originalId = subject.id.toString(),
                title = if (subject.nameCn.isNullOrBlank()) subject.name else subject.nameCn,
                platforms = platforms,
                description = subject.summary,
                coverUrls = coverUrls,
                headerUrls = null,
                release = releaseInstant,
                userRating = userRating,
                criticRating = null,
                developedBy = null,
                publishedBy = null,
                genres = null,
                themes = null,
                keywords = keywords,
                screenshotUrls = null,
                videoUrls = null,
                features = null,
                perspectives = null
            )
        }

        private fun parsePlatforms(platformStr: String): Set<Platform> {
            val platformLower = platformStr.lowercase()
            val detected = mutableSetOf<Platform>()

            // PC 平台
            if (platformLower.contains("pc") || platformLower.contains("windows") || 
                platformLower.contains("steam")) {
                detected.add(Platform.PC_MICROSOFT_WINDOWS)
            }

            // PlayStation 系列
            when {
                platformLower.contains("ps5") || platformLower.contains("playstation 5") -> 
                    detected.add(Platform.PLAYSTATION_5)
                platformLower.contains("ps4") || platformLower.contains("playstation 4") -> 
                    detected.add(Platform.PLAYSTATION_4)
                platformLower.contains("ps3") || platformLower.contains("playstation 3") -> 
                    detected.add(Platform.PLAYSTATION_3)
                platformLower.contains("ps2") || platformLower.contains("playstation 2") -> 
                    detected.add(Platform.PLAYSTATION_2)
                platformLower.contains("psp") -> 
                    detected.add(Platform.PLAYSTATION_PORTABLE)
                platformLower.contains("vita") || platformLower.contains("psv") -> 
                    detected.add(Platform.PLAYSTATION_VITA)
            }

            // Xbox 系列
            when {
                platformLower.contains("xbox series") || platformLower.contains("series x") || 
                platformLower.contains("series s") || platformLower.contains("xsx") -> 
                    detected.add(Platform.XBOX_SERIES_X_S)
                platformLower.contains("xbox one") -> 
                    detected.add(Platform.XBOX_ONE)
                platformLower.contains("xbox 360") -> 
                    detected.add(Platform.XBOX_360)
                platformLower.contains("xbox") -> 
                    detected.add(Platform.XBOX)
            }

            // Nintendo 系列
            when {
                platformLower.contains("switch") || platformLower.contains("ns") -> 
                    detected.add(Platform.NINTENDO_SWITCH)
                platformLower.contains("wii u") -> 
                    detected.add(Platform.WII_U)
                platformLower.contains("wii") && !platformLower.contains("wii u") -> 
                    detected.add(Platform.WII)
                platformLower.contains("3ds") -> 
                    detected.add(Platform.NINTENDO_3DS)
                platformLower.contains("nds") || platformLower.contains("nintendo ds") -> 
                    detected.add(Platform.NINTENDO_DS)
                platformLower.contains("gba") || platformLower.contains("game boy advance") -> 
                    detected.add(Platform.GAME_BOY_ADVANCE)
            }

            // 移动平台
            if (platformLower.contains("android")) detected.add(Platform.ANDROID)
            if (platformLower.contains("ios") || platformLower.contains("iphone") || 
                platformLower.contains("ipad")) detected.add(Platform.IOS)

            // Mac/Linux
            if (platformLower.contains("mac") || platformLower.contains("osx")) detected.add(Platform.MAC)
            if (platformLower.contains("linux")) detected.add(Platform.LINUX)

            return if (detected.isEmpty()) setOf(Platform.PC_MICROSOFT_WINDOWS) else detected
        }
    }
}

// Bangumi API v0 数据模型
@Serializable
data class BangumiSearchResponse(
    val total: Int? = null,
    val limit: Int? = null,
    val offset: Int? = null,
    val data: List<BangumiSearchResult>? = null
)

@Serializable
data class BangumiSearchResult(
    val id: Int,
    val name: String,
    @SerialName("name_cn") val nameCn: String? = null,
    val summary: String? = null,
    val images: BangumiImages? = null,
    val score: Double? = null
)

@Serializable
data class BangumiSubject(
    val id: Int,
    val type: Int,
    val name: String,
    @SerialName("name_cn") val nameCn: String? = null,
    val summary: String? = null,
    val date: String? = null,
    val platform: String? = null,
    val images: BangumiImages? = null,
    val rating: BangumiRating? = null,
    val tags: List<BangumiTag>? = null
)

@Serializable
data class BangumiImages(
    val large: String? = null,
    val common: String? = null,
    val medium: String? = null,
    val small: String? = null,
    val grid: String? = null
)

@Serializable
data class BangumiRating(
    val rank: Int? = null,
    val total: Int? = null,
    val score: Double? = null
)

@Serializable
data class BangumiTag(
    val name: String,
    val count: Int? = null
)
