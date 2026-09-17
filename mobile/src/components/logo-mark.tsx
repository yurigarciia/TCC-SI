import Svg, { Circle, Path, Rect } from "react-native-svg";

// Marca do Querência ERP — mesmo desenho do painel web (frontend-web/src/components/logo-mark.tsx
// e src/app/icon.svg lá): arco cor de âmbar (sol/horizonte) sobre um "Q" em anel com rabicho.
// Cores fixas da identidade (--secondary verde-bandeira e --warning prata-âmbar do design system
// web), não dependem de tema.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect width={48} height={48} rx={11} fill="#2e5e3e" />
      <Path
        d="M14 21 A10 10 0 0 1 34 21"
        fill="none"
        stroke="#b7791f"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Circle cx={23.5} cy={28.5} r={9} fill="none" stroke="#faf7f1" strokeWidth={4.5} />
      <Path d="M26.3 31.3 L32.7 37.7" fill="none" stroke="#faf7f1" strokeWidth={4.5} strokeLinecap="round" />
    </Svg>
  );
}
