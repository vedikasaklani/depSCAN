def calculate_score(vulnerabilities):

    score = 100

    weights = {
        "CRITICAL": 25,
        "HIGH": 10,
        "MEDIUM": 5,
        "LOW": 1
    }

    for vuln in vulnerabilities:

        severity = vuln.get("severity", "UNKNOWN")

        score -= weights.get(severity, 0)

    return max(score, 0)