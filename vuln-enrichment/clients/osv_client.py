import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

try:
    import requests
except ImportError:
    requests = None


def get_vulnerabilities(purl):
    """
    Query OSV using a Package URL (PURL)

    Example:
    pkg:npm/lodash@4.17.20
    pkg:pypi/django@4.2
    """

    url = "https://api.osv.dev/v1/query"

    payload = {
        "package": {
            "purl": purl
        }
    }

    try:
        if requests:
            response = requests.post(url, json=payload, timeout=10)

            if response.status_code != 200:
                print(f"OSV Error: {response.status_code}")
                return []

            data = response.json()
        else:
            request = Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urlopen(request, timeout=10) as response:
                data = json.loads(response.read().decode("utf-8"))

        vulnerabilities = data.get("vulns", [])

        results = []

        for vuln in vulnerabilities:

            aliases = vuln.get("aliases", [])

            severity = "UNKNOWN"
            cvss_score = None

            # Extract severity if present
            severity_info = vuln.get("severity", [])

            if severity_info:
                severity = severity_info[0].get("type", "UNKNOWN")

            results.append({
                "id": vuln.get("id"),
                "aliases": aliases,
                "summary": vuln.get("summary", "No summary available"),
                "severity": severity,
                "cvss_score": cvss_score,
                "published": vuln.get("published"),
                "modified": vuln.get("modified")
            })

        return results

    except (HTTPError, URLError, TimeoutError) as e:
        print(f"OSV Request Error: {e}")
        return []

    except Exception as e:
        print(f"OSV Exception: {e}")
        return []
