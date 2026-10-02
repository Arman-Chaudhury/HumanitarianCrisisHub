"""
Builds public/geo/outlines.json: one simplified outline per crisis, drawn on
the globe when that crisis is selected.

Sources are Natural Earth (public domain):
  ne_50m_admin_0_countries.geojson
  ne_50m_admin_0_breakaway_disputed_areas.geojson
  ne_10m_admin_1_states_provinces.geojson
from https://github.com/nvkelso/natural-earth-vector/tree/master/geojson

Usage:  python3 scripts/build-outlines.py <dir containing the three files>
Needs:  pip install shapely

Natural Earth draws de facto control. Where the crisis is about a place
rather than who controls it, the shapes below are unioned so the outline
follows the commonly used boundary (Ukraine includes Crimea, Somalia
includes Somaliland). Crises spread across a loose area with no agreed
boundary get a circle instead, flagged `approximate` so the globe draws it
dashed.
"""

import json
import math
import sys
from pathlib import Path

from shapely.geometry import shape, Point, mapping
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")

COUNTRIES = json.load(open(SRC / "ne_50m_admin_0_countries.geojson"))
DISPUTED = json.load(open(SRC / "ne_50m_admin_0_breakaway_disputed_areas.geojson"))
ADMIN1 = json.load(open(SRC / "ne_10m_admin_1_states_provinces.geojson"))


def country(code):
    for f in COUNTRIES["features"]:
        if f["properties"]["ADM0_A3"] == code:
            return shape(f["geometry"])
    raise KeyError(code)


def disputed(name):
    for f in DISPUTED["features"]:
        if f["properties"]["BRK_NAME"] == name:
            return shape(f["geometry"])
    raise KeyError(name)


def province(adm0, *names):
    found = [
        shape(f["geometry"])
        for f in ADMIN1["features"]
        if f["properties"]["adm0_a3"] == adm0 and f["properties"]["name"] in names
    ]
    assert len(found) == len(names), (adm0, names, len(found))
    return unary_union(found)


def circle(lat, lng, km):
    """Geodesic circle as a lat/lng polygon."""
    r = km / 6371.0
    lat, lng = math.radians(lat), math.radians(lng)
    pts = []
    for i in range(96):
        b = 2 * math.pi * i / 96
        plat = math.asin(math.sin(lat) * math.cos(r) + math.cos(lat) * math.sin(r) * math.cos(b))
        plng = lng + math.atan2(
            math.sin(b) * math.sin(r) * math.cos(lat),
            math.cos(r) - math.sin(lat) * math.sin(plat),
        )
        pts.append((math.degrees(plng), math.degrees(plat)))
    return pts


