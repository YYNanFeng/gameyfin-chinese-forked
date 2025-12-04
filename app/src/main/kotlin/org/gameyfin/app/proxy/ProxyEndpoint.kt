package org.gameyfin.app.proxy

import com.vaadin.hilla.Endpoint
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.annotation.security.RolesAllowed
import org.gameyfin.app.core.Role
import org.gameyfin.app.proxy.dto.ProxyConfigDto
import org.gameyfin.app.proxy.dto.ProxyTestResult

@Endpoint
@RolesAllowed(Role.Names.ADMIN)
class ProxyEndpoint(
    private val proxyService: ProxyService
) {
    companion object {
        val log = KotlinLogging.logger { }
    }

    fun getConfig(): ProxyConfigDto {
        return proxyService.getConfig()
    }

    fun saveConfig(config: ProxyConfigDto): ProxyConfigDto {
        log.info { "Saving proxy config: enabled=${config.enabled}, host=${config.host}:${config.port}" }
        return proxyService.saveConfig(config)
    }

    fun testConnection(config: ProxyConfigDto): ProxyTestResult {
        log.info { "Testing proxy connection from endpoint" }
        return proxyService.testConnection(config)
    }
}
