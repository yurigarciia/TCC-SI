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

echo ""
echo "Compilado: $FILE.pdf"
