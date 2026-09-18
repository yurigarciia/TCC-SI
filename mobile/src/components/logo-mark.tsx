import { Image } from "expo-image";

// Marca do Querência ERP — arte oficial (recorte transparente do ícone a partir da logo
// vetorizada, mesmo asset usado no painel web em frontend-web/public/brand/qerp-icon.png).
// Usar sempre sobre fundo claro — sobre fundo escuro (header em gradiente vinho), envolver num
// chip claro opaco em vez de aplicar direto (o traço verde-escuro do anel perde contraste).
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <Image
      source={require("../../assets/images/logo-icon.png")}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityLabel="Querência ERP"
    />
  );
}
