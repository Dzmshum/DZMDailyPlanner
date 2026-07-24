# -*- coding: utf-8 -*-
"""Generate PlanBoard README SVG assets (UTF-8)."""
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "assets" / "readme"
OUT.mkdir(parents=True, exist_ok=True)


def t(*codes: int) -> str:
    return "".join(chr(c) for c in codes)


# Russian strings via codepoints so the source file stays ASCII-safe on any console.
S = {
    "hero_desc": t(
        0x041B, 0x043E, 0x043A, 0x0430, 0x043B, 0x044C, 0x043D, 0x044B, 0x0439, 0x20,
        0x043F, 0x043B, 0x0430, 0x043D, 0x0438, 0x0440, 0x043E, 0x0432, 0x0449, 0x0438, 0x043A,
        0x20, 0x0441, 0x20, 0x0434, 0x0435, 0x0434, 0x043B, 0x0430, 0x0439, 0x043D, 0x0430, 0x043C, 0x0438,
        0x2C, 0x20, 0x043F, 0x0440, 0x043E, 0x0435, 0x043A, 0x0442, 0x0430, 0x043C, 0x0438, 0x2C, 0x20,
        0x043A, 0x0430, 0x043B, 0x0435, 0x043D, 0x0434, 0x0430, 0x0440, 0x0451, 0x043C, 0x20, 0x0438, 0x20,
        0x0434, 0x0435, 0x0439, 0x043B, 0x0438, 0x043A, 0x0430, 0x043C, 0x0438, 0x2E, 0x20,
        0x0414, 0x0430, 0x043D, 0x043D, 0x044B, 0x0435, 0x20, 0x2014, 0x20, 0x043E, 0x0434, 0x0438, 0x043D,
        0x20, 0x004A, 0x0053, 0x004F, 0x004E, 0x20, 0x043D, 0x0430, 0x20, 0x0434, 0x0438, 0x0441, 0x043A, 0x0435, 0x2E,
    ),
    "line1": t(
        0x0414, 0x0435, 0x0434, 0x043B, 0x0430, 0x0439, 0x043D, 0x044B, 0x2C, 0x20,
        0x043F, 0x0440, 0x043E, 0x0435, 0x043A, 0x0442, 0x044B, 0x2C, 0x20,
        0x043A, 0x0430, 0x043B, 0x0435, 0x043D, 0x0434, 0x0430, 0x0440, 0x044C, 0x20, 0x0438, 0x20,
        0x0434, 0x0435, 0x0439, 0x043B, 0x0438, 0x043A, 0x0438,
    ),
    "line2": t(
        0x0432, 0x20, 0x043E, 0x0434, 0x043D, 0x043E, 0x043C, 0x20, 0x0444, 0x0430, 0x0439, 0x043B, 0x0435,
        0x20, 0x043D, 0x0430, 0x20, 0x0432, 0x0430, 0x0448, 0x0435, 0x043C, 0x20, 0x041F, 0x041A,
    ),
    "dashboard": t(0x0414, 0x0430, 0x0448, 0x0431, 0x043E, 0x0440, 0x0434),
    "today_prog": t(
        0x0441, 0x0435, 0x0433, 0x043E, 0x0434, 0x043D, 0x044F, 0x20, 0x2F, 0x20, 0x32, 0x20,
        0x0438, 0x0437, 0x20, 0x36,
    ),
    "close_report": t(
        0x0417, 0x0430, 0x043A, 0x0440, 0x044B, 0x0442, 0x044C, 0x20, 0x043E, 0x0442, 0x0447, 0x0451, 0x0442,
    ),
    "done": t(0x0433, 0x043E, 0x0442, 0x043E, 0x0432, 0x043E),
    "layout": t(
        0x0421, 0x0432, 0x0435, 0x0440, 0x0441, 0x0442, 0x0430, 0x0442, 0x044C, 0x20, 0x043C, 0x0430, 0x043A, 0x0435, 0x0442,
    ),
    "today": t(0x0441, 0x0435, 0x0433, 0x043E, 0x0434, 0x043D, 0x044F),
    "client": t(
        0x041E, 0x0442, 0x0432, 0x0435, 0x0442, 0x20, 0x043A, 0x043B, 0x0438, 0x0435, 0x043D, 0x0442, 0x0443,
    ),
    "overdue": t(0x043F, 0x0440, 0x043E, 0x0441, 0x0440, 0x043E, 0x0447, 0x2E),
    "mo": t(0x041F, 0x043D),
    "tu": t(0x0412, 0x0442),
    "we": t(0x0421, 0x0440),
    "th": t(0x0427, 0x0442),
    "fr": t(0x041F, 0x0442),
    "flow_title": t(
        0x041A, 0x0430, 0x043A, 0x20, 0x0443, 0x0441, 0x0442, 0x0440, 0x043E, 0x0435, 0x043D, 0x20, 0x0050, 0x006C, 0x0061, 0x006E, 0x0042, 0x006F, 0x0061, 0x0072, 0x0064,
    ),
    "flow_desc": t(
        0x0417, 0x0430, 0x0445, 0x0432, 0x0430, 0x0442, 0x20, 0x0437, 0x0430, 0x0434, 0x0430, 0x0447, 0x0438, 0x2C, 0x20,
        0x043F, 0x043B, 0x0430, 0x043D, 0x20, 0x043F, 0x043E, 0x20, 0x043A, 0x0430, 0x043B, 0x0435, 0x043D, 0x0434, 0x0430, 0x0440, 0x044E, 0x2C, 0x20,
        0x0434, 0x0435, 0x0439, 0x043B, 0x0438, 0x043A, 0x20, 0x0438, 0x20, 0x0432, 0x044B, 0x0433, 0x0440, 0x0443, 0x0437, 0x043A, 0x0430, 0x20,
        0x2014, 0x20, 0x0432, 0x0441, 0x0451, 0x20, 0x0432, 0x20, 0x0070, 0x006C, 0x0061, 0x006E, 0x002E, 0x006A, 0x0073, 0x006F, 0x006E, 0x2E,
    ),
    "from_to": t(
        0x041E, 0x0442, 0x20, 0x0437, 0x0430, 0x0445, 0x0432, 0x0430, 0x0442, 0x0430, 0x20, 0x0434, 0x043E, 0x20, 0x0432, 0x044B, 0x0433, 0x0440, 0x0443, 0x0437, 0x043A, 0x0438,
    ),
    "capture": t(0x0417, 0x0430, 0x0445, 0x0432, 0x0430, 0x0442),
    "capture_l1": "Q / " + t(0x0419) + " " + t(0x2192) + " " + t(0x0432, 0x0445, 0x043E, 0x0434, 0x044F, 0x0449, 0x0438, 0x0435),
    "capture_l2": t(0x0437, 0x0430, 0x0434, 0x0430, 0x0447, 0x0430, 0x20, 0x0438, 0x043B, 0x0438, 0x20, 0x0444, 0x043E, 0x0442, 0x043E),
    "plan": t(0x041F, 0x043B, 0x0430, 0x043D),
    "plan_l1": t(0x043A, 0x0430, 0x043B, 0x0435, 0x043D, 0x0434, 0x0430, 0x0440, 0x044C) + " + DnD",
    "plan_l2": t(0x0434, 0x0435, 0x0434, 0x043B, 0x0430, 0x0439, 0x043D, 0x20, 0x043D, 0x0430, 0x20, 0x0434, 0x0435, 0x043D, 0x044C),
    "daily": t(0x0414, 0x0435, 0x0439, 0x043B, 0x0438, 0x043A),
    "daily_l1": t(0x043E, 0x0442, 0x0447, 0x0451, 0x0442, 0x20, 0x043A, 0x20, 0x0441, 0x043E, 0x0437, 0x0432, 0x043E, 0x043D, 0x0443),
    "daily_l2": t(0x0434, 0x043D, 0x0438, 0x20, 0x0432, 0x20, 0x043D, 0x0430, 0x0441, 0x0442, 0x0440, 0x043E, 0x0439, 0x043A, 0x0430, 0x0445),
    "export": t(0x0412, 0x044B, 0x0433, 0x0440, 0x0443, 0x0437, 0x043A, 0x0430),
    "sec_start": t(0x0411, 0x044B, 0x0441, 0x0442, 0x0440, 0x044B, 0x0439, 0x20, 0x0441, 0x0442, 0x0430, 0x0440, 0x0442),
    "sec_feat": t(0x0412, 0x043E, 0x0437, 0x043C, 0x043E, 0x0436, 0x043D, 0x043E, 0x0441, 0x0442, 0x0438),
    "sec_build": t(0x0421, 0x0431, 0x043E, 0x0440, 0x043A, 0x0430, 0x20, 0x0438, 0x20, 0x0434, 0x0430, 0x043D, 0x043D, 0x044B, 0x0435),
}


