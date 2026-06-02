# ============================================================
# test_builder.py — Run this to check everything works
# Run from terminal: python tests/test_builder.py
# ============================================================

import sys
import os
import json

# This line lets Python find sbom_builder.py from inside the tests folder
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sbom_builder import (
    build_cyclonedx_sbom,
    build_spdx_sbom,
    validate_ntia_compliance
)

# ── Fake data simulating what Member 1 will give us ──────────
FAKE_COMPONENTS = [
    {
        "name": "django",
        "version": "4.2.1",
        "ecosystem": "pypi",
        "supplier": "Django Software Foundation",
        "license": "BSD-3-Clause",
        "deps": [1, 2]
    },
    {
        "name": "sqlparse",
        "version": "0.4.4",
        "ecosystem": "pypi",
        "supplier": "NOASSERTION",
        "license": "BSD-2-Clause",
        "deps": []
    },
    {
        "name": "asgiref",
        "version": "3.7.2",
        "ecosystem": "pypi",
        "supplier": "Django Software Foundation",
        "license": "BSD-3-Clause",
        "deps": []
    }
]

passed = 0
failed = 0

def test(name, condition, detail=""):
    global passed, failed
    if condition:
        print(f"  PASS — {name}")
        passed += 1
    else:
        print(f"  FAIL — {name}" + (f": {detail}" if detail else ""))
        failed += 1

print("\n── CycloneDX Tests ─────────────────────────────")

result = build_cyclonedx_sbom("test-project", FAKE_COMPONENTS)
test("Builds without crashing", result is not None)

parsed = json.loads(result)
test("Output is valid JSON", True)
test("bomFormat is CycloneDX", parsed.get("bomFormat") == "CycloneDX")
test("specVersion is 1.6", parsed.get("specVersion") == "1.6")
test("metadata.timestamp exists", bool(parsed.get("metadata", {}).get("timestamp")))
test("metadata.authors exists", bool(parsed.get("metadata", {}).get("authors")))
test("components list exists", isinstance(parsed.get("components"), list))
test("dependencies list exists", isinstance(parsed.get("dependencies"), list))
test("correct number of components", len(parsed["components"]) == 3)

for comp in parsed["components"]:
    test(f"  '{comp['name']}' has purl", bool(comp.get("purl")))
    test(f"  '{comp['name']}' has version", bool(comp.get("version")))
    test(f"  '{comp['name']}' has supplier", bool(comp.get("supplier")))

print("\n── NTIA Compliance Tests ───────────────────────")

ok, violations = validate_ntia_compliance(result)
test("All 7 NTIA elements present", ok, violations)

print("\n── SPDX Tests ──────────────────────────────────")

spdx_result = build_spdx_sbom("test-project", FAKE_COMPONENTS)
spdx_parsed = json.loads(spdx_result)
test("SPDX builds without crashing", spdx_result is not None)
test("spdxVersion is SPDX-2.3", spdx_parsed.get("spdxVersion") == "SPDX-2.3")
test("packages list exists", isinstance(spdx_parsed.get("packages"), list))
test("relationships list exists", isinstance(spdx_parsed.get("relationships"), list))
test("has PURL in externalRefs",
     any("purl" in ref.get("referenceType", "")
         for pkg in spdx_parsed["packages"]
         for ref in pkg.get("externalRefs", [])))

print(f"\n{'─'*50}")
print(f"Results: {passed} passed, {failed} failed")
if failed == 0:
    print("ALL TESTS PASSED")
else:
    print("SOME TESTS FAILED — check the output above")
print(f"{'─'*50}\n")