import json
import sys
from pathlib import Path

import click
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from sbomgen.detector import detect_ecosystems
from sbomgen.parsers import parse_all
from sbomgen.stack_detector import detect_stack

console = Console()


@click.group()
def app():
    """sbomgen — SBOM CLI Scanner.

    Scans a project folder, detects ecosystems, parses dependencies,
    and outputs a JSON file for the SBOM builder (Member 2).
    """
    pass


@app.command("scan")
@click.argument("project_path", type=click.Path(exists=False))
@click.option("--output", "-o", default="parsed_components.json",
              help="Output JSON file path. Default: parsed_components.json")
@click.option("--upload", is_flag=True, default=False,
              help="[PLACEHOLDER] Upload results to the SBOM backend API.")
@click.option("--api-key", default=None,
              help="[PLACEHOLDER] API key for backend upload.")
@click.option("--project", default=None,
              help="[PLACEHOLDER] Project name tag for backend.")
@click.option("--fail-on", default=None,
              help="[PLACEHOLDER] Fail if this severity found (e.g. CRITICAL).")
def scan(project_path, output, upload, api_key, project, fail_on):
    """Scan PROJECT_PATH for dependencies and generate a components JSON file."""

    folder = Path(project_path).resolve()
    if not folder.exists() or not folder.is_dir():
        console.print(f"[bold red]Error:[/] Folder not found: {folder}")
        sys.exit(1)

    console.print(Panel(
        f"[bold]sbomgen[/] — SBOM CLI Scanner\nScanning: [cyan]{folder}[/]",
        expand=False,
    ))

    console.print("\n[bold yellow]Step 1:[/] Detecting ecosystems...")
    ecosystems = detect_ecosystems(folder)

    if not ecosystems:
        console.print("[red]No supported dependency files found. Exiting.[/]")
        sys.exit(1)

    console.print(f"  Found ecosystems: [green]{', '.join(ecosystems)}[/]")

    console.print("\n[bold yellow]Step 2:[/] Parsing dependency files...")
    components = parse_all(folder, ecosystems)
    console.print(f"  Extracted [green]{len(components)}[/] components.")

    console.print("\n[bold yellow]Step 3:[/] Detecting stack (frontend/backend/database)...")
    stack = detect_stack(folder, components)
    console.print(f"  Frontend : [cyan]{stack.get('frontend', 'Unknown')}[/]")
    console.print(f"  Backend  : [cyan]{stack.get('backend', 'Unknown')}[/]")
    console.print(f"  Database : [cyan]{stack.get('database', 'Unknown')}[/]")

    project_name = project or folder.name

    result = {
        "project_name": project_name,
        "detected_ecosystems": ecosystems,
        "frontend": stack.get("frontend", "Unknown"),
        "backend": stack.get("backend", "Unknown"),
        "database": stack.get("database", "Unknown"),
        "component_count": len(components),
        "components": components,
    }

    output_path = Path(output)
    output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    console.print(f"\n[bold green]✓ Output written to:[/] {output_path.resolve()}")

    _print_summary_table(components)

    if upload:
        console.print("\n[yellow]--upload flag detected.[/] (Placeholder) Skipping — backend not yet connected.")
        if not api_key:
            console.print("[yellow]  Tip:[/] Also provide --api-key when the backend is ready.")

    if fail_on:
        console.print(
            f"\n[yellow]--fail-on {fail_on} detected.[/] "
            "(Placeholder) Vulnerability checking is handled by another member."
        )

    console.print("\n[bold green]Done![/] Pass parsed_components.json to Member 2 for SBOM generation.\n")


def _print_summary_table(components: list):
    table = Table(title="Detected Components (first 10 shown)", show_lines=True)
    table.add_column("Name", style="cyan", no_wrap=True)
    table.add_column("Version", style="green")
    table.add_column("Ecosystem", style="yellow")
    table.add_column("License")
    table.add_column("PURL", style="dim", overflow="fold")

    for comp in components[:10]:
        table.add_row(
            comp.get("name", ""),
            comp.get("version", ""),
            comp.get("ecosystem", ""),
            comp.get("license", "NOASSERTION"),
            comp.get("purl", ""),
        )

    console.print(table)
    if len(components) > 10:
        console.print(
            f"  [dim]... and {len(components) - 10} more components. "
            "See the output JSON for the full list.[/]"
        )


def main():
    app()


if __name__ == "__main__":
    main()