# slug -> shapely geometry, or ("circle", lat, lng, km)
SHAPES = {
    # Whole countries
    "afghanistan": country("AFG"),
    "bangladesh-climate": country("BGD"),
    "belarus": country("BLR"),
    "burkina-faso": country("BFA"),
    "cameroon": country("CMR"),
    "central-african-republic": country("CAF"),
    "chad": country("TCD"),
    "colombia": country("COL"),
    "congo": country("COD"),
    "eritrea": country("ERI"),
    "ethiopia": country("ETH"),
    "haiti": country("HTI"),
    "iran": country("IRN"),
    "iraq": country("IRQ"),
    "lebanon": country("LBN"),
    "libya": country("LBY"),
    "madagascar": country("MDG"),
    "mali": country("MLI"),
    "mozambique": country("MOZ"),
    "myanmar": country("MMR"),
    "niger": country("NER"),
    "nigeria": country("NGA"),
    "north-korea": country("PRK"),
    "pakistan-floods": country("PAK"),
    "palestine": country("PSX"),
    "russia": country("RUS"),
    "saudi-arabia": country("SAU"),
    "south-sudan": country("SDS"),
    "sudan": country("SDN"),
    "syria": country("SYR"),
    "turkmenistan": country("TKM"),
    "venezuela": country("VEN"),
    "yemen": country("YEM"),
    "aboriginal-australians": country("AUS"),
    "somalia": unary_union([country("SOM"), country("SOL")]),
    "ukraine": unary_union([country("UKR"), disputed("Crimea")]),
    "sahrawi-refugees": country("SAH"),
    # Groups of countries
    "sahel": unary_union([country(c) for c in ("BFA", "MLI", "NER", "TCD")]),
    "horn-of-africa-drought": unary_union(
        [country(c) for c in ("SOM", "SOL", "ETH", "KEN")]
    ),
    "san-bushmen": unary_union([country("BWA"), country("NAM")]),
    # Provinces and regions
    "tibet": province("CHN", "Xizang", "Qinghai"),
    "uyghurs": province("CHN", "Xinjiang"),
    "kashmir": province("IND", "Jammu and Kashmir", "Ladakh"),
    "west-papua": province("IDN", "Papua", "Papua Barat"),
    "balochistan": province("PAK", "Baluchistan"),
    "adivasi-india": province("IND", "Jharkhand", "Odisha", "Chhattisgarh"),
    "rohingya": province("BGD", "Chittagong"),
    "tamils-sri-lanka": province(
        "LKA",
        "Yāpanaya", "Kilinŏchchi", "Mannārama", "Mulativ", "Vavuniyāva",
        "Trikuṇāmalaya", "Maḍakalapuva", "Ampāra",
    ),
    "nagorno-karabakh": disputed("Artsakh"),
    # No agreed boundary: a circle around the area, drawn dashed
    "lake-chad": ("circle", 13.3, 14.3, 320),
    "pacific-islands": ("circle", -4.0, 172.0, 1500),
    "amazon-indigenous": ("circle", -4.0, -63.0, 1100),
}

# Looser simplification for big shapes keeps the file small; the globe is
# never close enough to show the difference.
def tolerance(geom):
    minx, miny, maxx, maxy = geom.bounds
    span = max(maxx - minx, maxy - miny)
    return 0.015 if span < 8 else 0.03 if span < 25 else 0.06


def angular_distance(a, b):
    (lng1, lat1), (lng2, lat2) = a, b
    lat1, lat2 = math.radians(lat1), math.radians(lat2)
    d = math.radians(lng2 - lng1)
    return math.degrees(
        math.acos(
            max(-1, min(1, math.sin(lat1) * math.sin(lat2) + math.cos(lat1) * math.cos(lat2) * math.cos(d)))
        )
    )


out = {}
for slug, spec in SHAPES.items():
    crisis = json.load(open(ROOT / "src/data/crises" / f"{slug}.json"))
    marker = (crisis["coordinates"]["lng"], crisis["coordinates"]["lat"])
    approximate = isinstance(spec, tuple)
    if approximate:
        rings = [circle(*spec[1:])]
    else:
        geom = spec.simplify(tolerance(spec), preserve_topology=True)
        polys = list(geom.geoms) if geom.geom_type == "MultiPolygon" else [geom]
        # Drop specks (tiny islands) that would only add clutter.
        polys = [p for p in polys if p.area > 0.02] or polys
        rings = [list(p.exterior.coords) for p in polys]
    rings = [[[round(x, 2), round(y, 2)] for x, y in r] for r in rings]
    extent = max(angular_distance(marker, pt) for r in rings for pt in r)
    out[slug] = {"rings": rings, "extent": round(extent, 1)}
    if approximate:
        out[slug]["approximate"] = True

missing = sorted(
    p.stem for p in (ROOT / "src/data/crises").glob("*.json") if p.stem not in out
)
assert not missing, f"crises without outline: {missing}"

dest = ROOT / "public/geo/outlines.json"
dest.parent.mkdir(exist_ok=True)
dest.write_text(json.dumps(out, separators=(",", ":"), ensure_ascii=False))
points = sum(len(r) for o in out.values() for r in o["rings"])
print(f"{len(out)} outlines, {points} points, {dest.stat().st_size // 1024} KB")
