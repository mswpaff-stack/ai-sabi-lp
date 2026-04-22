#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import os
from html import escape
from pathlib import Path
from textwrap import dedent
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
SITE_ROOT = REPO_ROOT / "site"
DEFAULT_CONFIG = SITE_ROOT / "industry-data" / "construction.json"
BASE_TEMPLATE = SITE_ROOT / "templates" / "industry_lp_base.html"


def e(value: Any) -> str:
    return escape(str(value), quote=True)


def body_text(value: str) -> str:
    return e(" ".join(value.split()))


def anchor_attrs(href: str, *, target: str | None = None, rel: str | None = None) -> str:
    attrs = [f'href="{e(href)}"']
    if target:
        attrs.append(f'target="{e(target)}"')
    if rel:
        attrs.append(f'rel="{e(rel)}"')
    elif target == "_blank":
        attrs.append('rel="noopener noreferrer"')
    return " ".join(attrs)


def html_lines(lines: list[str], use_spans: bool = False) -> str:
    escaped_lines = [body_text(line) for line in lines]
    if use_spans:
        return "".join(f'<span class="heading-line">{line}</span>' for line in escaped_lines)
    return "<br>".join(escaped_lines)


def section_heading_html(
    label: str,
    heading_lines: list[str] | None = None,
    *,
    center: bool = False,
    wide: bool = False,
    compact: bool = False,
    invert: bool = False,
    use_spans: bool = False,
) -> str:
    classes = ["section-heading"]
    if center:
        classes.append("center")
    if wide:
        classes.append("heading-wide")
    if compact:
        classes.append("heading-compact")

    label_classes = ["section-label"]
    if invert:
        label_classes.append("invert")

    parts = [
        f'<div class="{" ".join(classes)}">',
        f'  <p class="{" ".join(label_classes)}">{body_text(label)}</p>',
    ]

    if heading_lines:
        parts.append(f"  <h2>{html_lines(heading_lines, use_spans=use_spans)}</h2>")

    parts.append("</div>")
    return "\n".join(parts)


def site_relative_prefix(output_path: Path) -> str:
    rel = os.path.relpath(SITE_ROOT, output_path.parent)
    rel_posix = Path(rel).as_posix()
    return "." if rel_posix == "." else rel_posix


def site_href(prefix: str, path: str) -> str:
    clean = path.lstrip("./")
    return f"./{clean}" if prefix == "." else f"{prefix}/{clean}"


def issue_icon_html(icon_name: str) -> str:
    icons = {
        "clock": dedent(
            """
            <svg viewBox="0 0 56 56" aria-hidden="true">
              <circle cx="28" cy="28" r="21"></circle>
              <path d="M28 17v13l8 5"></path>
            </svg>
            """
        ).strip(),
        "document-arrow": dedent(
            """
            <svg viewBox="0 0 56 56" aria-hidden="true">
              <rect x="11" y="10" width="24" height="34" rx="4"></rect>
              <path d="M18 18h10M18 24h12M18 30h8"></path>
              <path d="M36 17l9 8-9 8"></path>
            </svg>
            """
        ).strip(),
        "photo": dedent(
            """
            <svg viewBox="0 0 56 56" aria-hidden="true">
              <rect x="10" y="13" width="36" height="28" rx="5"></rect>
              <circle cx="20" cy="23" r="4"></circle>
              <path d="M15 34l7-7 6 5 6-8 5 10"></path>
            </svg>
            """
        ).strip(),
        "chat": dedent(
            """
            <svg viewBox="0 0 56 56" aria-hidden="true">
              <path d="M12 16h32a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H26l-10 7v-7h-4a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6Z"></path>
              <path d="M18 25h19M18 31h12"></path>
            </svg>
            """
        ).strip(),
    }
    if icon_name not in icons:
        raise ValueError(f"Unsupported issue icon: {icon_name}")
    return icons[icon_name]


