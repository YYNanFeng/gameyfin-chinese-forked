package org.gameyfin.pluginapi.core.proxy

import java.net.InetSocketAddress
import java.net.Proxy

/**
 * Proxy configuration interface for plugins
 */
interface ProxyProvider {
    /**
     * Check if proxy is enabled
     */
    fun isProxyEnabled(): Boolean

    /**
     * Get Java Proxy object
     */
    fun getProxy(): Proxy?

    /**
     * Get proxy host
     */
    fun getProxyHost(): String?

    /**
     * Get proxy port
     */
    fun getProxyPort(): Int?

    /**
     * Get proxy username (if authentication required)
     */
    fun getProxyUsername(): String?

    /**
     * Get proxy password (if authentication required)
     */
    fun getProxyPassword(): String?
}

/**
 * Default implementation that reads from system properties
 */
class SystemPropertyProxyProvider : ProxyProvider {
    override fun isProxyEnabled(): Boolean {
        return System.getProperty("http.proxyHost") != null
    }

    override fun getProxy(): Proxy? {
        val host = getProxyHost() ?: return null
        val port = getProxyPort() ?: return null
        return Proxy(Proxy.Type.HTTP, InetSocketAddress(host, port))
    }

    override fun getProxyHost(): String? {
        return System.getProperty("http.proxyHost")
    }

    override fun getProxyPort(): Int? {
        return System.getProperty("http.proxyPort")?.toIntOrNull()
    }

    override fun getProxyUsername(): String? {
        return System.getProperty("http.proxyUser")
    }

    override fun getProxyPassword(): String? {
        return System.getProperty("http.proxyPassword")
    }
}
