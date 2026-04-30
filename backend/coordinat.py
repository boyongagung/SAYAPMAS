import requests
import re
import sys

def get_maps_data(short_url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    try:
        # Gunakan session untuk efisiensi jika perlu banyak request
        r = requests.get(short_url, headers=headers, allow_redirects=True, timeout=10)
        return r.url, r.text
    except Exception as e:
        print(f"Error: {e}")
        return None, None

def extract_coords(final_url, html_content):
    # Pattern 1: Standar @lat,lng
    match = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', final_url)
    if match:
        return match.group(1), match.group(2)

    # Pattern 2: Format internal !3d (lat) dan !4d (lng)
    match_alt = re.search(r'!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)', final_url)
    if match_alt:
        return match_alt.group(1), match_alt.group(2)

    # Pattern 3: Cari di HTML (JSON-like)
    # Menggunakan regex yang lebih fleksibel terhadap spasi
    lat = re.search(r'"lat"\s*:\s*(-?\d+\.\d+)', html_content)
    lng = re.search(r'"lng"\s*:\s*(-?\d+\.\d+)', html_content)

    if lat and lng:
        return lat.group(1), lng.group(1)

    return None, None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python gmaps_coord.py <link>")
        sys.exit()

    print("[*] Processing...")
    final_url, html = get_maps_data(sys.argv[1])

    if final_url:
        lat, lng = extract_coords(final_url, html)
        if lat and lng:
            print(f"\n✅ Koordinat: {lat}, {lng}")
        else:
            print("\n❌ Gagal ekstraksi.")
