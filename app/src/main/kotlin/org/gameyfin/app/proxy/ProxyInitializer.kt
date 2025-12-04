package org.gameyfin.app.proxy

import io.github.oshai.kotlinlogging.KotlinLogging
import org.gameyfin.app.proxy.persistence.ProxyConfigRepository
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

/**
 * Initialize proxy configuration on application startup
 */
@Component
class ProxyInitializer(
    private val proxyConfigRepository: ProxyConfigRepository
) {
    companion object {
        private val log = KotlinLogging.logger {}
    }

    @EventListener(ApplicationReadyEvent::class)
    fun initializeProxy() {
        val config = proxyConfigRepository.findFirstByOrderByIdDesc()
        
        if (config != null && config.enabled) {
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
            
            log.info { "Proxy initialized on startup: ${config.host}:${config.port}" }
        } else {
            log.info { "No proxy configuration found or proxy is disabled" }
        }
    }
}
