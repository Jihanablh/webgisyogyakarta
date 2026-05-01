"""
Preprocessing Script v2: Yogyakarta Student WebGIS
- Spatial filtering: Only keep points WITHIN DIY boundary
- Sub-category tracking for accordion filters
"""

import json
import os

# --- Configuration ---
INPUT_FILE = "data/dataa_informasi.geojson"
GADM_FILE = "kota/gadm41_IDN_1.json"
OUTPUT_DIR = "data"

# Category definitions with sub-categories
CATEGORIES = {
    "kebutuhan": {
        "label": "Kebutuhan",
        "subcategories": {
            "Supermarket":   {"shop": ["supermarket"]},
            "Toko":          {"shop": ["convenience", "clothes", "bakery", "electronics",
                                       "hardware", "furniture", "gift", "mobile_phone",
                                       "kiosk", "copyshop", "computer", "beauty",
                                       "laundry", "ticket"]},
            "Pasar":         {"amenity": ["marketplace"]},
        }
    },
    "atm_bank": {
        "label": "ATM & Bank",
        "subcategories": {
            "ATM":  {"amenity": ["atm"]},
            "Bank": {"amenity": ["bank"]},
        }
    },
    "tempat_tinggal": {
        "label": "Tempat Tinggal",
        "subcategories": {
            "Hotel":       {"tourism": ["hotel"], "building": ["hotel"]},
            "Guest House": {"tourism": ["guest_house", "hostel"]},
            "Rumah/Kos":   {"building": ["house"]},
        }
    },
    "sosial_tugas": {
        "label": "Sosial & Tugas",
        "subcategories": {
            "Restoran":     {"amenity": ["restaurant"]},
            "Kafe":         {"amenity": ["cafe"]},
            "Fast Food":    {"amenity": ["fast_food"]},
            "Bar/Pub":      {"amenity": ["bar", "pub"]},
            "Perpustakaan": {"amenity": ["library"]},
        }
    },
    "akademik": {
        "label": "Pusat Akademik",
        "subcategories": {
            "Universitas": {"amenity": ["university"]},
            "Kolese":      {"amenity": ["college"]},
            "Sekolah":     {"amenity": ["school"]},
        }
    },
    "kesehatan_darurat": {
        "label": "Kesehatan & Darurat",
        "subcategories": {
            "Klinik":      {"amenity": ["clinic"], "healthcare": ["clinic"]},
            "Rumah Sakit":  {"amenity": ["hospital"], "healthcare": ["hospital"]},
            "Apotek":      {"amenity": ["pharmacy"], "healthcare": ["pharmacy"]},
            "Dokter":      {"amenity": ["doctors"], "healthcare": ["doctor"]},
            "Polisi":      {"amenity": ["police"]},
            "Pemadam":     {"amenity": ["fire_station"]},
        }
    },
    "mobilitas": {
        "label": "Mobilitas",
        "subcategories": {
            "Halte Bus":   {"public_transport": ["platform", "stop_position"], "amenity": ["bus_station"]},
            "Stasiun":     {"public_transport": ["station", "train_station"]},
            "Parkir":      {"amenity": ["parking"]},
            "SPBU":        {"amenity": ["fuel"]},
        }
    }
}


