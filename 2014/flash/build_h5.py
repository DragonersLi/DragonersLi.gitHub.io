#!/usr/bin/env python3
"""Build the interactive, offline HTML5 gallery from the original SWFs.

The SWF bytecode stays intact so its mouse and touch interactions survive.
Ruffle renders it through browser Canvas/WebAssembly without a Flash plugin.
The local Ruffle files are supplied by ../ruffle; this script never downloads.
"""

import base64
import json
import re
import zlib
from pathlib import Path


HERE = Path(__file__).resolve().parent
RUFFLE = HERE.parent / "ruffle"
TEMPLATE = HERE / "flash.template.html.in"
OUTPUT = HERE / "flash.html"


def safe_script(source: str) -> str:
    return re.sub(r"</script", r"<\\/script", source, flags=re.IGNORECASE)


def engine_html() -> str:
    runtime = (RUFFLE / "ruffle.js").read_text(encoding="utf-8")
    wasm_names = sorted(path.name for path in RUFFLE.glob("*.wasm"))
    chunk_names = sorted(path.name for path in RUFFLE.glob("core.ruffle.*.js"))
    if not wasm_names or not chunk_names:
        raise RuntimeError("Ruffle files are missing")

    # Ruffle's webpack loader normally fetches these two WASM files. Replace
    # only those generated URLs; the browser fetch shim serves embedded bytes.
    runtime, count = re.subn(
        r'e\.exports=a\.p\+"([0-9a-f]+)\.wasm"',
        r'e.exports="ruffle-wasm:\1"',
        runtime,
    )
    if count != len(wasm_names):
        raise RuntimeError("Ruffle loader layout changed; cannot build safely")

    parts = ["""<script>
window.RufflePlayer = {config: {
  polyfills: false, publicPath: "", autoplay: "on",
  unmuteOverlay: ['fish', 'cat'].includes(new URLSearchParams(location.search).get('embed')) ? "hidden" : "visible",
  splashScreen: false, warnOnUnsupportedContent: false
}};
const originalFetch = window.fetch.bind(window);
const wasmCache = new Map();
window.fetch = function(resource, options) {
  const url = typeof resource === 'string' ? resource : resource?.href || resource?.url;
  if (!url?.startsWith('ruffle-wasm:')) return originalFetch(resource, options);
  const hash = url.slice('ruffle-wasm:'.length);
  if (!wasmCache.has(hash)) {
    const element = document.querySelector('script[data-wasm-hash="' + hash + '"]');
    if (!element) return Promise.reject(new Error('Ruffle WASM data is missing'));
    if (!('DecompressionStream' in window)) {
      return Promise.reject(new Error('This browser needs DecompressionStream to open the offline player'));
    }
    const binary = atob(element.textContent.trim());
    const compressed = Uint8Array.from(binary, character => character.charCodeAt(0));
    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate'));
    wasmCache.set(hash, new Response(stream).arrayBuffer());
  }
  return wasmCache.get(hash).then(bytes => new Response(bytes, {
    status: 200, headers: {'Content-Type': 'application/wasm'}
  }));
};
</script>"""]

    for name in wasm_names:
        data = (RUFFLE / name).read_bytes()
        encoded = base64.b64encode(zlib.compress(data, level=9)).decode("ascii")
        parts.append(
            f'<script type="application/octet-stream" data-wasm-hash="{name[:-5]}">{encoded}</script>'
        )

    for name in chunk_names:
        parts.append(f"<script>{safe_script((RUFFLE / name).read_text(encoding='utf-8'))}</script>")
    parts.append(f"<script>{safe_script(runtime)}</script>")
    license_text = (RUFFLE / "LICENSE_MIT").read_text(encoding="utf-8")
    parts.append(f'<script type="text/plain" id="ruffle-license">{license_text}</script>')
    return "\n".join(parts)


def main() -> None:
    template = TEMPLATE.read_text(encoding="utf-8")
    assert template.count("<!-- EMBEDDED_ENGINE -->") == 1
    assert template.count("<!-- EMBEDDED_SWFS -->") == 1
    swfs = {path.name: base64.b64encode(path.read_bytes()).decode("ascii")
            for path in sorted(HERE.glob("*.swf"))}
    if len(swfs) != 12:
        raise RuntimeError(f"Expected 12 SWFs, found {len(swfs)}")
    game_data = '<script type="application/json" id="embedded-swfs">' + json.dumps(swfs, separators=(",", ":")) + '</script>'
    page = template.replace("<!-- EMBEDDED_ENGINE -->", engine_html())
    page = page.replace("<!-- EMBEDDED_SWFS -->", game_data)
    temporary = OUTPUT.with_suffix(".html.tmp")
    temporary.write_text(page, encoding="utf-8")
    temporary.replace(OUTPUT)
    print(f"Built {OUTPUT} ({len(page) / 1_000_000:.1f} MB, {len(swfs)} interactive SWFs)")


if __name__ == "__main__":
    main()