def render_navigation(items: list[dict[str, Any]]) -> str:
    return "\n".join(
        f'        <a href="{e(item["href"])}">{body_text(item["label"])}</a>' for item in items
    )


def render_issue_section(section: dict[str, Any]) -> str:
    cards_html = []
    for card in section["cards"]:
        cards_html.append(
            dedent(
                f"""
                <article class="issue-card">
                  <div class="icon-badge">
                    {issue_icon_html(card["icon"])}
                  </div>
                  <h3>{body_text(card["title"])}</h3>
                  <p>{body_text(card["body"])}</p>
                </article>
                """
            ).strip()
        )

    return dedent(
        f"""
        <section class="section-card issue-section" id="{e(section["id"])}">
          {section_heading_html(section["label"], section["heading_lines"], center=True, wide=True, use_spans=True)}
          <div class="issue-grid">
            {"".join(cards_html)}
          </div>
        </section>
        """
    ).strip()


def render_steps_section(section: dict[str, Any]) -> str:
    cards_html = []
    for card in section["cards"]:
        cards_html.append(
            dedent(
                f"""
                <article class="orange-card">
                  <span>{body_text(card["index"])}</span>
                  <h3>{body_text(card["title"])}</h3>
                  <p>{body_text(card["body"])}</p>
                </article>
                """
            ).strip()
        )

    return dedent(
        f"""
        <section class="orange-section">
          {section_heading_html(section["label"], section["heading_lines"], center=True, wide=True, compact=True, invert=True, use_spans=True)}
          <div class="orange-grid">
            {"".join(cards_html)}
          </div>
        </section>
        """
    ).strip()


def render_service_section(section: dict[str, Any]) -> str:
    cards_html = []
    for card in section["cards"]:
        items_html = "".join(f"<li>{body_text(item)}</li>" for item in card["items"])
        cards_html.append(
            dedent(
                f"""
                <article class="service-card">
                  <h3>{body_text(card["title"])}</h3>
                  <ul>
                    {items_html}
                  </ul>
                </article>
                """
            ).strip()
        )

    return dedent(
        f"""
        <section class="section-card service-section">
          {section_heading_html(section["label"], section["heading_lines"], center=True, use_spans=True)}
          <div class="service-grid">
            {"".join(cards_html)}
          </div>
        </section>
        """
    ).strip()


def render_reason_section(section: dict[str, Any], prefix: str) -> str:
    blocks_html = []
    for card in section["cards"]:
        block_classes = ["reason-block"]
        image_classes = ["reason-image", "slant-left" if card["reverse"] else "slant-right"]
        if card["reverse"]:
            block_classes.append("reverse")

        title_html = f"<h3>{html_lines(card['title_lines'], use_spans=True)}</h3>"
        blocks_html.append(
            dedent(
                f"""
                <div class="{" ".join(block_classes)}">
                  <div class="reason-text">
                    <span class="reason-number">{body_text(card["number"])}</span>
                    <p class="reason-mini">{body_text(card["mini"])}</p>
                    {title_html}
                    <p>{body_text(card["body"])}</p>
                  </div>
                  <div class="{" ".join(image_classes)}">
                    <img src="{e(site_href(prefix, card["image"]))}" alt="{body_text(card["image_alt"])}">
                  </div>
                </div>
                """
            ).strip()
        )

    return dedent(
        f"""
        <section class="section-card reason-section" id="{e(section["id"])}">
          {section_heading_html(section["label"], section["heading_lines"], center=True, wide=True, use_spans=True)}
          {"".join(blocks_html)}
        </section>
        """
    ).strip()


