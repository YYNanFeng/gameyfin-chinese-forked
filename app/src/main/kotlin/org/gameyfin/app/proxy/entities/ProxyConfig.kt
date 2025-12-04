package org.gameyfin.app.proxy.entities

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "proxy_config")
class ProxyConfig(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    var enabled: Boolean = false,

    @Column(nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    var type: ProxyType = ProxyType.HTTP,

    @Column(nullable = false, length = 255)
    var host: String = "",

    @Column(nullable = false)
    var port: Int = 0,

    @Column(length = 255)
    var username: String? = null,

    @Column(length = 255)
    var password: String? = null,

    @Column(nullable = false)
    var updatedAt: Instant = Instant.now()
)

enum class ProxyType {
    HTTP,
    HTTPS,
    SOCKS
}
