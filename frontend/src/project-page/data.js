export const mockProjects = [
    { id: 1, name: "Alpha" },
    { id: 2, name: "Beta" },
    { id: 3, name: "Gamma" },
    { id: 4, name: "Delta" },
]

export const mockScans = [
    {
        id: 1,
        projectId: 1,
        date: "May 24, 2026 10:30",
        components: 142,
        critical: 3,
        high: 7,
        medium: 12,
        low: 5,
        progress: "Complete",
        ecosystems: [
            { ecosystem: "Python", critical: 2, high: 4, medium: 8, clean: 61 },
            { ecosystem: "Node", critical: 1, high: 3, medium: 4, clean: 32 },
            { ecosystem: "Java", critical: 0, high: 0, medium: 0, clean: 10 },
        ]
    },
    {
        id: 2,
        projectId: 1,
        date: "May 21, 2026 09:00",
        components: 140,
        critical: 2,
        high: 7,
        medium: 11,
        low: 5,
        progress: "Complete",
        ecosystems: [
            { ecosystem: "Python", critical: 1, high: 4, medium: 7, clean: 63 },
            { ecosystem: "Node", critical: 1, high: 3, medium: 4, clean: 31 },
            { ecosystem: "Java", critical: 0, high: 0, medium: 0, clean: 10 },
        ]
    },
    {
        id: 3,
        projectId: 2,
        date: "May 19, 2026 14:22",
        components: 138,
        critical: 1,
        high: 5,
        medium: 10,
        low: 4,
        progress: "Complete",
        ecosystems: [
            { ecosystem: "Python", critical: 1, high: 3, medium: 6, clean: 55 },
            { ecosystem: "Node", critical: 0, high: 2, medium: 4, clean: 40 },
            { ecosystem: "Java", critical: 0, high: 0, medium: 0, clean: 14 },
        ]
    },
    {
        id: 4,
        projectId: 2,
        date: "May 17, 2026 11:15",
        components: 135,
        critical: 0,
        high: 4,
        medium: 8,
        low: 3,
        progress: "Error",
        ecosystems: [
            { ecosystem: "Python", critical: 0, high: 2, medium: 5, clean: 58 },
            { ecosystem: "Node", critical: 0, high: 2, medium: 3, clean: 38 },
            { ecosystem: "Java", critical: 0, high: 0, medium: 0, clean: 14 },
        ]
    },
    {
        id: 5,
        projectId: 3,
        date: "May 27, 2026 08:00",
        components: 145,
        critical: 4,
        high: 9,
        medium: 14,
        low: 6,
        progress: "In Progress",
        ecosystems: [
            { ecosystem: "Python", critical: 2, high: 5, medium: 8, clean: 60 },
            { ecosystem: "Node", critical: 2, high: 4, medium: 6, clean: 33 },
            { ecosystem: "Java", critical: 0, high: 0, medium: 0, clean: 10 },
        ]
    },
]