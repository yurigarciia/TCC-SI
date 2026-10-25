import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Surface, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { LogoMark } from "@/components/logo-mark";
import { ErrorSnackbar } from "@/components/error-snackbar";
import { useLogin } from "@/features/auth/use-login";
import { ApiError } from "@/lib/api-client";
import { corIconeCampo, cores } from "@/theme/paper-theme";

const loginSchema = z.object({
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  senha: z.string().min(1, "Informe a senha."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const RAIO_CAMPO = 14;

export default function LoginScreen() {
  const login = useLogin();
  const [senhaVisivel, setSenhaVisivel] = useState(false);
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
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
            {/* Achado numa conversa com o usuário: a tela de entrada não precisa do cabeçalho em
                gradiente com título/subtítulo "de etapa" (esse é o papel do cadastro/vincular-
                conta) — mas só a logo sozinha, sem nenhum texto, ficou estranha/fria demais;
                marca + uma linha de boas-vindas resolve isso sem reintroduzir o banner. */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[cores.sidebarAtivo, cores.primariaClara]}
                style={styles.logoHalo}
              >
                <View style={styles.logoChip}>
                  <LogoMark size={56} />
                </View>
              </LinearGradient>
              <Text variant="headlineSmall" style={styles.marca}>
                Querência ERP
              </Text>
              <Text variant="bodyMedium" style={styles.boasVindas}>
                Bem-vindo(a) de volta! Acesse sua conta de associado.
              </Text>
            </View>

            <Surface style={styles.card} elevation={2}>
              <View style={styles.faixaTopo} />
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <TextInput
                    mode="outlined"
                    label="E-mail"
                    placeholder="voce@exemplo.com"
                    left={<TextInput.Icon icon="email-outline" color={corIconeCampo} />}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={!!errors.email}
                    style={styles.field}
                    outlineStyle={styles.outlineCampo}
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
                    left={<TextInput.Icon icon="lock-outline" color={corIconeCampo} />}
                    right={
                      <TextInput.Icon
                        icon={senhaVisivel ? "eye-off-outline" : "eye-outline"}
                        color={corIconeCampo}
                        accessibilityLabel={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                        onPress={() => setSenhaVisivel((atual) => !atual)}
                      />
                    }
                    secureTextEntry={!senhaVisivel}
                    autoComplete="password"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={!!errors.senha}
                    style={styles.field}
                    outlineStyle={styles.outlineCampo}
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

            <View style={styles.divisorLinha}>
              <View style={styles.divisorTraco} />
              <Text style={styles.divisorTexto}>ou</Text>
              <View style={styles.divisorTraco} />
            </View>

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
  safeArea: { flex: 1, backgroundColor: cores.fundo },
  scroll: { flexGrow: 1, backgroundColor: cores.fundo },
  logoContainer: { alignItems: "center", paddingTop: 40, paddingBottom: 24, gap: 4 },
  // Halo em gradiente âmbar→verde-claro atrás da logo — dá cor à tela de entrada sem reintroduzir
  // o banner em gradiente de topo (removido antes, de propósito). A logo em si precisa continuar
  // sobre um chip claro opaco (ver logo-mark.tsx): o halo é só o anel por trás.
  logoHalo: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  logoChip: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FDF8F3",
    alignItems: "center",
    justifyContent: "center",
  },
  marca: { color: cores.primaria, fontWeight: "700", marginTop: 8 },
  boasVindas: { color: cores.textoSecundario, textAlign: "center", paddingHorizontal: 32 },
  card: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    gap: 4,
    overflow: "hidden",
  },
  // Faixa colorida no topo do card — mesmo raciocínio do halo: dá cor sem virar outro banner.
  faixaTopo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: cores.primaria,
  },
  field: { backgroundColor: "#FFFFFF" },
  outlineCampo: { borderRadius: RAIO_CAMPO },
  erroCampo: { color: "#B3261E", fontSize: 12, marginTop: -4, marginLeft: 4 },
  button: { marginTop: 12, borderRadius: 12 },
  buttonContent: { paddingVertical: 6 },
  divisorLinha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 32,
  },
  divisorTraco: { flex: 1, height: 1, backgroundColor: cores.contorno },
  divisorTexto: { color: cores.textoSecundario, fontSize: 12, fontWeight: "600" },
  linksContainer: { marginTop: 4, paddingHorizontal: 8, gap: 2, paddingBottom: 24 },
});
