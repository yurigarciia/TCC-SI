#!/usr/bin/env bash
set -e

FILE="main"

# Resolve pdflatex/biber sem depender do caminho de instalação de uma máquina específica:
# 1) já no PATH (instalação padrão, qualquer SO); 2) locais comuns de instalação do MiKTeX no
# Windows (usuário atual ou todo-usuário), cobrindo qualquer nome de usuário.
find_tool() {
  local nome="$1"
  if command -v "$nome" >/dev/null 2>&1; then
    command -v "$nome"
    return
  fi
  local candidato
  candidato=$(find /c/Users/*/AppData/Local/Programs/MiKTeX/miktex/bin/x64 \
    "/c/Program Files/MiKTeX/miktex/bin/x64" \
    -maxdepth 1 -iname "${nome}.exe" 2>/dev/null | head -n1)
  if [ -n "$candidato" ]; then
    echo "$candidato"
    return
  fi
  echo ""
}

PDFLATEX=$(find_tool pdflatex)
BIBER=$(find_tool biber)

if [ -z "$PDFLATEX" ] || [ -z "$BIBER" ]; then
  echo "Erro: pdflatex/biber não encontrados. Instale o MiKTeX (ou TeX Live) e garanta que" >&2
  echo "estejam no PATH, ou na pasta padrão do MiKTeX em %LOCALAPPDATA%\\Programs\\MiKTeX." >&2
  exit 1
fi

echo "==> pdflatex (1/3)..."
"$PDFLATEX" -interaction=nonstopmode "$FILE.tex"

echo "==> biber..."
"$BIBER" "$FILE"

echo "==> pdflatex (2/3)..."
"$PDFLATEX" -interaction=nonstopmode "$FILE.tex"

echo "==> pdflatex (3/3)..."
"$PDFLATEX" -interaction=nonstopmode "$FILE.tex"

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
