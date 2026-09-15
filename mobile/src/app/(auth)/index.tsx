import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Surface, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { AuthHeader } from "@/components/auth-header";
import { ErrorSnackbar } from "@/components/error-snackbar";
import { useLogin } from "@/features/auth/use-login";
import { ApiError } from "@/lib/api-client";

const loginSchema = z.object({
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  senha: z.string().min(1, "Informe a senha."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const login = useLogin();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  });

  const onSubmit = handleSubmit((dados) => login.mutate(dados));

  const mensagemErro =
    login.error instanceof ApiError
      ? "E-mail ou senha inválidos."
      : "Não foi possível conectar ao servidor. Tente novamente.";

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
            <AuthHeader
              titulo="Pampa Gestão"
              subtitulo="Acesse sua conta de associado"
              icone="hand-wave"
            />

            <Surface style={styles.card} elevation={2}>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <TextInput
                    mode="outlined"
                    label="E-mail"
                    placeholder="voce@exemplo.com"
                    left={<TextInput.Icon icon="email-outline" />}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={!!errors.email}
                    style={styles.field}
                  />
                )}
              />
              {errors.email && <Text style={styles.erroCampo}>{errors.email.message}</Text>}

              <Controller
                control={control}
                name="senha"
                render={({ field }) => (
                  <TextInput
                    mode="outlined"
                    label="Senha"
                    placeholder="Sua senha"
                    left={<TextInput.Icon icon="lock-outline" />}
                    secureTextEntry
                    autoComplete="password"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={!!errors.senha}
                    style={styles.field}
                  />
                )}
              />
              {errors.senha && <Text style={styles.erroCampo}>{errors.senha.message}</Text>}

              <Button
                mode="contained"
                onPress={onSubmit}
                loading={login.isPending}
                disabled={login.isPending}
                contentStyle={styles.buttonContent}
                style={styles.button}
                icon="login"
              >
                Entrar
              </Button>
            </Surface>

            <View style={styles.linksContainer}>
              <Link href="/(auth)/cadastro" asChild>
                <Button mode="text" icon="account-plus-outline">
                  Ainda não é associado? Cadastre-se
                </Button>
              </Link>
              <Link href="/(auth)/vincular-conta" asChild>
                <Button mode="text" icon="link-variant">
                  Já é associado mas nunca acessou?
                </Button>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ErrorSnackbar
        visible={login.isError}
        mensagem={mensagemErro}
        onDismiss={() => login.reset()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: "#7A2331" },
  scroll: { flexGrow: 1, backgroundColor: "#FAF7F1" },
  card: {
    marginHorizontal: 20,
    marginTop: -20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    gap: 4,
  },
  field: { backgroundColor: "#FFFFFF" },
  erroCampo: { color: "#B3261E", fontSize: 12, marginTop: -4, marginLeft: 4 },
  button: { marginTop: 12, borderRadius: 12 },
  buttonContent: { paddingVertical: 6 },
  linksContainer: { marginTop: 8, paddingHorizontal: 8, gap: 2, paddingBottom: 24 },
});
