from sbom_builder import build_and_output_sbom

components = [
    {
        "name": "django",
        "version": "4.2.1",
        "ecosystem": "pypi",
        "supplier": "Django Software Foundation",
        "license": "BSD-3-Clause",
        "deps": [1]
    },
    {
        "name": "sqlparse",
        "version": "0.4.4",
        "ecosystem": "pypi",
        "supplier": "NOASSERTION",
        "license": "BSD-2-Clause",
        "deps": []
    }
]

# Generate CycloneDX
build_and_output_sbom(
    project_name="my-demo-project",
    components_data=components,
    format="cyclonedx",
    mode="file",
    output_path="sbom.cdx.json"
)

# Generate SPDX
build_and_output_sbom(
    project_name="my-demo-project",
    components_data=components,
    format="spdx",
    mode="file",
    output_path="sbom.spdx.json"
)