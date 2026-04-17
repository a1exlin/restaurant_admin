import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { BRAND_SITE_URL, echoFivesLogo } from '../brand';

const COLORS = {
  bg: '#f5f5f0',
  card: '#ffffff',
  border: '#e5e4df',
  accent: '#2d6a4f',
  accentHover: '#1b4332',
  text: '#1a1a1a',
  textMuted: '#5c5c5c',
  errorBg: '#fef2f2',
  errorBorder: '#fecaca',
  errorText: '#b91c1c',
};

type Mode = 'login' | 'signup' | 'reset';

export function AuthScreen() {
  const { login, signup, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        const r = await login(email, password);
        if (!r.ok) setError(r.error);
      } else if (mode === 'signup') {
        const r = await signup(email, password, confirm);
        if (!r.ok) setError(r.error);
      } else {
        const r = await resetPassword(email, password, confirm);
        if (!r.ok) setError(r.error);
        else {
          setMode('login');
          setConfirm('');
          setPassword('');
          setError('Password reset successful. Log in with your new password.');
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => Linking.openURL(BRAND_SITE_URL)} activeOpacity={0.7}>
          <Image source={echoFivesLogo} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.title}>{mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Reset password'}</Text>
        <Text style={styles.subtitle}>Manager schedule builder</Text>

        <View style={styles.card}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor="#94a3b8"
          />
          <Text style={styles.label}>{mode === 'reset' ? 'New password' : 'Password'}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
            placeholderTextColor="#94a3b8"
          />
          {mode === 'signup' || mode === 'reset' ? (
            <>
              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                style={styles.input}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                placeholder="Repeat password"
                placeholderTextColor="#94a3b8"
              />
            </>
          ) : null}
          <TouchableOpacity
            style={[styles.primaryBtn, busy && styles.primaryBtnDisabled]}
            onPress={submit}
            disabled={busy}
          >
            <Text style={styles.primaryBtnText}>
              {mode === 'login' ? 'Log in' : mode === 'signup' ? 'Sign up' : 'Reset password'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.switchRow}
          onPress={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setError('');
            setConfirm('');
          }}
        >
          <Text style={styles.switchText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Text style={styles.switchLink}>{mode === 'login' ? 'Sign up' : 'Log in'}</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchRow}
          onPress={() => {
            setMode(mode === 'reset' ? 'login' : 'reset');
            setError('');
            setPassword('');
            setConfirm('');
          }}
        >
          <Text style={styles.switchText}>
            <Text style={styles.switchLink}>{mode === 'reset' ? 'Back to sign in' : 'Forgot password?'}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
    alignItems: 'center',
  },
  logo: {
    height: 48,
    width: 160,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 28,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: COLORS.errorText,
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 14,
  },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchRow: {
    marginTop: 24,
    padding: 8,
  },
  switchText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  switchLink: {
    color: COLORS.accent,
    fontWeight: '600',
  },
});
