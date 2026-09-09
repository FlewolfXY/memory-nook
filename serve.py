#!/usr/bin/env python3
"""Serve the editable static app on this computer only; no deployment."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error('port must be between 1 and 65535')
    public = Path(__file__).resolve().parent / 'dist'
    if not (public / 'index.html').is_file():
        parser.error('dist/index.html is missing; keep serve.py beside the dist folder')
    handler = partial(SimpleHTTPRequestHandler, directory=str(public))
    try:
        server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
    except OSError as exc:
        parser.exit(1, f'Could not start: {exc}. Try --port 8001\n')
    print(f'Memory Nook: http://127.0.0.1:{args.port}  (Ctrl+C to stop)', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == '__main__':
    main()
