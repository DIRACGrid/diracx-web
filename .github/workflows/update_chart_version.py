#!/usr/bin/env python3
"""Update diracx-charts with a new diracx-web version.

Bumps the chart version and updates the web image tag in values.yaml.
Does NOT modify appVersion (that tracks the diracx server version).
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


def bump_version(current_version: str) -> str:
    """Bump a version: increment alpha number if present, otherwise patch."""
    match = re.match(
        r"^(\d+\.\d+\.\d+)-alpha\.(\d+)$", current_version
    )
    if match:
        base, alpha = match.group(1), int(match.group(2))
        return f"{base}-alpha.{alpha + 1}"

    match = re.match(r"^(\d+)\.(\d+)\.(\d+)$", current_version)
    if match:
        major, minor, patch = match.groups()
        return f"{major}.{minor}.{int(patch) + 1}"

    raise ValueError(f"Invalid version format: {current_version}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Update diracx-charts for a new diracx-web release"
    )
    parser.add_argument(
        "--charts-dir",
        type=Path,
        required=True,
        help="Path to the diracx-charts repository",
    )
    parser.add_argument(
        "--web-version",
        required=True,
        help="New diracx-web version (e.g., v0.1.0)",
    )
    args = parser.parse_args()

    chart_yaml = args.charts_dir / "diracx" / "Chart.yaml"
    values_yaml = args.charts_dir / "diracx" / "values.yaml"

    for path in (chart_yaml, values_yaml):
        if not path.exists():
            print(f"Error: {path} not found")
            sys.exit(1)

    # Read and bump chart version
    chart_content = chart_yaml.read_text()
    version_match = re.search(r'^version:\s*"?([^"\n]+)"?', chart_content, re.MULTILINE)
    if not version_match:
        print("Error: could not find version in Chart.yaml")
        sys.exit(1)

    current_chart_version = version_match.group(1)
    new_chart_version = bump_version(current_chart_version)

    chart_content = re.sub(
        r'^version:\s*.*$',
        f'version: "{new_chart_version}"',
        chart_content,
        flags=re.MULTILINE,
    )
    chart_yaml.write_text(chart_content)
    print(f"Chart version: {current_chart_version} -> {new_chart_version}")

    # Update web image tag in values.yaml
    values_content = values_yaml.read_text()
    values_content = re.sub(
        r'(^    web:\s*\n      tag:\s*).*$',
        rf'\g<1>{args.web_version}',
        values_content,
        flags=re.MULTILINE,
    )
    values_yaml.write_text(values_content)
    print(f"Web image tag: {args.web_version}")


if __name__ == "__main__":
    main()
