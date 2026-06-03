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
                    status: "new"
                },
                {
                    id: "CVE-2025-5678",
                    component: "jackson-databind",
                    version: "2.9.8",
                    status: "unfixed"
                },
                {
                    id: "CVE-2025-1111",
                    component: "commons-compress",
                    version: "1.20",
                    status: "new"
                }
            ],

            high: [
                {
                    id: "CVE-2025-2222",
                    component: "commons-io",
                    version: "2.8.0",
                    status: "new"
                },
                {
                    id: "CVE-2025-2223",
                    component: "spring-core",
                    version: "5.3.15",
                    status: "unfixed"
                }
            ],

            medium: [
                {
                    id: "CVE-2025-3333",
                    component: "guava",
                    version: "30.0",
                    status: "unfixed"
                }
            ],

            low: [
                {
                    id: "CVE-2025-4444",
                    component: "slf4j",
                    version: "1.7.25",
                    status: "new"
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
                    status: "unfixed"
                }
            ],

            high: [
                {
                    id: "CVE-2025-8889",
                    component: "commons-io",
                    version: "2.7.0",
                    status: "new"
                }
            ],

            medium: [
                {
                    id: "CVE-2025-8890",
                    component: "guava",
                    version: "29.0",
                    status: "new"
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
                    status: "unfixed"
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
                    status: "new"
                }
            ],

            high: [
                {
                    id: "CVE-2025-7002",
                    component: "nginx",
                    version: "1.20",
                    status: "new"
                }
            ],

            medium: [
                {
                    id: "CVE-2025-7003",
                    component: "express",
                    version: "4.17.1",
                    status: "unfixed"
                }
            ],

            low: [
                {
                    id: "CVE-2025-7004",
                    component: "lodash",
                    version: "4.17.20",
                    status: "new"
                }
            ]
        }
    }

};