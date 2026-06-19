class Vulnerability:
    def __init__(
        self,
        cve_id,
        severity,
        cvss_score,
        description
    ):
        self.cve_id = cve_id
        self.severity = severity
        self.cvss_score = cvss_score
        self.description = description