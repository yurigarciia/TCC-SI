import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
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
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text variant="bodyMedium" style={styles.intro}>
            Informe o CPF que a diretoria já cadastrou e defina uma senha de acesso.
          </Text>

          <Controller
            control={control}
            name="cpf"
            render={({ field }) => (
              <View style={styles.field}>
                <TextInput
                  mode="outlined"
                  label="CPF"
                  keyboardType="number-pad"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={!!errors.cpf}
                />
                <HelperText type="error" visible={!!errors.cpf}>
                  {errors.cpf?.message}
                </HelperText>
              </View>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <View style={styles.field}>
                <TextInput
                  mode="outlined"
                  label="E-mail (login)"
                  autoCapitalize="none"
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

          {vincular.isError && (
            <Text style={styles.erro}>
              {vincular.error instanceof ApiError
                ? vincular.error.message
                : "Não foi possível vincular a conta. Tente novamente."}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={onSubmit}
            loading={vincular.isPending}
            disabled={vincular.isPending}
            contentStyle={styles.buttonContent}
          >
            Vincular conta
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAF7F1" },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, gap: 4 },
  intro: { color: "#5B5147", marginBottom: 16 },
  field: { marginBottom: 4 },
  erro: { color: "#B3261E", marginBottom: 8, textAlign: "center" },
  buttonContent: { paddingVertical: 6 },
});