def render_case_section(section: dict[str, Any], prefix: str) -> str:
    cards_html = []
    for card in section["cards"]:
        items_html = "".join(f"<li>{body_text(item)}</li>" for item in card["items"])
        cards_html.append(
            dedent(
                f"""
                <article class="case-card">
                  <img src="{e(site_href(prefix, card["image"]))}" alt="{body_text(card["image_alt"])}">
                  <div class="case-content">
                    <p class="case-label">{body_text(card["label"])}</p>
                    <h3>{body_text(card["title"])}</h3>
                    <ul>
                      {items_html}
                    </ul>
                  </div>
                </article>
                """
            ).strip()
        )

    return dedent(
        f"""
        <section class="section-card case-section" id="{e(section["id"])}">
          {section_heading_html(section["label"], section["heading_lines"], center=True, use_spans=True)}
          <div class="case-grid">
            {"".join(cards_html)}
          </div>
        </section>
        """
    ).strip()


def render_voice_section(section: dict[str, Any]) -> str:
    cards_html = []
    for card in section["cards"]:
        cards_html.append(
            dedent(
                f"""
                <article class="voice-card">
                  <div class="voice-icon">{body_text(card["icon"])}</div>
                  <h3>{body_text(card["title"])}</h3>
                  <p>{body_text(card["body"])}</p>
                </article>
                """
            ).strip()
        )

    return dedent(
        f"""
        <section class="section-card voice-section">
          {section_heading_html(section["label"], section["heading_lines"], center=True)}
          <div class="voice-grid">
            {"".join(cards_html)}
          </div>
        </section>
        """
    ).strip()


def render_compare_section(section: dict[str, Any]) -> str:
    header_cells = "".join(
        (
            '<th class="emphasis">AI-SABI</th>' if idx == 1 else f"<th>{body_text(label)}</th>"
        )
        for idx, label in enumerate(section["columns"])
    )

    row_html = []
    for row in section["rows"]:
        row_html.append(
            dedent(
                f"""
                <tr>
                  <th>{body_text(row["label"])}</th>
                  <td class="emphasis">{body_text(row["emphasis"])}</td>
                  <td>{body_text(row["generic"])}</td>
                  <td>{body_text(row["outsource"])}</td>
                </tr>
                """
            ).strip()
        )

    return dedent(
        f"""
        <section class="section-card compare-section">
          {section_heading_html(section["label"], section["heading_lines"], center=True, wide=True, compact=True, use_spans=True)}
          <div class="table-wrap">
            <table class="compare-table">
              <thead>
                <tr>
                  {header_cells}
                </tr>
              </thead>
              <tbody>
                {"".join(row_html)}
              </tbody>
            </table>
          </div>
        </section>
        """
    ).strip()


def render_plan_section(section: dict[str, Any], cta_label: str) -> str:
    cards_html = []
    for card in section["cards"]:
        card_class = "plan-card highlight" if card["highlight"] else "plan-card"
        items_html = "".join(f"<li>{body_text(item)}</li>" for item in card["items"])
        cards_html.append(
            dedent(
                f"""
                <article class="{card_class}">
                  <p class="plan-title">{body_text(card["title"])}</p>
                  <ul>
                    {items_html}
                  </ul>
                </article>
                """
            ).strip()
        )

    note_lines = section["note_lines"]
    if len(note_lines) != 2:
        raise ValueError("plans.note_lines must contain exactly two lines.")

    cta_attrs = anchor_attrs(
        section.get("cta_href", "#contact"),
        target=section.get("cta_target"),
        rel=section.get("cta_rel"),
    )

    return dedent(
        f"""
        <section class="section-card plan-section" id="{e(section["id"])}">
          {section_heading_html(section["label"], section["heading_lines"], center=True, use_spans=True)}
          <div class="plan-grid">
            {"".join(cards_html)}
          </div>
          <div class="plan-note">
            <p class="plan-note-emphasis">{body_text(note_lines[0])}<span class="plan-note-break">{body_text(note_lines[1])}</span></p>
            <a class="button button-primary" {cta_attrs}>{body_text(cta_label)}</a>
          </div>
        </section>
        """
    ).strip()


