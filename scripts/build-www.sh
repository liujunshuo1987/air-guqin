#!/usr/bin/env bash
# 打包 web 资产到 www/(Capacitor webDir)。
# 整仓即应用:挑正面清单复制,避免把 .git/node_modules/ios 等一并带入。
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf www
mkdir -p www
cp index.html www/
cp manifest.webmanifest www/ 2>/dev/null || true
# sw.js 不带入原生壳:壳内资源本地即有,Service Worker 徒增缓存歧义
for d in icons vendor samples; do
  [ -d "$d" ] && cp -R "$d" www/
done
for f in intro.mp4 logo.png; do
  [ -f "$f" ] && cp "$f" www/
done
echo "www/ 已就绪:"
du -sh www
