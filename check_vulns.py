from collections import Counter
from database.mongo_client import vulns_collection


def main():
    vulns = list(vulns_collection.find())

    total = len(vulns)
    components = set()
    for v in vulns:
        name = v.get("component_name")
        ver = v.get("component_version")
        if name:
            components.add((name, ver))

    severity_counts = Counter((v.get("severity") or "UNKNOWN") for v in vulns)
    cve_counts = Counter(v.get("cve_id") for v in vulns if v.get("cve_id"))

    print(f"Total vulnerability documents: {total}")
    print(f"Unique components with stored vulns: {len(components)}")
    print("\nVulnerabilities by severity:")
    for sev, cnt in severity_counts.most_common():
        print(f"  {sev}: {cnt}")

    print("\nTop CVEs by occurrence:")
    for cve, cnt in cve_counts.most_common(10):
        print(f"  {cve}: {cnt}")


if __name__ == "__main__":
    main()
