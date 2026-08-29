import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
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
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text variant="bodyMedium" style={styles.intro}>
            Depois de enviado, seu cadastro fica pendente até a diretoria validar.
          </Text>

          {CAMPOS.map(({ nome, label, props }) => (
            <Controller
              key={nome}
              control={control}
              name={nome}
              render={({ field }) => (
                <View style={styles.field}>
                  <TextInput
                    mode="outlined"
                    label={label}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={!!errors[nome]}
                    {...props}
                  />
                  <HelperText type="error" visible={!!errors[nome]}>
                    {errors[nome]?.message}
                  </HelperText>
                </View>
              )}
            />
          ))}

          {autoCadastro.isError && (
            <Text style={styles.erro}>
              {autoCadastro.error instanceof ApiError
                ? autoCadastro.error.message
                : "Não foi possível concluir o cadastro. Tente novamente."}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={onSubmit}
            loading={autoCadastro.isPending}
            disabled={autoCadastro.isPending}
            contentStyle={styles.buttonContent}
          >
            Criar conta
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const CAMPOS: {
  nome: keyof CadastroFormValues;
  label: string;
  props?: React.ComponentProps<typeof TextInput>;
}[] = [
  { nome: "nome", label: "Nome completo" },
  { nome: "cpf", label: "CPF", props: { keyboardType: "number-pad" } },
  { nome: "contato", label: "Telefone ou e-mail de contato" },
  {
    nome: "email",
    label: "E-mail (login)",
    props: { autoCapitalize: "none", keyboardType: "email-address" },
  },
  { nome: "senha", label: "Senha", props: { secureTextEntry: true } },
];

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAF7F1" },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, gap: 4 },
  intro: { color: "#5B5147", marginBottom: 16 },
  field: { marginBottom: 4 },
  erro: { color: "#B3261E", marginBottom: 8, textAlign: "center" },
  buttonContent: { paddingVertical: 6 },
});
