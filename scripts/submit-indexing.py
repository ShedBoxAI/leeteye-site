#!/usr/bin/env python3
"""
Submit URLs to Google Indexing API for faster crawling.

Setup (one-time):
1. Go to https://console.cloud.google.com/
2. Create a project (or use existing)
3. Enable "Web Search Indexing API" (search for "indexing api")
4. Go to IAM & Admin > Service Accounts > Create Service Account
5. Download the JSON key file, save as service-account.json in this directory
6. Copy the service account email (looks like: name@project.iam.gserviceaccount.com)
7. In Google Search Console > Settings > Users and permissions > Add user
   - Add the service account email as Owner

Usage:
    python3 scripts/submit-indexing.py
"""

import json
import os
import sys
import time

try:
    from google.oauth2 import service_account
    from google.auth.transport.requests import AuthorizedSession
except ImportError:
    print("Missing dependencies. Install with:")
    print("  pip install google-auth google-auth-httplib2")
    sys.exit(1)

SCOPES = ["https://www.googleapis.com/auth/indexing"]
API_URL = "https://indexing.googleapis.com/v3/urlNotifications:publish"
KEY_FILE = os.path.join(os.path.dirname(__file__), "service-account.json")

# Rate limit: Google allows ~200 requests per day
RATE_LIMIT_DELAY = 1  # seconds between requests


def get_urls_from_sitemaps():
    """Parse both sitemaps and return all URLs."""
    import xml.etree.ElementTree as ET

    base = os.path.join(os.path.dirname(__file__), "..")
    urls = []

    for sitemap_file in ["sitemap-pseo.xml", "sitemap.xml"]:
        path = os.path.join(base, sitemap_file)
        if not os.path.exists(path):
            continue
        tree = ET.parse(path)
        root = tree.getroot()
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        for url_elem in root.findall("s:url", ns):
            loc = url_elem.find("s:loc", ns)
            if loc is not None and loc.text:
                urls.append(loc.text)

    # Deduplicate (homepage appears in both)
    seen = set()
    unique = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            unique.append(u)
    return unique


def submit_url(session, url):
    """Submit a single URL to the Indexing API."""
    body = {"url": url, "type": "URL_UPDATED"}
    response = session.post(API_URL, json=body)
    return response.status_code, response.json()


def main():
    if not os.path.exists(KEY_FILE):
        print(f"Service account key not found at: {KEY_FILE}")
        print()
        print("Setup instructions:")
        print("1. Go to https://console.cloud.google.com/")
        print("2. Enable 'Web Search Indexing API'")
        print("3. Create a Service Account, download JSON key")
        print("4. Save it as: scripts/service-account.json")
        print("5. Add the service account email as Owner in Search Console")
        sys.exit(1)

    credentials = service_account.Credentials.from_service_account_file(
        KEY_FILE, scopes=SCOPES
    )
    session = AuthorizedSession(credentials)

    urls = get_urls_from_sitemaps()
    print(f"Found {len(urls)} URLs to submit\n")

    success = 0
    failed = 0

    for i, url in enumerate(urls, 1):
        try:
            status, result = submit_url(session, url)
            if status == 200:
                print(f"[{i}/{len(urls)}] OK  {url}")
                success += 1
            elif status == 429:
                print(f"[{i}/{len(urls)}] RATE LIMITED - stopping. Try again tomorrow.")
                break
            else:
                print(f"[{i}/{len(urls)}] ERR {status} {url} - {result.get('error', {}).get('message', '')}")
                failed += 1
        except Exception as e:
            print(f"[{i}/{len(urls)}] ERR {url} - {e}")
            failed += 1

        time.sleep(RATE_LIMIT_DELAY)

    print(f"\nDone: {success} submitted, {failed} failed, {len(urls) - success - failed} skipped")


if __name__ == "__main__":
    main()