def section(num: str, title: str, accent: str = "#6b8cff") -> str:
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="120" viewBox="0 0 1200 120" role="img" aria-labelledby="title desc">
  <title id="title">{title}</title>
  <desc id="desc">Section: {title}</desc>
  <rect width="1200" height="120" rx="20" fill="#0c0e14"/>
  <rect x="1" y="1" width="1198" height="118" rx="19" fill="none" stroke="#2a3140"/>
  <rect x="40" y="36" width="6" height="48" rx="3" fill="{accent}"/>
  <text x="66" y="52" fill="{accent}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="16" letter-spacing="2">{num}</text>
  <text x="66" y="92" fill="#e8eaed" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="36" font-weight="700">{title}</text>
</svg>
'''


hero = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="380" viewBox="0 0 1200 380" role="img" aria-labelledby="title desc">
  <title id="title">PlanBoard</title>
  <desc id="desc">{S["hero_desc"]}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0c0e14"/>
      <stop offset="55%" stop-color="#12161f"/>
      <stop offset="100%" stop-color="#0a0c12"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1d24"/>
      <stop offset="100%" stop-color="#14171e"/>
    </linearGradient>
    <linearGradient id="accentBar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6b8cff"/>
      <stop offset="100%" stop-color="#30cfea"/>
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="1200" height="380" rx="26" fill="url(#bg)"/>
  <rect x="1" y="1" width="1198" height="378" rx="25" fill="none" stroke="#2a3140" stroke-width="1"/>
  <g transform="translate(56 48)">
    <text x="0" y="22" fill="#6b8cff" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="18" letter-spacing="2">DESKTOP / LOCAL JSON</text>
    <text x="0" y="96" fill="#e8eaed" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="64" font-weight="700">PlanBoard</text>
    <text x="0" y="148" fill="#a8adb8" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="24">{S["line1"]}</text>
    <text x="0" y="182" fill="#a8adb8" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="24">{S["line2"]}</text>
    <rect x="0" y="220" width="280" height="4" rx="2" fill="url(#accentBar)"/>
    <g transform="translate(0 252)" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="18">
      <rect x="0" y="0" width="118" height="36" rx="8" fill="#1a1d24" stroke="#2a3140"/>
      <text x="16" y="24" fill="#9cb4c8">v0.29.1</text>
      <rect x="130" y="0" width="150" height="36" rx="8" fill="#1a1d24" stroke="#2a3140"/>
      <text x="146" y="24" fill="#9cb4c8">Electron</text>
      <rect x="292" y="0" width="120" height="36" rx="8" fill="#1a1d24" stroke="#2a3140"/>
      <text x="308" y="24" fill="#9cb4c8">RU UI</text>
    </g>
  </g>
  <g transform="translate(640 40)">
    <rect x="0" y="0" width="504" height="300" rx="18" fill="url(#panel)" stroke="#2a3140"/>
    <rect x="0" y="0" width="56" height="300" rx="18" fill="#101218"/>
    <rect x="38" y="0" width="18" height="300" fill="#101218"/>
    <g transform="translate(14 28)">
      <rect x="0" y="0" width="28" height="28" rx="6" fill="#6b8cff" opacity="0.9"/>
      <text x="8" y="20" fill="#0c0e14" font-family="Segoe UI, sans-serif" font-size="16" font-weight="700">1</text>
      <rect x="0" y="42" width="28" height="28" rx="6" fill="#22262f"/>
      <text x="8" y="62" fill="#a8adb8" font-family="Segoe UI, sans-serif" font-size="16">2</text>
      <rect x="0" y="84" width="28" height="28" rx="6" fill="#22262f"/>
      <text x="8" y="104" fill="#a8adb8" font-family="Segoe UI, sans-serif" font-size="16">3</text>
      <rect x="0" y="126" width="28" height="28" rx="6" fill="#22262f"/>
      <text x="8" y="146" fill="#a8adb8" font-family="Segoe UI, sans-serif" font-size="16">4</text>
      <rect x="0" y="168" width="28" height="28" rx="6" fill="#22262f"/>
      <text x="8" y="188" fill="#a8adb8" font-family="Segoe UI, sans-serif" font-size="16">5</text>
    </g>
    <text x="78" y="36" fill="#e8eaed" font-family="Segoe UI, sans-serif" font-size="20" font-weight="600">{S["dashboard"]}</text>
    <text x="78" y="62" fill="#6e7380" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="16">{S["today_prog"]}</text>
    <rect x="78" y="78" width="390" height="8" rx="4" fill="#22262f"/>
    <rect x="78" y="78" width="130" height="8" rx="4" fill="#6b8cff"/>
    <g transform="translate(78 110)" font-family="Segoe UI, sans-serif" font-size="18">
      <rect x="0" y="0" width="390" height="44" rx="10" fill="#121418" stroke="#2a3140"/>
      <circle cx="24" cy="22" r="10" fill="none" stroke="#58b888" stroke-width="2.5" filter="url(#softGlow)"/>
      <path d="M18 22 l4 4 l8 -9" fill="none" stroke="#58b888" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="46" y="28" fill="#6e7380">{S["close_report"]}</text>
      <text x="300" y="28" fill="#58b888" font-size="16">{S["done"]}</text>
      <rect x="0" y="56" width="390" height="44" rx="10" fill="#121418" stroke="#2a3140"/>
      <circle cx="24" cy="78" r="10" fill="none" stroke="#6b8cff" stroke-width="2.5"/>
      <text x="46" y="84" fill="#e8eaed">{S["layout"]}</text>
      <text x="300" y="84" fill="#d0a848" font-size="16">{S["today"]}</text>
      <rect x="0" y="112" width="390" height="44" rx="10" fill="#121418" stroke="#2a3140"/>
      <circle cx="24" cy="134" r="10" fill="none" stroke="#e07070" stroke-width="2.5"/>
      <text x="46" y="140" fill="#e8eaed">{S["client"]}</text>
      <text x="300" y="140" fill="#e07070" font-size="16">{S["overdue"]}</text>
    </g>
    <g transform="translate(78 258)" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="14">
      <rect x="0" y="0" width="40" height="28" rx="6" fill="#22262f"/>
      <text x="12" y="19" fill="#6e7380">{S["mo"]}</text>
      <rect x="48" y="0" width="40" height="28" rx="6" fill="#6b8cff"/>
      <text x="60" y="19" fill="#0c0e14" font-weight="700">{S["tu"]}</text>
      <rect x="96" y="0" width="40" height="28" rx="6" fill="#22262f"/>
      <text x="108" y="19" fill="#6e7380">{S["we"]}</text>
      <rect x="144" y="0" width="40" height="28" rx="6" fill="#22262f"/>
      <text x="156" y="19" fill="#6e7380">{S["th"]}</text>
      <rect x="192" y="0" width="40" height="28" rx="6" fill="#22262f"/>
      <text x="204" y="19" fill="#6e7380">{S["fr"]}</text>
    </g>
  </g>
</svg>
'''

