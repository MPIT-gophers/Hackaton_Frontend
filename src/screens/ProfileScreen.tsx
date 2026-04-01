import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HeaderBack } from '../components/HeaderBack';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { RoundedInput } from '../components/RoundedInput';
import { ScreenContainer } from '../components/ScreenContainer';
import { Toggle } from '../components/Toggle';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { state, actions } = useAppContext();
  const [fullNameDraft, setFullNameDraft] = useState(state.profile.fullName);
  const [phoneDraft, setPhoneDraft] = useState(state.profile.phone);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaveError(null);
    setIsSaving(true);

    try {
      const normalizedFullName = fullNameDraft.trim();
      const normalizedPhone = phoneDraft.trim();

      await actions.saveProfileIdentity(normalizedFullName, normalizedPhone);
      setFullNameDraft(normalizedFullName);
      setPhoneDraft(normalizedPhone);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Не удалось сохранить профиль');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer keyboardShouldPersistTaps="handled" scrollable>
      <HeaderBack onPress={navigation.goBack} title="Профиль" />

      <View style={styles.avatarWrap}>
        <ProfileAvatar />
      </View>

      <Text style={styles.name}>{fullNameDraft || 'USER NAME'}</Text>

      <View style={styles.stack}>
        <RoundedInput bright onChangeText={setFullNameDraft} placeholder="Ваше имя" testID="profile-full-name-input" value={fullNameDraft} />
        <RoundedInput
          bright
          keyboardType="phone-pad"
          onChangeText={setPhoneDraft}
          placeholder="Телефон"
          testID="profile-phone-input"
          value={phoneDraft}
        />

        <View style={styles.toggleField}>
          <Text style={styles.toggleLabel}>Уведомление</Text>
          <Toggle onPress={actions.toggleNotifications} testID="profile-notifications-toggle" value={state.profile.notificationsEnabled} />
        </View>

        <RoundedInput bright onChangeText={actions.updateAbout} placeholder="Расскажи о себе" testID="profile-about-input" value={state.profile.about} />

        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

        <PrimaryButton loading={isSaving} onPress={handleSave} style={styles.saveButton} testID="profile-save-button" title="Сохранить" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    alignItems: 'center',
    marginTop: 30
  },
  name: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 26,
    lineHeight: 31,
    marginTop: 30,
    textAlign: 'center'
  },
  stack: {
    gap: 10,
    marginTop: 15
  },
  toggleField: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceBright,
    borderRadius: theme.radii.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: 15,
    paddingVertical: 13,
    ...theme.shadows.card
  },
  toggleLabel: {
    color: theme.colors.text,
    fontFamily: theme.typography.regular,
    fontSize: 20,
    lineHeight: 24
  },
  errorText: {
    color: theme.colors.danger,
    fontFamily: theme.typography.medium,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 4,
    textAlign: 'center'
  },
  saveButton: {
    marginTop: 8
  }
});