def render_flow_section(section: dict[str, Any]) -> str:
    cards_html = []
    for card in section["cards"]:
        cards_html.append(
            dedent(
                f"""
                <article class="flow-card">
                  <span>{body_text(card["step"])}</span>
                  <h3>{body_text(card["title"])}</h3>
                  <p>{body_text(card["body"])}</p>
                </article>
                """
            ).strip()
        )

    return dedent(
        f"""
        <section class="section-card flow-section">
          {section_heading_html(section["label"], section["heading_lines"], center=True)}
          <div class="flow-grid">
            {"".join(cards_html)}
          </div>
        </section>
        """
    ).strip()


def render_faq_section(section: dict[str, Any]) -> str:
    items_html = []
    for item in section["items"]:
        items_html.append(
            dedent(
                f"""
                <details>
                  <summary>{body_text(item["question"])}</summary>
                  <p>{body_text(item["answer"])}</p>
                </details>
                """
            ).strip()
        )

    return dedent(
        f"""
        <section class="section-card faq-section" id="{e(section["id"])}">
          {section_heading_html(section["label"], center=True)}
          <div class="faq-list">
            {"".join(items_html)}
          </div>
        </section>
        """
    ).strip()


def render_contact_section(section: dict[str, Any], cta_label: str) -> str:
    details_html = []
    for item in section["details"]:
        details_html.append(
            dedent(
                f"""
                <div>
                  <span>{body_text(item["label"])}</span>
                  <strong>{body_text(item["value"])}</strong>
                </div>
                """
            ).strip()
        )

    cta_attrs = anchor_attrs(
        section.get("cta_href", "#contact"),
        target=section.get("cta_target"),
        rel=section.get("cta_rel"),
    )

    return dedent(
        f"""
        <section class="section-card final-contact" id="{e(section["id"])}">
          <div class="final-contact-copy">
            <p class="section-label">{body_text(section["label"])}</p>
            <h2>{html_lines(section["heading_lines"], use_spans=True)}</h2>
            <p>{body_text(section["description"])}</p>
          </div>
          <div class="final-contact-card">
            {"".join(details_html)}
            <a class="button button-primary" {cta_attrs}>{body_text(cta_label)}</a>
          </div>
        </section>
        """
    ).strip()


