import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Surface, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { AuthHeader } from "@/components/auth-header";
import { ErrorSnackbar } from "@/components/error-snackbar";
import { useVincularConta } from "@/features/auth/use-vincular-conta";
import { ApiError } from "@/lib/api-client";
import { corIconeCampo, cores } from "@/theme/paper-theme";

const RAIO_CAMPO = 14;

const vincularSchema = z.object({
  cpf: z.string().min(11, "Informe um CPF válido (11 dígitos).").max(11),
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido.").max(255),
  senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres.").max(72),
});

type VincularFormValues = z.infer<typeof vincularSchema>;

// RF01 (canal associado) — para quem já foi cadastrado pela diretoria (cadastro mediado, sem
// login ainda) e precisa criar a própria senha pra acessar o app pela primeira vez (T-BE-014).
export default function VincularContaScreen() {
  const vincular = useVincularConta();
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VincularFormValues>({
    resolver: zodResolver(vincularSchema),
    defaultValues: { cpf: "", email: "", senha: "" },
  });

  const onSubmit = handleSubmit((dados) => vincular.mutate(dados));

  return (
    <View style={styles.flex}>
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
            <AuthHeader
              titulo="Vincular conta"
              subtitulo="Informe o CPF que a diretoria já cadastrou e defina uma senha"
              icone="link-variant"
              mostrarVoltar
            />

            <Surface style={styles.card} elevation={2}>
              <View style={styles.faixaTopo} />
              <Controller
                control={control}
                name="cpf"
                render={({ field }) => (
                  <View>
                    <TextInput
                      mode="outlined"
                      label="CPF"
                      placeholder="Somente números"
                      left={<TextInput.Icon icon="card-account-details-outline" color={corIconeCampo} />}
                      keyboardType="number-pad"
                      maxLength={11}
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={!!errors.cpf}
                      style={styles.field}
                      outlineStyle={styles.outlineCampo}
                    />
                    {errors.cpf && <Text style={styles.erroCampo}>{errors.cpf.message}</Text>}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <View>
                    <TextInput
                      mode="outlined"
                      label="E-mail (login)"
                      placeholder="voce@exemplo.com"
                      left={<TextInput.Icon icon="email-outline" color={corIconeCampo} />}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      maxLength={255}
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={!!errors.email}
                      style={styles.field}
                      outlineStyle={styles.outlineCampo}
                    />
                    {errors.email && <Text style={styles.erroCampo}>{errors.email.message}</Text>}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="senha"
                render={({ field }) => (
                  <View>
                    <TextInput
                      mode="outlined"
                      label="Senha"
                      placeholder="Pelo menos 6 caracteres"
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
                      maxLength={72}
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={!!errors.senha}
                      style={styles.field}
                      outlineStyle={styles.outlineCampo}
                    />
                    {errors.senha && <Text style={styles.erroCampo}>{errors.senha.message}</Text>}
                  </View>
                )}
              />

              <Button
                mode="contained"
                onPress={onSubmit}
                loading={vincular.isPending}
                disabled={vincular.isPending}
                contentStyle={styles.buttonContent}
                style={styles.button}
                icon="link-variant"
              >
                Vincular conta
              </Button>
            </Surface>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ErrorSnackbar
        visible={vincular.isError}
        mensagem={
          vincular.error instanceof ApiError
            ? vincular.error.message
            : "Não foi possível vincular a conta. Tente novamente."
        }
        onDismiss={() => vincular.reset()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: cores.sidebar },
  scroll: { flexGrow: 1, backgroundColor: "#FAF7F1" },
  card: {
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    gap: 4,
    overflow: "hidden",
  },
  // Faixa colorida no topo do card — mesmo recurso das outras telas de autenticação.
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
  erroCampo: { color: "#B3261E", fontSize: 12, marginTop: -4, marginBottom: 4, marginLeft: 4 },
  button: { marginTop: 12, borderRadius: 12 },
  buttonContent: { paddingVertical: 6 },
});
