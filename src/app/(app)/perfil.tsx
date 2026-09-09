import { useSessao } from "@/context/SessaoContext";
import {
  atualizarSenha,
  atualizarUsuario,
  buscarUsuarioPorEmail,
} from "@/services/autenticacao.service";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Paleta do projeto (tailwind.config.js)
const C = {
  primary: "#1E3A2F",
  surface: "#F5F0E8",
  amber: "#E8A838",
  golden: "#D4921E",
  goldenPale: "#F2D9A0",
  muted: "#9E9589",
  border: "#D8D1C7",
  greenMedium: "#A8C5A0",
  white: "#ffffff",
  gray900: "#111827",
  gray700: "#374151",
  red: "#EF4444",
};

const SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
};

export default function TelaPerfil() {
  const { sessao, sair, atualizarPerfil } = useSessao();

  // Dados do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");

  // Valores originais para detectar mudanças
  const [originais, setOriginais] = useState({ nome: "", email: "", telefone: "" });

  // UI
  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState("");

  // Modal de senha
  const [mostrarModalSenha, setMostrarModalSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  // Toast
  const toastOpacity = useSharedValue(0);
  const estiloToast = useAnimatedStyle(() => ({ opacity: toastOpacity.value }));

  const temAlteracoes =
    nome !== originais.nome ||
    email !== originais.email ||
    telefone !== originais.telefone;

  const carregarUsuario = useCallback(async () => {
    if (!sessao?.email) return;
    const usuario = await buscarUsuarioPorEmail(sessao.email);
    if (!usuario) return;
    setNome(usuario.nome);
    setEmail(usuario.email);
    setTelefone(usuario.telefone);
    setCpf(usuario.cpf);
    setOriginais({ nome: usuario.nome, email: usuario.email, telefone: usuario.telefone });
  }, [sessao?.email]);

  useEffect(() => {
    carregarUsuario();
  }, [carregarUsuario]);

  const exibirToast = () => {
    toastOpacity.value = withTiming(1, { duration: 200 });
    setTimeout(() => {
      toastOpacity.value = withTiming(0, { duration: 400 });
    }, 2500);
  };

  const aoSalvar = async () => {
    if (!sessao?.email) return;

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();
    const telefoneLimpo = telefone.trim();

    if (!nomeLimpo) { setErroSalvar("Nome não pode estar vazio."); return; }
    if (!emailLimpo) { setErroSalvar("E-mail não pode estar vazio."); return; }

    setSalvando(true);
    setErroSalvar("");

    const resultado = await atualizarUsuario(sessao.email, {
      nome: nomeLimpo,
      email: emailLimpo,
      telefone: telefoneLimpo,
    });

    if (!resultado.ok) {
      setErroSalvar(
        resultado.error === "email_taken"
          ? "Este e-mail já está em uso."
          : "Erro ao salvar. Tente novamente."
      );
      setSalvando(false);
      return;
    }

    // Sincroniza sessão em memória se nome ou email mudaram
    const alteracoesSessao: { nome?: string; email?: string } = {};
    if (nomeLimpo !== originais.nome) alteracoesSessao.nome = nomeLimpo;
    if (resultado.novoEmail !== originais.email) alteracoesSessao.email = resultado.novoEmail;
    if (Object.keys(alteracoesSessao).length > 0) {
      await atualizarPerfil(alteracoesSessao);
    }

    setNome(nomeLimpo);
    setEmail(resultado.novoEmail);
    setTelefone(telefoneLimpo);
    setOriginais({ nome: nomeLimpo, email: resultado.novoEmail, telefone: telefoneLimpo });
    setSalvando(false);
    exibirToast();
  };

  const aoSair = () => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await sair();
          router.replace("/");
        },
      },
    ]);
  };

  const aoAlterarSenha = async () => {
    setErroSenha("");
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErroSenha("Preencha todos os campos.");
      return;
    }
    if (novaSenha.length < 6) {
      setErroSenha("Nova senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErroSenha("As senhas não coincidem.");
      return;
    }

    if (!sessao?.email) return;
    setSalvandoSenha(true);
    const resultado = await atualizarSenha(sessao.email, senhaAtual, novaSenha);
    setSalvandoSenha(false);

    if (!resultado.ok) {
      setErroSenha(
        resultado.error === "wrong_password"
          ? "Senha atual incorreta."
          : "Erro ao alterar senha. Tente novamente."
      );
      return;
    }

    setMostrarModalSenha(false);
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    exibirToast();
  };

  const fecharModalSenha = () => {
    setMostrarModalSenha(false);
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setErroSenha("");
  };

  const inicial = nome[0]?.toUpperCase() ?? sessao?.nome[0]?.toUpperCase() ?? "U";

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: temAlteracoes ? 120 : 48 }}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.navRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={22} color={C.white} />
              </TouchableOpacity>
              <Text style={styles.navTitle}>Meu Perfil</Text>
              <View style={{ width: 38 }} />
            </View>

            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>{inicial}</Text>
              </View>
              <View style={styles.avatarEditBadge}>
                <Ionicons name="create" size={11} color={C.white} />
              </View>
            </View>

            <Text style={styles.userName}>
              {nome || sessao?.nome || "Usuário"}
            </Text>
            <Text style={styles.planLabel}>Plano Gratuito</Text>
          </View>

          {/* ── Conteúdo ── */}
          <View style={styles.content}>

            {/* Dados pessoais */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Dados pessoais</Text>
              <View style={styles.card}>
                <View style={[styles.fieldRow, styles.fieldBorder]}>
                  <Text style={styles.fieldLabel}>Nome completo</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={nome}
                    onChangeText={setNome}
                    autoCapitalize="words"
                    returnKeyType="next"
                    underlineColorAndroid="transparent"
                    placeholderTextColor={C.muted}
                  />
                </View>

                <View style={[styles.fieldRow, styles.fieldBorder]}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    underlineColorAndroid="transparent"
                    placeholderTextColor={C.muted}
                  />
                </View>

                <View style={[styles.fieldRow, styles.fieldBorder]}>
                  <Text style={styles.fieldLabel}>WhatsApp</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={telefone}
                    onChangeText={setTelefone}
                    keyboardType="phone-pad"
                    returnKeyType="done"
                    underlineColorAndroid="transparent"
                    placeholderTextColor={C.muted}
                  />
                </View>

                {/* CPF — somente leitura */}
                <View style={[styles.fieldRow, styles.rowCentered]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>CPF • não editável</Text>
                    <Text style={styles.fieldText}>{cpf}</Text>
                  </View>
                  <Ionicons name="lock-closed" size={16} color={C.amber} />
                </View>
              </View>

              {erroSalvar !== "" && (
                <Text style={styles.errorText}>{erroSalvar}</Text>
              )}
            </View>

            {/* Segurança */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Segurança</Text>
              <View style={styles.card}>
                <TouchableOpacity
                  style={[styles.fieldRow, styles.fieldBorder, styles.rowCentered]}
                  onPress={() => setMostrarModalSenha(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.fieldText, { flex: 1 }]}>Alterar senha</Text>
                  <Ionicons name="chevron-forward" size={16} color={C.muted} />
                </TouchableOpacity>

                <View style={[styles.fieldRow, styles.rowCentered]}>
                  <Text style={[styles.fieldText, { flex: 1 }]}>
                    Notificações WhatsApp
                  </Text>
                  <Switch
                    value={notifWhatsapp}
                    onValueChange={setNotifWhatsapp}
                    trackColor={{ false: "rgba(0,0,0,0.15)", true: C.amber }}
                    thumbColor={C.white}
                  />
                </View>
              </View>
            </View>

            {/* Conta */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Conta</Text>
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.upgradeBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="star" size={16} color={C.amber} />
                  <Text style={styles.upgradeText}>Upgrade para Afetto Plus</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={aoSair}
                  style={styles.logoutBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.logoutText}>Sair da conta</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Botão salvar fixo (aparece só quando há mudanças) ── */}
      {temAlteracoes && (
        <View style={styles.saveContainer}>
          <TouchableOpacity
            onPress={aoSalvar}
            disabled={salvando}
            style={[styles.saveBtn, salvando && { opacity: 0.7 }]}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>
              {salvando ? "Salvando..." : "Salvar alterações"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Toast de sucesso ── */}
      <Animated.View style={[styles.toast, estiloToast]} pointerEvents="none">
        <Ionicons name="checkmark-circle" size={18} color={C.white} />
        <Text style={styles.toastText}>Salvo com sucesso!</Text>
      </Animated.View>

      {/* ── Modal alterar senha ── */}
      <Modal
        transparent
        visible={mostrarModalSenha}
        animationType="slide"
        onRequestClose={fecharModalSenha}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alterar senha</Text>
              <TouchableOpacity onPress={fecharModalSenha} hitSlop={8}>
                <Ionicons name="close" size={22} color={C.muted} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              <View style={styles.modalField}>
                <Text style={styles.fieldLabel}>Senha atual</Text>
                <TextInput
                  style={styles.modalInput}
                  value={senhaAtual}
                  onChangeText={setSenhaAtual}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={C.muted}
                  underlineColorAndroid="transparent"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.fieldLabel}>Nova senha</Text>
                <TextInput
                  style={styles.modalInput}
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={C.muted}
                  underlineColorAndroid="transparent"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.fieldLabel}>Confirmar nova senha</Text>
                <TextInput
                  style={styles.modalInput}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={C.muted}
                  underlineColorAndroid="transparent"
                  returnKeyType="done"
                  onSubmitEditing={aoAlterarSenha}
                />
              </View>

              {erroSenha !== "" && (
                <Text style={styles.errorText}>{erroSenha}</Text>
              )}

              <TouchableOpacity
                onPress={aoAlterarSenha}
                disabled={salvandoSenha}
                style={[styles.saveBtn, { marginTop: 4 }, salvandoSenha && { opacity: 0.7 }]}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>
                  {salvandoSenha ? "Confirmando..." : "Confirmar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.surface,
  },

  // ── Header ──
  header: {
    backgroundColor: C.primary,
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    color: C.white,
    fontSize: 16,
    fontWeight: "600",
  },
  avatarWrapper: {
    position: "relative",
    alignSelf: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 2.5,
    borderColor: C.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: "700",
    color: C.white,
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.amber,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.primary,
  },
  userName: {
    color: C.white,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },
  planLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    marginTop: 4,
  },

  // ── Conteúdo ──
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    ...SHADOW,
  },
  fieldRow: {
    paddingVertical: 14,
  },
  fieldBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  rowCentered: {
    flexDirection: "row",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 11,
    color: C.muted,
    fontWeight: "500",
    marginBottom: 4,
  },
  fieldInput: {
    fontSize: 15,
    color: C.gray900,
    padding: 0,
    margin: 0,
  },
  fieldText: {
    fontSize: 15,
    color: C.gray900,
  },
  errorText: {
    color: C.red,
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 4,
  },

  // ── Segurança ──
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: C.amber,
    borderRadius: 12,
    paddingVertical: 14,
    marginVertical: 8,
  },
  upgradeText: {
    color: C.amber,
    fontSize: 15,
    fontWeight: "600",
  },
  logoutBtn: {
    alignItems: "center",
    paddingVertical: 14,
  },
  logoutText: {
    color: C.red,
    fontSize: 14,
    fontWeight: "500",
  },

  // ── Botão salvar fixo ──
  saveContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 12,
    backgroundColor: "rgba(245, 240, 232, 0.96)",
  },
  saveBtn: {
    backgroundColor: C.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  saveBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "600",
  },

  // ── Toast ──
  toast: {
    position: "absolute",
    top: 56,
    left: 20,
    right: 20,
    backgroundColor: C.greenMedium,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...SHADOW,
  },
  toastText: {
    color: C.white,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },

  // ── Modal senha ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.primary,
  },
  modalField: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: C.white,
  },
  modalInput: {
    fontSize: 15,
    color: C.gray900,
    paddingVertical: 8,
    padding: 0,
  },
});