# ==============================================================
# POINT-IN-POLYGON (Ray Casting Algorithm)
# ==============================================================
def point_in_polygon(x, y, polygon_coords):
    """Check if point (x=lon, y=lat) is inside a polygon ring."""
    n = len(polygon_coords)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = polygon_coords[i]
        xj, yj = polygon_coords[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def point_in_multipolygon(lon, lat, multipolygon_coords):
    """Check if point is inside any polygon of a MultiPolygon."""
    for polygon in multipolygon_coords:
        # polygon[0] = outer ring, polygon[1:] = holes
        outer_ring = polygon[0]
        if point_in_polygon(lon, lat, outer_ring):
            # Check if inside any hole
            in_hole = False
            for hole in polygon[1:]:
                if point_in_polygon(lon, lat, hole):
                    in_hole = True
                    break
            if not in_hole:
                return True
    return False


def point_in_feature(lon, lat, boundary_feature):
    """Check if point is inside a GeoJSON feature (Polygon or MultiPolygon)."""
    geom = boundary_feature["geometry"]
    geom_type = geom["type"]
    coords = geom["coordinates"]

    if geom_type == "MultiPolygon":
        return point_in_multipolygon(lon, lat, coords)
    elif geom_type == "Polygon":
        outer_ring = coords[0]
        if point_in_polygon(lon, lat, outer_ring):
            for hole in coords[1:]:
                if point_in_polygon(lon, lat, hole):
                    return False
            return True
    return False


# ==============================================================
# HELPERS
# ==============================================================
def get_centroid(geometry):
    """Calculate centroid for any geometry type, returning [lon, lat]."""
    geom_type = geometry["type"]
    coords = geometry["coordinates"]

    if geom_type == "Point":
        return coords

    all_points = []
    if geom_type == "LineString":
        all_points = coords
    elif geom_type == "Polygon":
        all_points = coords[0]
    elif geom_type == "MultiPolygon":
        for polygon in coords:
            all_points.extend(polygon[0])
    elif geom_type == "MultiLineString":
        for line in coords:
            all_points.extend(line)

    if not all_points:
        return None

    avg_lon = sum(p[0] for p in all_points) / len(all_points)
    avg_lat = sum(p[1] for p in all_points) / len(all_points)
    return [avg_lon, avg_lat]


def matches_subcategory(properties, subcat_filters):
    """Check if a feature matches a subcategory's filters."""
    for key, values in subcat_filters.items():
        prop_val = properties.get(key)
        if prop_val and prop_val in values:
            return True
    return False


def get_display_name(properties):
    name = properties.get("name")
    if name:
        return name
    for key in ["amenity", "shop", "building", "tourism", "public_transport", "healthcare"]:
        val = properties.get(key)
        if val:
            return val.replace("_", " ").title()
    return "Unnamed"


def get_osm_type(properties):
    for key in ["amenity", "shop", "public_transport", "healthcare", "tourism", "building"]:
        val = properties.get(key)
        if val:
            return val.replace("_", " ").title()
    return "Unknown"


def extract_yogyakarta_boundary(gadm_file):
    print(f"  Reading GADM file: {gadm_file}")
    with open(gadm_file, "r", encoding="utf-8") as f:
        gadm = json.load(f)

    for feature in gadm["features"]:
        name = feature["properties"].get("NAME_1", "")
        if "yogyakarta" in name.lower():
            print(f"  Found: {name}")
            return feature

    print("  WARNING: Yogyakarta not found!")
    return None


def main():
    print("=" * 60)
    print("WebGIS Yogyakarta - Data Preprocessing v2")
    print("  + Spatial filter (DIY boundary)")
    print("  + Sub-category tracking")
    print("=" * 60)

    # Step 1: Extract boundary
    print("\n[1/4] Extracting Yogyakarta boundary...")
    yog_boundary = extract_yogyakarta_boundary(GADM_FILE)

    if yog_boundary:
        boundary_output = os.path.join(OUTPUT_DIR, "yogyakarta_boundary.geojson")
        with open(boundary_output, "w", encoding="utf-8") as f:
            json.dump({"type": "FeatureCollection", "features": [yog_boundary]}, f)
        print(f"  Saved: {boundary_output}")
    else:
        print("  FATAL: Cannot proceed without boundary.")
        return

    # Step 2: Compute bounding box for fast pre-filter
    print("\n[2/4] Computing bounding box for pre-filter...")
    geom = yog_boundary["geometry"]
    all_coords = []
    if geom["type"] == "MultiPolygon":
        for poly in geom["coordinates"]:
            for ring in poly:
                all_coords.extend(ring)
    elif geom["type"] == "Polygon":
        for ring in geom["coordinates"]:
            all_coords.extend(ring)

    min_lon = min(c[0] for c in all_coords)
    max_lon = max(c[0] for c in all_coords)
    min_lat = min(c[1] for c in all_coords)
    max_lat = max(c[1] for c in all_coords)
    print(f"  BBox: lon[{min_lon:.4f}, {max_lon:.4f}] lat[{min_lat:.4f}, {max_lat:.4f}]")

    # Step 3: Read main dataset
    print(f"\n[3/4] Reading main dataset: {INPUT_FILE}")
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    total_features = len(data["features"])
    print(f"  Total features: {total_features:,}")

    # Step 4: Categorize + spatial filter
    print(f"\n[4/4] Filtering and categorizing...")

    category_features = {key: [] for key in CATEGORIES}
    subcategory_counts = {}  # {cat_key: {subcat_name: count}}
    for key in CATEGORIES:
        subcategory_counts[key] = {sc: 0 for sc in CATEGORIES[key]["subcategories"]}

    processed = 0
    bbox_passed = 0
    spatial_passed = 0
    matched = 0

    for feature in data["features"]:
        processed += 1
        if processed % 50000 == 0:
            print(f"  Processed {processed:,}/{total_features:,}...")

        props = feature["properties"]
        centroid = get_centroid(feature["geometry"])
        if centroid is None:
            continue

        lon, lat = centroid

        # Fast bounding box pre-filter
        if not (min_lon <= lon <= max_lon and min_lat <= lat <= max_lat):
            continue
        bbox_passed += 1

        # Precise point-in-polygon check
        if not point_in_feature(lon, lat, yog_boundary):
            continue
        spatial_passed += 1

        # Match to category + subcategory
        for cat_key, cat_def in CATEGORIES.items():
            found_subcat = None
            for subcat_name, subcat_filters in cat_def["subcategories"].items():
                if matches_subcategory(props, subcat_filters):
                    found_subcat = subcat_name
                    break

            if found_subcat:
                point_feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [round(lon, 6), round(lat, 6)]
                    },
                    "properties": {
                        "name": get_display_name(props),
                        "type": get_osm_type(props),
                        "category": cat_key,
                        "subcategory": found_subcat,
                        "opening_hours": props.get("opening_hours", ""),
                        "operator": props.get("operator", ""),
                        "osm_id": props.get("osm_id", "")
                    }
                }
                category_features[cat_key].append(point_feature)
                subcategory_counts[cat_key][found_subcat] += 1
                matched += 1
                break

    print(f"\n  BBox passed: {bbox_passed:,}")
    print(f"  Spatial passed (inside DIY): {spatial_passed:,}")
    print(f"  Category matched: {matched:,}")

    # Save category files
    print("\n  Saving category files:")
    for cat_key, features in category_features.items():
        output_file = os.path.join(OUTPUT_DIR, f"{cat_key}.geojson")
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump({"type": "FeatureCollection", "features": features}, f)

        label = CATEGORIES[cat_key]["label"]
        print(f"    {label}: {len(features):,} features -> {output_file}")
        for sc_name, sc_count in subcategory_counts[cat_key].items():
            if sc_count > 0:
                print(f"      - {sc_name}: {sc_count:,}")

    # Save subcategory metadata for JS
    meta = {}
    for cat_key, cat_def in CATEGORIES.items():
        meta[cat_key] = {
            "label": cat_def["label"],
            "subcategories": {
                sc_name: subcategory_counts[cat_key][sc_name]
                for sc_name in cat_def["subcategories"]
                if subcategory_counts[cat_key][sc_name] > 0
            }
        }

    meta_file = os.path.join(OUTPUT_DIR, "categories_meta.json")
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    print(f"\n  Metadata saved: {meta_file}")

    print("\n" + "=" * 60)
    print("Preprocessing v2 complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
