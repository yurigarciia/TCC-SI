import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              Pia do Sul
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Acesse sua conta de associado.
            </Text>
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <View style={styles.field}>
                <TextInput
                  mode="outlined"
                  label="E-mail"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={!!errors.email}
                />
                <HelperText type="error" visible={!!errors.email}>
                  {errors.email?.message}
                </HelperText>
              </View>
            )}
          />

          <Controller
            control={control}
            name="senha"
            render={({ field }) => (
              <View style={styles.field}>
                <TextInput
                  mode="outlined"
                  label="Senha"
                  secureTextEntry
                  autoComplete="password"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={!!errors.senha}
                />
                <HelperText type="error" visible={!!errors.senha}>
                  {errors.senha?.message}
                </HelperText>
              </View>
            )}
          />

          {login.isError && (
            <Text style={styles.erroLogin}>
              {login.error instanceof ApiError
                ? "E-mail ou senha inválidos."
                : "Não foi possível conectar ao servidor. Tente novamente."}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={onSubmit}
            loading={login.isPending}
            disabled={login.isPending}
            contentStyle={styles.buttonContent}
          >
            Entrar
          </Button>

          <View style={styles.linksContainer}>
            <Link href="/(auth)/cadastro" asChild>
              <Button mode="text">Ainda não é associado? Cadastre-se</Button>
            </Link>
            <Link href="/(auth)/vincular-conta" asChild>
              <Button mode="text">Já é associado mas nunca acessou? Vincular conta</Button>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAF7F1" },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 4 },
  header: { alignItems: "center", marginBottom: 24, gap: 4 },
  title: { fontWeight: "700", color: "#7A2331" },
  subtitle: { color: "#5B5147" },
  field: { marginBottom: 4 },
  erroLogin: { color: "#B3261E", marginBottom: 8, textAlign: "center" },
  buttonContent: { paddingVertical: 6 },
  linksContainer: { marginTop: 24, gap: 4 },
});
