import requests
import time
import os
from dotenv import load_dotenv

# Load environment variables from .env (if present)
load_dotenv()

# NVD API key is read from environment variable `NVD_API_KEY`
NVD_API_KEY = os.getenv("NVD_API_KEY")

# In-memory cache
cache = {}

BASE_URL = (
    "https://services.nvd.nist.gov/rest/json/cves/2.0"
)


def get_nvd_details(cve_id):
    """
    Fetches CVE details from NVD. Never raises — on any failure
    (timeout, rate limit, network error), returns None so the
    calling enrichment loop can continue to the next component.
    """

    if cve_id in cache:
        return cache[cve_id]

    headers = {}
    if NVD_API_KEY:
        headers["apiKey"] = NVD_API_KEY

    params = {"cveId": cve_id}

    retries = 2

    for attempt in range(retries):
        try:
            time.sleep(0.5)

            response = requests.get(
                BASE_URL,
                headers=headers,
                params=params,
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                vulnerabilities = data.get("vulnerabilities", [])

                if not vulnerabilities:
                    cache[cve_id] = None
                    return None

                cve_data = vulnerabilities[0]["cve"]

                severity = "UNKNOWN"
                cvss_score = None
                description = ""

                for desc in cve_data.get("descriptions", []):
                    if desc.get("lang") == "en":
                        description = desc.get("value", "")
                        break

                metrics = cve_data.get("metrics", {})

                if "cvssMetricV31" in metrics:
                    metric = metrics["cvssMetricV31"][0]
                    severity = metric["cvssData"]["baseSeverity"]
                    cvss_score = metric["cvssData"]["baseScore"]
                elif "cvssMetricV30" in metrics:
                    metric = metrics["cvssMetricV30"][0]
                    severity = metric["cvssData"]["baseSeverity"]
                    cvss_score = metric["cvssData"]["baseScore"]
                elif "cvssMetricV2" in metrics:
                    metric = metrics["cvssMetricV2"][0]
                    severity = metric.get("baseSeverity", "UNKNOWN")
                    cvss_score = metric["cvssData"]["baseScore"]

                result = {
                    "cve_id": cve_id,
                    "severity": severity,
                    "cvss_score": cvss_score,
                    "description": description
                }

                cache[cve_id] = result
                return result

            elif response.status_code in (429, 503):
                print(f"NVD temporary error {response.status_code} for {cve_id} (attempt {attempt + 1})")
                time.sleep(1.5)
                continue

            else:
                print(f"NVD error {response.status_code} for {cve_id} — skipping")
                cache[cve_id] = None
                return None

        except requests.exceptions.RequestException as e:
            # Catches Timeout, ConnectionError, ReadTimeout, etc — ALL network issues
            print(f"NVD request failed for {cve_id} (attempt {attempt + 1}): {e}")
            time.sleep(1.0)
            continue

    # All retries exhausted — skip this CVE, don't crash the scan
    print(f"NVD: giving up on {cve_id} after {retries} attempts, skipping")
    cache[cve_id] = None
    return None