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
import okhttp3.OkHttpClient
import okhttp3.Request
import org.gameyfin.pluginapi.core.config.ConfigMetadata
import org.gameyfin.pluginapi.core.config.PluginConfigMetadata
import org.gameyfin.pluginapi.core.wrapper.ConfigurableGameyfinPlugin
import org.gameyfin.pluginapi.gamemetadata.*
import org.pf4j.Extension
import org.pf4j.PluginWrapper
import java.time.Duration
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class BangumiPlugin(wrapper: PluginWrapper) : ConfigurableGameyfinPlugin(wrapper) {

    override val configMetadata: PluginConfigMetadata = listOf(
        ConfigMetadata(
            key = "userAgent",
            type = String::class.java,
            label = "User Agent",
            description = "自定义 User Agent（建议格式：AppName/Version）",
            defaultValue = "Gameyfin/2.2.1"
        ),
        ConfigMetadata(
            key = "apiBaseUrl",
            type = String::class.java,
            label = "API Base URL",
            description = "Bangumi API 地址",
            defaultValue = "https://api.bgm.tv"
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
            private const val API_BASE_URL = "https://api.bgm.tv"
            private const val DEFAULT_USER_AGENT = "Gameyfin/2.2.1"

            // Bangumi API 限流：每分钟最多 60 请求
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

            private val httpClient = OkHttpClient.Builder()
                .connectTimeout(Duration.ofSeconds(30))
                .readTimeout(Duration.ofSeconds(30))
                .build()
        }

        override val supportedPlatforms: Set<Platform>
            get() = setOf(
                Platform.PC,
                Platform.PLAYSTATION,
                Platform.PLAYSTATION_2,
                Platform.PLAYSTATION_3,
                Platform.PLAYSTATION_4,
                Platform.PLAYSTATION_5,
                Platform.PLAYSTATION_VITA,
                Platform.PSP,
                Platform.XBOX,
                Platform.XBOX_360,
                Platform.XBOX_ONE,
                Platform.XBOX_SERIES,
                Platform.NINTENDO_SWITCH,
                Platform.WII,
                Platform.WII_U,
                Platform.NINTENDO_3DS,
                Platform.NINTENDO_DS,
                Platform.GAME_BOY,
                Platform.GAME_BOY_ADVANCE,
                Platform.ANDROID,
                Platform.IOS
            )

        override fun fetchByTitle(
            gameTitle: String,
            platformFilter: Set<Platform>,
            maxResults: Int
        ): List<GameMetadata> {
            try {
                // 搜索游戏
                val searchResults = searchGames(gameTitle, maxResults * 2)

                if (searchResults.isEmpty()) return emptyList()

                // 使用模糊匹配找到最佳匹配
                val bestMatches = FuzzySearch.extractTop(
                    gameTitle,
                    searchResults.map { it.name },
                    maxResults
                )

                val bestMatchIds = searchResults
                    .filter { game -> bestMatches.any { it.string == game.name } }
                    .map { it.id }

                // 获取详细信息
                return bestMatchIds.mapNotNull { id ->
                    try {
                        fetchById(id.toString())
                    } catch (e: Exception) {
                        null
                    }
                }.take(maxResults)

            } catch (e: Exception) {
                log.error("Error fetching games from Bangumi: ${e.message}", e)
                return emptyList()
            }
        }

        override fun fetchById(id: String): GameMetadata? {
            return try {
                val subject = getSubjectById(id.toInt())
                subject?.let { mapToGameMetadata(it) }
            } catch (e: Exception) {
                log.error("Error fetching game by id from Bangumi: ${e.message}", e)
                null
            }
        }

        private fun searchGames(keyword: String, limit: Int = 10): List<BangumiSearchResult> {
            val url = "$API_BASE_URL/v0/search/subjects?type=4&keyword=${
                java.net.URLEncoder.encode(keyword, "UTF-8")
            }&limit=$limit"

            return executeRequest(url) { response ->
                val body = response.body?.string() ?: return@executeRequest emptyList()
                val searchResponse = json.decodeFromString<BangumiSearchResponse>(body)
                searchResponse.data ?: emptyList()
            } ?: emptyList()
        }

        private fun getSubjectById(id: Int): BangumiSubject? {
            val url = "$API_BASE_URL/v0/subjects/$id"

            return executeRequest(url) { response ->
                val body = response.body?.string() ?: return@executeRequest null
                json.decodeFromString<BangumiSubject>(body)
            }
        }

        private fun <T> executeRequest(url: String, handler: (okhttp3.Response) -> T): T? {
            return try {
                Decorators.ofSupplier {
                    val request = Request.Builder()
                        .url(url)
                        .header("User-Agent", DEFAULT_USER_AGENT)
                        .header("Accept", "application/json")
                        .build()

                    httpClient.newCall(request).execute()
                }
                    .withRateLimiter(rateLimiter)
                    .withBulkhead(bulkhead)
                    .get()
                    .use { response ->
                        if (response.isSuccessful) {
                            handler(response)
                        } else {
                            log.warn("Bangumi API request failed: ${response.code} ${response.message}")
                            null
                        }
                    }
            } catch (e: Exception) {
                log.error("Error executing Bangumi API request: ${e.message}", e)
                null
            }
        }

        private fun mapToGameMetadata(subject: BangumiSubject): GameMetadata {
            val platforms = mutableSetOf<Platform>()
            
            // 尝试从标签或平台信息推断平台
            subject.tags?.forEach { tag ->
                when {
                    tag.name.contains("PC", ignoreCase = true) -> platforms.add(Platform.PC)
                    tag.name.contains("PS5", ignoreCase = true) -> platforms.add(Platform.PLAYSTATION_5)
                    tag.name.contains("PS4", ignoreCase = true) -> platforms.add(Platform.PLAYSTATION_4)
                    tag.name.contains("PS3", ignoreCase = true) -> platforms.add(Platform.PLAYSTATION_3)
                    tag.name.contains("PS2", ignoreCase = true) -> platforms.add(Platform.PLAYSTATION_2)
                    tag.name.contains("Switch", ignoreCase = true) -> platforms.add(Platform.NINTENDO_SWITCH)
                    tag.name.contains("Xbox", ignoreCase = true) -> platforms.add(Platform.XBOX)
                    tag.name.contains("iOS", ignoreCase = true) -> platforms.add(Platform.IOS)
                    tag.name.contains("Android", ignoreCase = true) -> platforms.add(Platform.ANDROID)
                }
            }

            // 如果没有找到平台，默认为 PC
            if (platforms.isEmpty()) {
                platforms.add(Platform.PC)
            }

            return GameMetadata(
                id = subject.id.toString(),
                title = subject.name,
                description = subject.summary,
                releaseDate = parseDate(subject.date),
                platforms = platforms,
                rating = subject.rating?.score?.toDouble()?.div(10.0), // Bangumi 评分是 10 分制
                coverImageUrl = subject.images?.large,
                screenshotUrls = emptyList(), // Bangumi 没有直接的截图 API
                videoUrls = emptyList(),
                genres = subject.tags?.map { Genre(it.name, it.name) } ?: emptyList(),
                keywords = emptyList(),
                themes = emptyList(),
                gameModes = emptyList(),
                perspectives = emptyList(),
                companies = emptyList(),
                artworkUrls = emptyList(),
                involvedCompanies = emptyList(),
                providerMetadata = mapOf(
                    "bangumiId" to subject.id.toString(),
                    "bangumiUrl" to "https://bgm.tv/subject/${subject.id}",
                    "rank" to (subject.rating?.rank?.toString() ?: ""),
                    "ratingCount" to (subject.rating?.total?.toString() ?: "")
                )
            )
        }

        private fun parseDate(dateString: String?): LocalDate? {
            if (dateString.isNullOrBlank()) return null
            return try {
                LocalDate.parse(dateString, DateTimeFormatter.ISO_DATE)
            } catch (e: Exception) {
                null
            }
        }
    }
}

// Bangumi API 数据模型
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
    val name: String,
    @SerialName("name_cn") val nameCn: String? = null,
    val summary: String? = null,
    val date: String? = null,
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
