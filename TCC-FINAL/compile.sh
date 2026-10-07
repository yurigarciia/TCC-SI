#!/usr/bin/env bash
set -e

MIKTEX="/c/Users/eidip/AppData/Local/Programs/MiKTeX/miktex/bin/x64"
FILE="main"

echo "==> pdflatex (1/3)..."
"$MIKTEX/pdflatex.exe" -interaction=nonstopmode "$FILE.tex"

echo "==> biber..."
"$MIKTEX/biber.exe" "$FILE"

echo "==> pdflatex (2/3)..."
"$MIKTEX/pdflatex.exe" -interaction=nonstopmode "$FILE.tex"

echo "==> pdflatex (3/3)..."
"$MIKTEX/pdflatex.exe" -interaction=nonstopmode "$FILE.tex"

EXPORT_DIR="exports"
mkdir -p "$EXPORT_DIR"

MONTH_YEAR=$(date +%m-%Y)
LAST_VERSION=$(ls "$EXPORT_DIR"/TCC-GARCIA-v*-*.pdf 2>/dev/null \
  | sed -E 's/.*-v([0-9]+)-.*/\1/' \
  | sort -n | tail -1)
VERSION=$(( ${LAST_VERSION:-0} + 1 ))

EXPORT_NAME="TCC-GARCIA-v${VERSION}-${MONTH_YEAR}.pdf"
cp "$FILE.pdf" "$EXPORT_DIR/$EXPORT_NAME"

echo ""
echo "Compilado: $FILE.pdf"
echo "Exportado: $EXPORT_DIR/$EXPORT_NAME"
