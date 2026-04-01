import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HeaderBack } from '../components/HeaderBack';
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

  return (
    <ScreenContainer>
      <HeaderBack onPress={navigation.goBack} title="Профиль" />

      <View style={styles.avatarWrap}>
        <ProfileAvatar />
      </View>

      <Text style={styles.name}>{state.profile.name}</Text>

      <View style={styles.stack}>
        <View style={styles.toggleField}>
          <Text style={styles.toggleLabel}>Уведомление</Text>
          <Toggle onPress={actions.toggleNotifications} testID="profile-notifications-toggle" value={state.profile.notificationsEnabled} />
        </View>

        <RoundedInput
          bright
          onChangeText={actions.updateAbout}
          placeholder="Расскажи о себе"
          testID="profile-about-input"
          value={state.profile.about}
        />
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
    fontFamily: theme.typography.semiBold,
    fontSize: 26,
    lineHeight: 31,
    marginTop: 30,
    textAlign: 'center'
  },
  stack: {
    gap: 10,
    marginTop: 30
  },
  toggleField: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceBright,
    borderRadius: theme.radii.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 15,
    paddingVertical: 11
  },
  toggleLabel: {
    color: theme.colors.text,
    fontFamily: theme.typography.regular,
    fontSize: 20,
    lineHeight: 24
  }
});
