package org.gameyfin.app.proxy.persistence

import org.gameyfin.app.proxy.entities.ProxyConfig
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ProxyConfigRepository : JpaRepository<ProxyConfig, Long> {
    fun findFirstByOrderByIdDesc(): ProxyConfig?
}
