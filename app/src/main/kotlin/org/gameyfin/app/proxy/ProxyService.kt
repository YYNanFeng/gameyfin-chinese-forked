package org.gameyfin.app.proxy

import io.github.oshai.kotlinlogging.KotlinLogging
import okhttp3.Authenticator
import okhttp3.Credentials
import okhttp3.OkHttpClient
import okhttp3.Request
import org.gameyfin.app.proxy.dto.ProxyConfigDto
import org.gameyfin.app.proxy.dto.ProxyTestResult
import org.gameyfin.app.proxy.entities.ProxyConfig
import org.gameyfin.app.proxy.entities.ProxyType
import org.gameyfin.app.proxy.persistence.ProxyConfigRepository
import org.springframework.stereotype.Service
import java.net.InetSocketAddress
import java.net.Proxy
import java.time.Instant
import kotlin.time.measureTimedValue

@Service
class ProxyService(
    private val proxyConfigRepository: ProxyConfigRepository
) {
    companion object {
        private val log = KotlinLogging.logger {}
        private var cachedConfig: ProxyConfig? = null
    }

    fun getConfig(): ProxyConfigDto {
        val config = proxyConfigRepository.findFirstByOrderByIdDesc()
        return if (config != null) {
            ProxyConfigDto(
                id = config.id,
                enabled = config.enabled,
                type = config.type,
                host = config.host,
                port = config.port,
                username = config.username,
                password = config.password
            )
        } else {
            ProxyConfigDto()
        }
    }

    fun saveConfig(dto: ProxyConfigDto): ProxyConfigDto {
        val config = proxyConfigRepository.findFirstByOrderByIdDesc() ?: ProxyConfig()
        
        config.enabled = dto.enabled
        config.type = dto.type
        config.host = dto.host
        config.port = dto.port
        config.username = dto.username
        config.password = dto.password
        config.updatedAt = Instant.now()
        
        val saved = proxyConfigRepository.save(config)
        cachedConfig = saved
        
        // Update system properties for plugins
        updateSystemProperties(saved)
        
        log.info { "Proxy config updated: enabled=${saved.enabled}, host=${saved.host}:${saved.port}" }
        
        return ProxyConfigDto(
            id = saved.id,
            enabled = saved.enabled,
            type = saved.type,
            host = saved.host,
            port = saved.port,
            username = saved.username,
            password = saved.password
        )
    }

    private fun updateSystemProperties(config: ProxyConfig) {
        if (config.enabled) {
            System.setProperty("http.proxyHost", config.host)
            System.setProperty("http.proxyPort", config.port.toString())
            System.setProperty("https.proxyHost", config.host)
            System.setProperty("https.proxyPort", config.port.toString())
            
            if (!config.username.isNullOrBlank()) {
                System.setProperty("http.proxyUser", config.username)
                System.setProperty("https.proxyUser", config.username)
            }
            if (!config.password.isNullOrBlank()) {
                System.setProperty("http.proxyPassword", config.password)
                System.setProperty("https.proxyPassword", config.password)
            }
            
            log.info { "System proxy properties set" }
        } else {
            System.clearProperty("http.proxyHost")
            System.clearProperty("http.proxyPort")
            System.clearProperty("https.proxyHost")
            System.clearProperty("https.proxyPort")
            System.clearProperty("http.proxyUser")
            System.clearProperty("https.proxyUser")
            System.clearProperty("http.proxyPassword")
            System.clearProperty("https.proxyPassword")
            
            log.info { "System proxy properties cleared" }
        }
    }

    fun testConnection(dto: ProxyConfigDto): ProxyTestResult {
        log.info { "Testing proxy connection: ${dto.host}:${dto.port}" }
        
        return try {
            val proxy = when (dto.type) {
                ProxyType.HTTP, ProxyType.HTTPS -> Proxy(Proxy.Type.HTTP, InetSocketAddress(dto.host, dto.port))
                ProxyType.SOCKS -> Proxy(Proxy.Type.SOCKS, InetSocketAddress(dto.host, dto.port))
            }
            
            val clientBuilder = OkHttpClient.Builder()
                .proxy(proxy)
            
            // Add authentication if provided
            if (!dto.username.isNullOrBlank() && !dto.password.isNullOrBlank()) {
                clientBuilder.proxyAuthenticator(Authenticator { _, response ->
                    val credential = Credentials.basic(dto.username, dto.password)
                    response.request.newBuilder()
                        .header("Proxy-Authorization", credential)
                        .build()
                })
            }
            
            val client = clientBuilder.build()
            
            val request = Request.Builder()
                .url("https://www.google.com")
                .build()
            
            val (response, duration) = measureTimedValue {
                client.newCall(request).execute()
            }
            
            response.use {
                if (it.isSuccessful) {
                    log.info { "Proxy test successful in ${duration.inWholeMilliseconds}ms" }
                    ProxyTestResult(
                        success = true,
                        message = "连接成功",
                        responseTime = duration.inWholeMilliseconds
                    )
                } else {
                    log.warn { "Proxy test failed with status: ${it.code}" }
                    ProxyTestResult(
                        success = false,
                        message = "连接失败: HTTP ${it.code}"
                    )
                }
            }
        } catch (e: Exception) {
            log.error(e) { "Proxy test error: ${e.message}" }
            ProxyTestResult(
                success = false,
                message = "连接失败: ${e.message ?: "未知错误"}"
            )
        }
    }

    /**
     * Get current proxy configuration for use by plugins
     */
    fun getCurrentProxyConfig(): ProxyConfig? {
        if (cachedConfig == null) {
            cachedConfig = proxyConfigRepository.findFirstByOrderByIdDesc()
        }
        return cachedConfig?.takeIf { it.enabled }
    }

    /**
     * Create a Java Proxy object from current configuration
     */
    fun createJavaProxy(): Proxy? {
        val config = getCurrentProxyConfig() ?: return null
        return when (config.type) {
            ProxyType.HTTP, ProxyType.HTTPS -> Proxy(Proxy.Type.HTTP, InetSocketAddress(config.host, config.port))
            ProxyType.SOCKS -> Proxy(Proxy.Type.SOCKS, InetSocketAddress(config.host, config.port))
        }
    }

    /**
     * Create an OkHttp Authenticator for proxy authentication
     */
    fun createProxyAuthenticator(): Authenticator? {
        val config = getCurrentProxyConfig() ?: return null
        val username = config.username
        val password = config.password
        
        if (username.isNullOrBlank() || password.isNullOrBlank()) {
            return null
        }
        
        return Authenticator { _, response ->
            val credential = Credentials.basic(username, password)
            response.request.newBuilder()
                .header("Proxy-Authorization", credential)
                .build()
        }
    }
}
