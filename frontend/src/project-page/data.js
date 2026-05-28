export const mockProjects = [
    { id: 1, name: "Alpha" },
    { id: 2, name: "Beta" },
    { id: 3, name: "Gamma" },
    { id: 4, name: "Delta" },
]

export const mockScans = [
    {
        id: 1,
        projectId:1,
        date: "May 24, 2026 10:30",
        components: 142,
        critical: 3,
        high: 7,
        medium: 12,
        low: 5,
        progress: "complete"
    },
    {
        id: 2,
        projectId:1,
        date: "May 21, 2026 09:00",
        components: 140,
        critical: 2,
        high: 7,
        medium: 11,
        low: 5,
        progress: "complete"
    },
    {
        id: 3,
        projectId:2,
        date: "May 19, 2026 14:22",
        components: 138,
        critical: 1,
        high: 5,
        medium: 10,
        low: 4,
        progress: "complete"
    },
    {
        id: 4,
        projectId:2,
        date: "May 17, 2026 11:15",
        components: 135,
        critical: 0,
        high: 4,
        medium: 8,
        low: 3,
        progress: "error"
    },
    {
        id: 5,
        projectId:3,
        date: "May 27, 2026 08:00",
        components: 145,
        critical: 4,
        high: 9,
        medium: 14,
        low: 6,
        progress: "in progress"
    },
]