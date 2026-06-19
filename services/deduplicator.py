def deduplicate_vulnerabilities(vulnerabilities):

    seen = set()

    unique_vulnerabilities = []

    for vuln in vulnerabilities:

        cve_id = vuln.get("cve_id")

        # if no CVE, keep it
        if not cve_id:
            unique_vulnerabilities.append(vuln)
            continue

        # skip duplicates
        if cve_id in seen:
            continue

        seen.add(cve_id)

        unique_vulnerabilities.append(vuln)

    return unique_vulnerabilities