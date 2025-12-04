plugins {
    kotlin("jvm")
    kotlin("plugin.serialization")
}

dependencies {
    // Plugin API
    compileOnly(project(":plugin-api"))

    // Kotlin serialization for JSON parsing
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")

    // HTTP client
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

    // Resilience4j for rate limiting
    implementation("io.github.resilience4j:resilience4j-ratelimiter:2.2.0")
    implementation("io.github.resilience4j:resilience4j-bulkhead:2.2.0")

    // Fuzzy search for matching
    implementation("me.xdrop:fuzzywuzzy:1.4.0")
}
