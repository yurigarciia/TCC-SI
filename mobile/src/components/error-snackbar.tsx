import { Snackbar } from "react-native-paper";
import { coresSemanticas } from "@/theme/paper-theme";

interface ErrorSnackbarProps {
  visible: boolean;
  mensagem: string;
  onDismiss: () => void;
}

// Feedback de erro consistente em toda ação de mutation do app — nunca só texto solto na tela.
// Some sozinho depois de alguns segundos, mas também pode ser dispensado tocando o X.
export function ErrorSnackbar({ visible, mensagem, onDismiss }: ErrorSnackbarProps) {
  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={5000}
      style={{ backgroundColor: coresSemanticas.erro }}
      action={{ label: "Fechar", labelStyle: { color: "#FFFFFF" }, onPress: onDismiss }}
    >
      {mensagem}
    </Snackbar>
  );
}
