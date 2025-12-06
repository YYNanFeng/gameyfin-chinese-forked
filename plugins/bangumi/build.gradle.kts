plugins {
    id("com.google.devtools.ksp")
    kotlin("jvm")
    kotlin("plugin.serialization")
}

dependencies {
    ksp("care.better.pf4j:pf4j-kotlin-symbol-processing:${rootProject.extra["pf4jKspVersion"]}")
    
    // Plugin API
    compileOnly(project(":plugin-api"))

    // Kotlin serialization for JSON parsing
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")

    // HTTP client
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

    // Resilience4j for rate limiting and fault tolerance
    implementation("io.github.resilience4j:resilience4j-ratelimiter:2.2.0")
    implementation("io.github.resilience4j:resilience4j-bulkhead:2.2.0")
    implementation("io.github.resilience4j:resilience4j-all:2.2.0")

    // Fuzzy search for matching
    implementation("me.xdrop:fuzzywuzzy:1.4.0")
}