def render_body(data: dict[str, Any], output_path: Path) -> str:
    prefix = site_relative_prefix(output_path)
    hero = data["hero"]
    hero_copy_classes = ["hero-stage-copy"]
    hero_headline_classes = ["hero-headline"]
    if len(hero["headline_lines"]) == 2:
        hero_copy_classes.append("hero-stage-copy--two-line")
        hero_headline_classes.append("hero-headline--two-line")
    cta = data["cta"]
    cta_href = cta.get("href", "#contact")
    cta_target = cta.get("target")
    cta_rel = cta.get("rel")
    cta_attrs = anchor_attrs(cta_href, target=cta_target, rel=cta_rel)

    plans = dict(data["plans"])
    plans.setdefault("cta_href", cta_href)
    if cta_target:
        plans.setdefault("cta_target", cta_target)
    if cta_rel:
        plans.setdefault("cta_rel", cta_rel)

    contact = dict(data["contact"])
    contact.setdefault("cta_href", cta_href)
    if cta_target:
        contact.setdefault("cta_target", cta_target)
    if cta_rel:
        contact.setdefault("cta_rel", cta_rel)

    body = dedent(
        f"""
        <!-- Generated by tools/build_industry_lp.py from {data["slug"]}.json. Edit source data/template instead of this file. -->
        <div class="site-shell">
          <header class="site-header">
            <a class="brand" href="#top">
              <span class="brand-mark">{body_text(data["brand"]["mark"])}</span>
              <span class="brand-sub">{body_text(data["brand"]["sub"])}</span>
            </a>
            <nav class="site-nav">
        {render_navigation(data["navigation"])}
            </nav>
            <a class="button button-primary header-button" {cta_attrs}>{body_text(cta["header"])}</a>
          </header>

          <main id="top">
            <section class="hero-stage">
              <img class="hero-stage-image" src="{e(site_href(prefix, hero["image"]))}" alt="{body_text(hero["image_alt"])}">
              <div class="hero-stage-overlay"></div>
              <div class="hero-stage-inner">
                <div class="{" ".join(hero_copy_classes)}">
                  <p class="hero-topline">{body_text(hero["topline"])}</p>
                  <h1 class="{" ".join(hero_headline_classes)}">{html_lines(hero["headline_lines"], use_spans=True)}</h1>
                  <p class="hero-subline">{body_text(hero["subline_prefix"])}<span class="hero-subline-nowrap">{body_text(hero["subline_nowrap"])}</span></p>
                  <p class="hero-description">{body_text(hero["description"])}</p>
                  <div class="hero-button-row">
                    <a class="button button-primary hero-primary-button" {cta_attrs}>{body_text(cta["hero"])}</a>
                  </div>
                  <div class="hero-proof-row">
                    {"".join(f"<span>{body_text(item)}</span>" for item in hero["proof_items"])}
                  </div>
                </div>
              </div>
            </section>

            {render_issue_section(data["issues"])}
            {render_steps_section(data["steps_section"])}
            {render_service_section(data["services"])}
            {render_reason_section(data["reasons"], prefix)}
            {render_case_section(data["cases"], prefix)}
            {render_voice_section(data["voice"])}
            {render_compare_section(data["compare"])}
            {render_plan_section(plans, cta["plan"])}
            {render_flow_section(data["flow"])}
            {render_faq_section(data["faq"])}
            {render_contact_section(contact, cta["contact"])}
          </main>

          <footer class="site-footer">
            <p>{body_text(data["footer"]["left"])}</p>
            <p>{body_text(data["footer"]["right"])}</p>
          </footer>
        </div>
        """
    ).strip()

    return body + "\n"


def render_document(data: dict[str, Any], output_path: Path) -> str:
    prefix = site_relative_prefix(output_path)
    body_class = f"page-{data['slug']}"
    template = BASE_TEMPLATE.read_text(encoding="utf-8")
    rendered = (
        template.replace("{{PAGE_TITLE}}", e(data["page"]["title"]))
        .replace("{{PAGE_DESCRIPTION}}", e(data["page"]["description"]))
        .replace("{{STYLE_HREF}}", e(site_href(prefix, "styles.css")))
        .replace("{{BODY_CLASS}}", e(body_class))
        .replace("{{BODY_HTML}}", render_body(data, output_path))
    )
    return rendered


def load_config(config_path: Path) -> dict[str, Any]:
    return json.loads(config_path.read_text(encoding="utf-8"))


def default_output_paths(slug: str) -> list[Path]:
    if slug == "construction":
        return [SITE_ROOT / "index.html", SITE_ROOT / "industries" / slug / "index.html"]
    return [SITE_ROOT / "industries" / slug / "index.html"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build an industry LP HTML file from shared template and industry JSON data."
    )
    parser.add_argument(
        "--config",
        default=str(DEFAULT_CONFIG),
        help="Path to the industry JSON config. Defaults to the construction config.",
    )
    parser.add_argument(
        "--output",
        action="append",
        help="Output HTML path. Can be specified multiple times. If omitted, sensible defaults are used.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    config_path = Path(args.config).expanduser().resolve()
    data = load_config(config_path)

    if args.output:
        output_paths = [Path(path).expanduser().resolve() for path in args.output]
    else:
        output_paths = default_output_paths(data["slug"])

    for output_path in output_paths:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        html_output = render_document(data, output_path)
        output_path.write_text(html_output, encoding="utf-8")
        print(output_path)


if __name__ == "__main__":
    main()
