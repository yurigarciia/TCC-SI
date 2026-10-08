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
import { buscarEnderecoPorCep } from "@/lib/cep";

const enderecoSchema = z.object({
  cep: z.string().min(8, "CEP inválido."),
  logradouro: z.string().min(2, "Informe o logradouro."),
  numero: z.string().min(1, "Informe o número."),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Informe o bairro."),
  cidade: z.string().min(2, "Informe a cidade."),
  uf: z.string().length(2, "Informe a UF (2 letras)."),
});

const cadastroSchema = z.object({
  nome: z.string().min(3, "Informe seu nome completo."),
  cpf: z.string().min(11, "Informe um CPF válido (11 dígitos)."),
  contato: z.string().min(8, "Informe um telefone ou e-mail de contato."),
  endereco: enderecoSchema,
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

type CadastroFormValues = z.infer<typeof cadastroSchema>;
type EnderecoFormValues = CadastroFormValues["endereco"];

// RF01 (canal associado) — cadastro público, entra "Pendente de validação" até a diretoria
// aprovar (cadastro-associado.json). Mesmos campos pessoais/endereço do form de auto-cadastro do
// painel web (frontend-web/src/app/(painel)/associados/novo), sem categoria/vínculo
// institucional aqui — isso é preenchido pela diretoria depois, na aprovação.
export default function CadastroScreen() {
  const autoCadastro = useAutoCadastro();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CadastroFormValues>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      contato: "",
      endereco: {
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        uf: "",
      },
      email: "",
      senha: "",
    },
  });

  const aoSairDoCep = async (cep: string) => {
    const encontrado = await buscarEnderecoPorCep(cep);
    if (!encontrado) return;
    setValue("endereco.logradouro", encontrado.logradouro, { shouldValidate: true });
    setValue("endereco.bairro", encontrado.bairro, { shouldValidate: true });
    setValue("endereco.cidade", encontrado.localidade, { shouldValidate: true });
    setValue("endereco.uf", encontrado.uf, { shouldValidate: true });
  };

  const onSubmit = handleSubmit((dados) =>
    autoCadastro.mutate({
      ...dados,
      endereco: { ...dados.endereco, complemento: dados.endereco.complemento || undefined },
    }),
  );

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
              {CAMPOS_PESSOAIS.map(({ nome, label, placeholder, icone, props }) => (
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

              <Text variant="labelLarge" style={styles.secao}>
                Endereço
              </Text>

              {CAMPOS_ENDERECO.map(({ nome, label, placeholder, icone, props }) => (
                <Controller
                  key={nome}
                  control={control}
                  name={`endereco.${nome}` as const}
                  render={({ field }) => (
                    <View>
                      <TextInput
                        mode="outlined"
                        label={label}
                        placeholder={placeholder}
                        left={<TextInput.Icon icon={icone} />}
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={() => {
                          field.onBlur();
                          if (nome === "cep") void aoSairDoCep(field.value ?? "");
                        }}
                        error={!!errors.endereco?.[nome]}
                        style={styles.field}
                        {...props}
                      />
                      {errors.endereco?.[nome] && (
                        <Text style={styles.erroCampo}>{errors.endereco[nome]?.message}</Text>
                      )}
                    </View>
                  )}
                />
              ))}

              {CAMPOS_CONTA.map(({ nome, label, placeholder, icone, props }) => (
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

interface CampoConfig<T extends string> {
  nome: T;
  label: string;
  placeholder: string;
  icone: keyof typeof MaterialCommunityIcons.glyphMap;
  props?: React.ComponentProps<typeof TextInput>;
}

type CampoSimples = Exclude<keyof CadastroFormValues, "endereco">;

const CAMPOS_PESSOAIS: CampoConfig<CampoSimples>[] = [
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
];

const CAMPOS_ENDERECO: CampoConfig<keyof EnderecoFormValues>[] = [
  {
    nome: "cep",
    label: "CEP",
    placeholder: "00000-000",
    icone: "map-marker-outline",
    props: { keyboardType: "number-pad" },
  },
  { nome: "logradouro", label: "Logradouro", placeholder: "Rua, avenida...", icone: "road-variant" },
  {
    nome: "numero",
    label: "Número",
    placeholder: "123",
    icone: "pound",
    props: { keyboardType: "number-pad" },
  },
  {
    nome: "complemento",
    label: "Complemento (opcional)",
    placeholder: "Apto, bloco...",
    icone: "home-city-outline",
  },
  { nome: "bairro", label: "Bairro", placeholder: "Centro", icone: "home-group" },
  { nome: "cidade", label: "Cidade", placeholder: "Santa Maria", icone: "city-variant-outline" },
  {
    nome: "uf",
    label: "UF",
    placeholder: "RS",
    icone: "map-outline",
    props: { autoCapitalize: "characters", maxLength: 2 },
  },
];

const CAMPOS_CONTA: CampoConfig<CampoSimples>[] = [
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
  secao: { marginTop: 8, marginBottom: 4, marginLeft: 4, color: "#7A2331" },
  erroCampo: { color: "#B3261E", fontSize: 12, marginTop: -4, marginBottom: 4, marginLeft: 4 },
  button: { marginTop: 12, borderRadius: 12 },
  buttonContent: { paddingVertical: 6 },
});
