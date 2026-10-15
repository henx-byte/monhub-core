#!/data/data/com.termux/files/usr/bin/bash

# Monhub Auto-Release - Final Version (Termux)
# Works with CHANGELOG.md template

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${GREEN}🚀 Monhub Auto-Release${NC}"
echo "================================"

if [ ! -d ".git" ]; then
  echo -e "${RED}❌ Bukan repo git! cd ke moonhub-core dulu!${NC}"
  exit 1
fi

# Cek / bikin CHANGELOG.md kalo belum ada
if [ ! -f "CHANGELOG.md" ]; then
  echo -e "${YELLOW}⚠️ CHANGELOG.md belum ada, bikin template...${NC}"
  cat > CHANGELOG.md << 'EOF'
# Changelog
All notable changes to Monhub will be documented in this file.

## [v1.0.0-beta] - 2025-05-15 (BETA)
### 🚀 Added
- Initial release Monhub Core
- Search with 9 items result
- Video player with auto-play next

### 🐛 Fixed
- Migration to Expo SDK 57

### 🔧 Changed
- Build system using prebuild clean
EOF
  echo -e "${GREEN}✅ CHANGELOG.md created!${NC}"
fi

# Input version
read -p "Version (contoh 1.0.1 atau 1.0.1-beta): v" VERSION
if [ -z "$VERSION" ]; then
  echo -e "${RED}❌ Version kosong!${NC}"
  exit 1
fi

TAG="v$VERSION"
DATE=$(date +%Y-%m-%d)

if git tag -l | grep -q "^$TAG$"; then
  echo -e "${RED}❌ Tag $TAG udah ada!${NC}"
  exit 1
fi

# Deteksi beta
IS_BETA=false
if [[ "$VERSION" == *"beta"* ]]; then
  IS_BETA=true
fi

echo ""
echo -e "${CYAN}📦 Release: $TAG ($DATE) ${IS_BETA:+BETA}${NC}"
echo ""

# Input Added
echo -e "${YELLOW}✨ Added (fitur baru) - Enter kosong kalo selesai:${NC}"
ADDED=""
while true; do
  read -p "  + " line
  [[ -z "$line" ]] && break
  ADDED+="- $line"$'\n'
done

# Input Fixed
echo ""
echo -e "${YELLOW}🐛 Fixed (bug fix) - Enter kosong kalo selesai:${NC}"
FIXED=""
while true; do
  read -p "  + " line
  [[ -z "$line" ]] && break
  FIXED+="- $line"$'\n'
done

# Input Changed (optional)
echo ""
echo -e "${YELLOW}🔧 Changed (opsional) - Enter kosong kalo selesai:${NC}"
CHANGED=""
while true; do
  read -p "  + " line
  [[ -z "$line" ]] && break
  CHANGED+="- $line"$'\n'
done

if [[ -z "$ADDED" && -z "$FIXED" && -z "$CHANGED" ]]; then
  echo -e "${RED}❌ Minimal isi 1!${NC}"
  exit 1
fi

# Build new section
NEW=""
NEW+="## [$TAG] - $DATE"
if $IS_BETA; then NEW+=" (BETA)"; fi
NEW+=$'\n'

if [[ -n "$ADDED" ]]; then
  NEW+="### 🚀 Added"$'\n'"$ADDED"$'\n'
fi
if [[ -n "$FIXED" ]]; then
  NEW+="### 🐛 Fixed"$'\n'"$FIXED"$'\n'
fi
if [[ -n "$CHANGED" ]]; then
  NEW+="### 🔧 Changed"$'\n'"$CHANGED"$'\n'
fi

echo ""
echo -e "${CYAN}📝 Preview:${NC}"
echo "--------------------------------"
echo -e "$NEW"
echo "--------------------------------"
echo ""

read -p "Lanjut build $TAG? (y/n): " OK
[[ "$OK" != "y" ]] && exit 0

# Insert ke CHANGELOG.md setelah baris 2 (setelah # Changelog + deskripsi)
# Cari line kedua kosong setelah header
# Simple: insert after line 2
{
  head -n 2 CHANGELOG.md
  echo ""
  echo -e "$NEW"
  tail -n +3 CHANGELOG.md
} > CHANGELOG.tmp && mv CHANGELOG.tmp CHANGELOG.md

echo -e "${GREEN}✅ CHANGELOG.md updated!${NC}"

# Git
echo ""
echo -e "${YELLOW}🔨 Pushing...${NC}"

# Commit CHANGELOG
if ! git diff --quiet CHANGELOG.md; then
  git add CHANGELOG.md
  git commit -m "chore: release $TAG"
fi

# Cek ada file lain yang belum commit (optional, skip biar gak berantakan)
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo -e "${YELLOW}⚠️ Ada file lain yang belum di-commit, commit juga? (y/n): ${NC}"
  read -p "" ADD_ALL
  if [[ "$ADD_ALL" == "y" ]]; then
    git add .
    git commit -m "chore: update for $TAG" || true
  fi
fi

git push origin main
echo "✅ main pushed (gak trigger build)"

git tag $TAG
git push origin $TAG

echo ""
echo -e "${GREEN}🎉 DONE! $TAG lagi di-build!${NC}"
echo "Actions: https://github.com/henx-byte/moonhub-core/actions"
echo "Release: https://github.com/henx-byte/moonhub-core/releases/tag/$TAG"
echo ""
echo -e "${CYAN}APK bakal jadi: moonhub-$TAG.apk${NC}"