workflow = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="280" viewBox="0 0 1200 280" role="img" aria-labelledby="title desc">
  <title id="title">{S["flow_title"]}</title>
  <desc id="desc">{S["flow_desc"]}</desc>
  <defs>
    <linearGradient id="wbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0c0e14"/>
      <stop offset="100%" stop-color="#12161f"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="280" rx="26" fill="url(#wbg)"/>
  <rect x="1" y="1" width="1198" height="278" rx="25" fill="none" stroke="#2a3140"/>
  <text x="56" y="52" fill="#6b8cff" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="18" letter-spacing="2">FLOW</text>
  <text x="56" y="92" fill="#e8eaed" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="32" font-weight="700">{S["from_to"]}</text>
  <g font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif">
    <rect x="56" y="128" width="240" height="110" rx="16" fill="#1a1d24" stroke="#2a3140"/>
    <circle cx="88" cy="164" r="16" fill="#6b8cff"/>
    <text x="82" y="170" fill="#0c0e14" font-size="18" font-weight="700">1</text>
    <text x="116" y="170" fill="#e8eaed" font-size="22" font-weight="600">{S["capture"]}</text>
    <text x="76" y="204" fill="#a8adb8" font-size="18">{S["capture_l1"]}</text>
    <text x="76" y="230" fill="#6e7380" font-size="16">{S["capture_l2"]}</text>
    <path d="M308 183 H336" stroke="#6b8cff" stroke-width="3" stroke-linecap="round"/>
    <path d="M328 173 L340 183 L328 193" fill="none" stroke="#6b8cff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="352" y="128" width="240" height="110" rx="16" fill="#1a1d24" stroke="#2a3140"/>
    <circle cx="384" cy="164" r="16" fill="#6b8cff"/>
    <text x="378" y="170" fill="#0c0e14" font-size="18" font-weight="700">2</text>
    <text x="412" y="170" fill="#e8eaed" font-size="22" font-weight="600">{S["plan"]}</text>
    <text x="372" y="204" fill="#a8adb8" font-size="18">{S["plan_l1"]}</text>
    <text x="372" y="230" fill="#6e7380" font-size="16">{S["plan_l2"]}</text>
    <path d="M604 183 H632" stroke="#6b8cff" stroke-width="3" stroke-linecap="round"/>
    <path d="M624 173 L636 183 L624 193" fill="none" stroke="#6b8cff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="648" y="128" width="240" height="110" rx="16" fill="#1a1d24" stroke="#2a3140"/>
    <circle cx="680" cy="164" r="16" fill="#6b8cff"/>
    <text x="674" y="170" fill="#0c0e14" font-size="18" font-weight="700">3</text>
    <text x="708" y="170" fill="#e8eaed" font-size="22" font-weight="600">{S["daily"]}</text>
    <text x="668" y="204" fill="#a8adb8" font-size="18">{S["daily_l1"]}</text>
    <text x="668" y="230" fill="#6e7380" font-size="16">{S["daily_l2"]}</text>
    <path d="M900 183 H928" stroke="#6b8cff" stroke-width="3" stroke-linecap="round"/>
    <path d="M920 173 L932 183 L920 193" fill="none" stroke="#6b8cff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="944" y="128" width="200" height="110" rx="16" fill="#1a1d24" stroke="#2a3140"/>
    <circle cx="976" cy="164" r="16" fill="#30cfea"/>
    <text x="970" y="170" fill="#0c0e14" font-size="18" font-weight="700">4</text>
    <text x="1004" y="170" fill="#e8eaed" font-size="22" font-weight="600">{S["export"]}</text>
    <text x="964" y="204" fill="#a8adb8" font-size="18">TG / Jira</text>
    <text x="964" y="230" fill="#6e7380" font-size="16">plan.json</text>
  </g>
