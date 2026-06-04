export const dashboardData = {

    1: {
        security: {
            score: 82,
            format: "CycloneDX 1.6",
            generatedAt: "2026-05-24"
        },

        vulnerabilities: {
            critical: [
                {
                    id: "CVE-2025-1234",
                    component: "log4j",
                    version: "2.14.1",
                    status: "new",
                    description: "Remote code execution vulnerability in Log4j when processing attacker-controlled data.",
                    fixedInVersion: "2.17.1"
                },
                {
                    id: "CVE-2025-5678",
                    component: "jackson-databind",
                    version: "2.9.8",
                    status: "unfixed",
                    description: "Deserialization vulnerability in Jackson Databind affecting unsafe polymorphic types.",
                    fixedInVersion: null
                },
                {
                    id: "CVE-2025-1111",
                    component: "commons-compress",
                    version: "1.20",
                    status: "new",
                    description: "Archive extraction vulnerability in Commons Compress that can be triggered by malicious archives.",
                    fixedInVersion: "1.21"
                }
            ],

            high: [
                {
                    id: "CVE-2025-2222",
                    component: "commons-io",
                    version: "2.8.0",
                    status: "new",
                    description: "Path traversal vulnerability in Commons IO file handling.",
                    fixedInVersion: "2.8.1"
                },
                {
                    id: "CVE-2025-2223",
                    component: "spring-core",
                    version: "5.3.15",
                    status: "unfixed",
                    description: "Remote request handling flaw in Spring Core that can lead to information disclosure.",
                    fixedInVersion: null
                }
            ],

            medium: [
                {
                    id: "CVE-2025-3333",
                    component: "guava",
                    version: "30.0",
                    status: "unfixed",
                    description: "Serialization flaw in Guava collection types allows crafted payload tampering.",
                    fixedInVersion: null
                }
            ],

            low: [
                {
                    id: "CVE-2025-4444",
                    component: "slf4j",
                    version: "1.7.25",
                    status: "new",
                    description: "Information leak in SLF4J formatting when handling invalid inputs.",
                    fixedInVersion: "1.7.30"
                }
            ]
        }
    },

    2: {
        security: {
            score: 86,
            format: "CycloneDX 1.6",
            generatedAt: "2026-05-21"
        },

        vulnerabilities: {
            critical: [
                {
                    id: "CVE-2025-8888",
                    component: "log4j",
                    version: "2.15.0",
                    status: "unfixed",
                    description: "Critical remote code execution vulnerability in Log4j attack surface.",
                    fixedInVersion: null
                }
            ],

            high: [
                {
                    id: "CVE-2025-8889",
                    component: "commons-io",
                    version: "2.7.0",
                    status: "new",
                    description: "Directory traversal issue in Commons IO file utilities.",
                    fixedInVersion: "2.8.0"
                }
            ],

            medium: [
                {
                    id: "CVE-2025-8890",
                    component: "guava",
                    version: "29.0",
                    status: "new",
                    description: "Guava has a moderate validation bug affecting cached data paths.",
                    fixedInVersion: "29.1"
                }
            ],

            low: []
        }
    },

    3: {
        security: {
            score: 90,
            format: "SPDX 3.0",
            generatedAt: "2026-05-19"
        },

        vulnerabilities: {
            critical: [],
            high: [
                {
                    id: "CVE-2025-9001",
                    component: "tomcat",
                    version: "9.0.65",
                    status: "unfixed",
                    description: "Tomcat deserialization issue in connector parsing logic.",
                    fixedInVersion: null
                }
            ],
            medium: [],
            low: []
        }
    },

    4: {
        security: {
            score: 94,
            format: "CycloneDX 1.6",
            generatedAt: "2026-05-17"
        },

        vulnerabilities: {
            critical: [],
            high: [],
            medium: [],
            low: []
        }
    },

    5: {
        security: {
            score: 72,
            format: "CycloneDX 1.6",
            generatedAt: "2026-05-27"
        },

        vulnerabilities: {
            critical: [
                {
                    id: "CVE-2025-7001",
                    component: "openssl",
                    version: "1.1.1",
                    status: "new",
                    description: "Legacy OpenSSL vulnerability in certificate parsing affecting secure connections.",
                    fixedInVersion: "1.1.1m"
                }
            ],

            high: [
                {
                    id: "CVE-2025-7002",
                    component: "nginx",
                    version: "1.20",
                    status: "new",
                    description: "Nginx buffer overflow vulnerability in request header parsing.",
                    fixedInVersion: "1.20.2"
                }
            ],

            medium: [
                {
                    id: "CVE-2025-7003",
                    component: "express",
                    version: "4.17.1",
                    status: "unfixed",
                    description: "Express vulnerability in middleware routing parsing that may allow malformed requests.",
                    fixedInVersion: null
                }
            ],

            low: [
                {
                    id: "CVE-2025-7004",
                    component: "lodash",
                    version: "4.17.20",
                    status: "new",
                    description: "Lodash prototype pollution issue in deep merge utilities.",
                    fixedInVersion: "4.17.21"
                }
            ]
        }
    }

};