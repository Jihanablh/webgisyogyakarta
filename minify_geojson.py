import json
import os
import glob

def round_coordinates(coords, decimals=5):
    if isinstance(coords, list):
        if len(coords) == 2 and isinstance(coords[0], (int, float)) and isinstance(coords[1], (int, float)):
            return [round(coords[0], decimals), round(coords[1], decimals)]
        else:
            return [round_coordinates(c, decimals) for c in coords]
    return coords

def process_geojson(file_path):
    print(f"Processing {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Process features
    if 'features' in data:
        for feature in data['features']:
            if 'geometry' in feature and feature['geometry'] is not None:
                coords = feature['geometry'].get('coordinates')
                if coords:
                    feature['geometry']['coordinates'] = round_coordinates(coords)
    
    # Overwrite minified
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'))
    
    print(f"Finished {file_path}. Size: {os.path.getsize(file_path)} bytes")

def main():
    data_dir = 'data'
    pattern = os.path.join(data_dir, '*.geojson')
    for file_path in glob.glob(pattern):
        process_geojson(file_path)
    print("All GeoJSON files processed.")

if __name__ == '__main__':
    main()
