import { zodResolver } from "@hookform/resolvers/zod";
import type MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Surface, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { AuthHeader } from "@/components/auth-header";
import { ErrorSnackbar } from "@/components/error-snackbar";
import { useAutoCadastro } from "@/features/auth/use-auto-cadastro";
import { ApiError } from "@/lib/api-client";

const cadastroSchema = z.object({
  nome: z.string().min(3, "Informe seu nome completo."),
  cpf: z.string().min(11, "Informe um CPF válido (11 dígitos)."),
  contato: z.string().min(8, "Informe um telefone ou e-mail de contato."),
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

type CadastroFormValues = z.infer<typeof cadastroSchema>;

// RF01 (canal associado) — cadastro público, entra "Pendente de validação" até a diretoria
// aprovar (cadastro-associado.json). Mesmos campos do form de auto-cadastro do painel web
// (frontend-web/src/app/(painel)/associados/novo), sem categoria/vínculo institucional aqui —
// isso é preenchido pela diretoria depois, na aprovação.
export default function CadastroScreen() {
  const autoCadastro = useAutoCadastro();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CadastroFormValues>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { nome: "", cpf: "", contato: "", email: "", senha: "" },
  });

  const onSubmit = handleSubmit((dados) => autoCadastro.mutate(dados));

  return (
    <View style={styles.flex}>
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
            <AuthHeader
              titulo="Criar conta"
              subtitulo="Seu cadastro fica pendente até a diretoria validar"
              icone="account-plus-outline"
              mostrarVoltar
            />

            <Surface style={styles.card} elevation={2}>
              {CAMPOS.map(({ nome, label, placeholder, icone, props }) => (
                <Controller
                  key={nome}
                  control={control}
                  name={nome}
                  render={({ field }) => (
                    <View>
                      <TextInput
                        mode="outlined"
                        label={label}
                        placeholder={placeholder}
                        left={<TextInput.Icon icon={icone} />}
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        error={!!errors[nome]}
                        style={styles.field}
                        {...props}
                      />
                      {errors[nome] && <Text style={styles.erroCampo}>{errors[nome]?.message}</Text>}
                    </View>
                  )}
                />
              ))}

              <Button
                mode="contained"
                onPress={onSubmit}
                loading={autoCadastro.isPending}
                disabled={autoCadastro.isPending}
                contentStyle={styles.buttonContent}
                style={styles.button}
                icon="check-circle-outline"
              >
                Criar conta
              </Button>
            </Surface>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ErrorSnackbar
        visible={autoCadastro.isError}
        mensagem={
          autoCadastro.error instanceof ApiError
            ? autoCadastro.error.message
            : "Não foi possível concluir o cadastro. Tente novamente."
        }
        onDismiss={() => autoCadastro.reset()}
      />
    </View>
  );
}

const CAMPOS: {
  nome: keyof CadastroFormValues;
  label: string;
  placeholder: string;
  icone: keyof typeof MaterialCommunityIcons.glyphMap;
  props?: React.ComponentProps<typeof TextInput>;
}[] = [
  { nome: "nome", label: "Nome completo", placeholder: "Como você é conhecido", icone: "account-outline" },
  {
    nome: "cpf",
    label: "CPF",
    placeholder: "Somente números",
    icone: "card-account-details-outline",
    props: { keyboardType: "number-pad" },
  },
  {
    nome: "contato",
    label: "Telefone ou e-mail de contato",
    placeholder: "(55) 99999-0000",
    icone: "phone-outline",
  },
  {
    nome: "email",
    label: "E-mail (login)",
    placeholder: "voce@exemplo.com",
    icone: "email-outline",
    props: { autoCapitalize: "none", keyboardType: "email-address" },
  },
  {
    nome: "senha",
    label: "Senha",
    placeholder: "Pelo menos 6 caracteres",
    icone: "lock-outline",
    props: { secureTextEntry: true },
  },
];

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: "#7A2331" },
  scroll: { flexGrow: 1, backgroundColor: "#FAF7F1" },
  card: {
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    gap: 4,
  },
  field: { backgroundColor: "#FFFFFF" },
  erroCampo: { color: "#B3261E", fontSize: 12, marginTop: -4, marginBottom: 4, marginLeft: 4 },
  button: { marginTop: 12, borderRadius: 12 },
  buttonContent: { paddingVertical: 6 },
});
