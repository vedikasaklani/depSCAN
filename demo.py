import json
from sbom_builder import build_and_output_sbom


def load_scanner_output(file_path="parsed_components.json"):
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def convert_scanner_components(scanner_components):
    components_data = []

    for comp in scanner_components:
        components_data.append({
            "name": comp.get("name"),
            "version": comp.get("version"),
            "ecosystem": comp.get("ecosystem"),
            "supplier": "NOASSERTION",
            "license": comp.get("license", "NOASSERTION"),
            "purl": comp.get("purl"),
            "hash": comp.get("hash"),
            "deps": []
        })

    return components_data


def main():
    scanner_output = load_scanner_output("parsed_components.json")

    project_name = scanner_output.get("project_name", "scanner-project")
    components = scanner_output.get("components", [])

    if not components:
        print("No components found in parsed_components.json")
        return

    components_data = convert_scanner_components(components)

    print(f"Loaded {len(components_data)} components from parsed_components.json")

    print("Building CycloneDX SBOM...")
    build_and_output_sbom(
        project_name=project_name,
        components_data=components_data,
        format="cyclonedx",
        mode="file",
        output_path="sbom.cdx.json"
    )

    print("Building SPDX SBOM...")
    build_and_output_sbom(
        project_name=project_name,
        components_data=components_data,
        format="spdx",
        mode="file",
        output_path="sbom.spdx.json"
    )

    print("Integration complete.")
    print("Generated sbom.cdx.json and sbom.spdx.json")


if __name__ == "__main__":
    main()
