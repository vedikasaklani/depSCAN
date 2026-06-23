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

    # Return cached result if already fetched
    if cve_id in cache:
        return cache[cve_id]

    headers = {
        "apiKey": NVD_API_KEY
    }

    params = {
        "cveId": cve_id
    }

    retries = 1

    for attempt in range(retries):

        try:

            # Small delay to avoid hammering NVD
            time.sleep(0.5)

            response = requests.get(
                BASE_URL,
                headers=headers,
                params=params,
                timeout=5
            )

            # Success
            if response.status_code == 200:

                data = response.json()

                vulnerabilities = data.get(
                    "vulnerabilities",
                    []
                )

                if not vulnerabilities:
                    return None

                cve_data = vulnerabilities[0]["cve"]

                severity = "UNKNOWN"
                cvss_score = None
                description = ""

                # English description
                descriptions = cve_data.get(
                    "descriptions",
                    []
                )

                for desc in descriptions:

                    if desc.get("lang") == "en":

                        description = desc.get(
                            "value",
                            ""
                        )

                        break

                metrics = cve_data.get(
                    "metrics",
                    {}
                )

                # CVSS v3.1
                if "cvssMetricV31" in metrics:

                    metric = metrics[
                        "cvssMetricV31"
                    ][0]

                    severity = metric[
                        "cvssData"
                    ]["baseSeverity"]

                    cvss_score = metric[
                        "cvssData"
                    ]["baseScore"]

                # CVSS v3.0
                elif "cvssMetricV30" in metrics:

                    metric = metrics[
                        "cvssMetricV30"
                    ][0]

                    severity = metric[
                        "cvssData"
                    ]["baseSeverity"]

                    cvss_score = metric[
                        "cvssData"
                    ]["baseScore"]

                # CVSS v2
                elif "cvssMetricV2" in metrics:

                    metric = metrics[
                        "cvssMetricV2"
                    ][0]

                    severity = metric.get(
                        "baseSeverity",
                        "UNKNOWN"
                    )

                    cvss_score = metric[
                        "cvssData"
                    ]["baseScore"]

                result = {
                    "cve_id": cve_id,
                    "severity": severity,
                    "cvss_score": cvss_score,
                    "description": description
                }

                # Save to cache
                cache[cve_id] = result

                return result

            # Retry on rate limit / temporary failure
            elif response.status_code in [429, 503]:

                print(
                    f"NVD temporary error "
                    f"{response.status_code} "
                    f"for {cve_id} "
                    f"(attempt {attempt + 1})"
                )

                time.sleep(0.5)

            else:

                print(
                    f"NVD Error "
                    f"{response.status_code}: "
                    f"{cve_id}"
                )

                return None

        except requests.exceptions.Timeout:

            print(
                f"NVD Timeout for {cve_id} "
                f"(attempt {attempt + 1})"
            )

            time.sleep(0.5)

        except requests.exceptions.RequestException as e:

            print(
                f"NVD Request Exception "
                f"for {cve_id}: {e}"
            )

            time.sleep(0.5)

    return None