</svg>
'''

(OUT / "hero.svg").write_text(hero, encoding="utf-8")
(OUT / "workflow.svg").write_text(workflow, encoding="utf-8")
(OUT / "section-start.svg").write_text(section("01", S["sec_start"]), encoding="utf-8")
(OUT / "section-features.svg").write_text(section("02", S["sec_feat"]), encoding="utf-8")
(OUT / "section-build.svg").write_text(section("03", S["sec_build"], "#30cfea"), encoding="utf-8")

# Local GitHub-width preview
preview = f'''<!DOCTYPE html>
<html lang="ru">
<meta charset="utf-8"/>
<title>PlanBoard README preview</title>
<style>
  body {{ margin: 0; background: #0d1117; color: #e6edf3; font: 16px/1.5 -apple-system,Segoe UI,sans-serif; }}
  .wrap {{ max-width: 900px; margin: 24px auto; padding: 0 16px; }}
  img {{ display: block; width: 100%; height: auto; margin: 16px 0; }}
  .narrow {{ max-width: 360px; margin: 24px auto; }}
  h2 {{ color: #8b949e; font-size: 14px; text-transform: uppercase; letter-spacing: .08em; }}
</style>
<body>
  <div class="wrap">
    <h2>Desktop ~900px</h2>
    <img src="hero.svg" alt="hero"/>
    <img src="workflow.svg" alt="workflow"/>
    <img src="section-start.svg" alt="start"/>
    <img src="section-features.svg" alt="features"/>
    <img src="section-build.svg" alt="build"/>
  </div>
  <div class="narrow">
    <h2>Mobile ~360px</h2>
    <img src="hero.svg" alt="hero narrow"/>
  </div>
</body>
</html>
'''
(OUT / "preview.html").write_text(preview, encoding="utf-8")
print("wrote", list(OUT.glob("*.svg")))
