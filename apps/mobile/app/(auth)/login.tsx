import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      await AsyncStorage.setItem("token", res.token);
      await AsyncStorage.setItem("user", JSON.stringify(res.user));
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("エラー", err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoCheck}>✓</Text>
          </View>
          <Text style={styles.appName}>TaskApp</Text>
          <Text style={styles.subtitle}>アカウントにサインイン</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>メールアドレス</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>パスワード</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#999"
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "サインイン中..." : "サインイン"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.linkText}>アカウントをお持ちでない方は 新規登録</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  logoContainer: { alignItems: "center", marginBottom: 40 },
  logo: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: "#db4035",
    alignItems: "center", justifyContent: "center",
    marginBottom: 12,
  },
  logoCheck: { color: "white", fontSize: 28, fontWeight: "bold" },
  appName: { fontSize: 24, fontWeight: "600", color: "#202020" },
  subtitle: { fontSize: 14, color: "#6b6b6b", marginTop: 4 },
  form: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  label: { fontSize: 13, fontWeight: "500", color: "#6b6b6b", marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: "#202020",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#db4035", borderRadius: 8,
    paddingVertical: 12, alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "white", fontSize: 15, fontWeight: "600" },
  linkText: { textAlign: "center", color: "#6b6b6b", fontSize: 13, marginTop: 16 },
});
