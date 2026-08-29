import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Surface, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { AuthHeader } from "@/components/auth-header";
import { ErrorSnackbar } from "@/components/error-snackbar";
import { useVincularConta } from "@/features/auth/use-vincular-conta";
import { ApiError } from "@/lib/api-client";

const vincularSchema = z.object({
  cpf: z.string().min(11, "Informe um CPF válido (11 dígitos)."),
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

type VincularFormValues = z.infer<typeof vincularSchema>;

// RF01 (canal associado) — para quem já foi cadastrado pela diretoria (cadastro mediado, sem
// login ainda) e precisa criar a própria senha pra acessar o app pela primeira vez (T-BE-014).
export default function VincularContaScreen() {
  const vincular = useVincularConta();
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
              <Controller
                control={control}
                name="cpf"
                render={({ field }) => (
                  <View>
                    <TextInput
                      mode="outlined"
                      label="CPF"
                      placeholder="Somente números"
                      left={<TextInput.Icon icon="card-account-details-outline" />}
                      keyboardType="number-pad"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={!!errors.cpf}
                      style={styles.field}
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
                      left={<TextInput.Icon icon="email-outline" />}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={!!errors.email}
                      style={styles.field}
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
                      left={<TextInput.Icon icon="lock-outline" />}
                      secureTextEntry
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={!!errors.senha}
                      style={styles.field}
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
