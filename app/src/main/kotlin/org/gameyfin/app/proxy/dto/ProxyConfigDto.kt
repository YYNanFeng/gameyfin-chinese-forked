package org.gameyfin.app.proxy.dto

import org.gameyfin.app.proxy.entities.ProxyType

data class ProxyConfigDto(
    val id: Long = 0,
    val enabled: Boolean = false,
    val type: ProxyType = ProxyType.HTTP,
    val host: String = "",
    val port: Int = 0,
    val username: String? = null,
    val password: String? = null
)

data class ProxyTestResult(
    val success: Boolean,
    val message: String,
    val responseTime: Long? = null
)
