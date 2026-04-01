import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventCard } from '../components/EventCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { MascotShadowIcon, ProfileOutlineIcon } from '../components/icons';
import { useAppContext } from '../context/AppContext';
import { imageAssets } from '../data/assets';
import { theme } from '../theme';
import { RootStackParamList } from '../navigation/types';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { state, actions } = useAppContext();

  const openProfile = () => navigation.navigate('Profile');
  const openForm = () => {
    actions.startEventDraft();
    navigation.navigate('EventForm');
  };

  return (
    <ScreenContainer scrollable>
      <Pressable accessibilityRole="button" onPress={openProfile} style={styles.profileButton} testID="home-profile-button">
        <ProfileOutlineIcon />
      </Pressable>

      {state.events.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyHeadline}>У вас на данный момент{`
`}нет мероприятий</Text>
          <PrimaryButton onPress={openForm} style={styles.emptyButton} testID="home-create-button" title="Создать мероприятие!" />
          <View style={styles.mascotWrap}>
            <View style={styles.shadowWrap}>
              <MascotShadowIcon />
            </View>
            <Image source={imageAssets.mascot} style={styles.mascotImage} />
          </View>
        </View>
      ) : (
        <View style={styles.filledWrap}>
          <View style={styles.eventsList}>
            {state.events.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </View>
          <View style={styles.eventsSpacer} />
          <PrimaryButton onPress={openForm} style={styles.addButton} title="Добавить мероприятие!" />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    alignSelf: 'flex-start'
  },
  emptyWrap: {
    alignItems: 'center',
    flex: 1
  },
  emptyHeadline: {
    color: theme.colors.text,
    fontFamily: theme.typography.semiBold,
    fontSize: 20,
    lineHeight: 24,
    marginTop: 106,
    textAlign: 'center'
  },
  emptyButton: {
    marginTop: 107
  },
  mascotWrap: {
    alignItems: 'center',
    marginTop: 30,
    width: '100%'
  },
  shadowWrap: {
    marginBottom: -30,
    transform: [{ scale: 0.94 }]
  },
  mascotImage: {
    height: 213,
    width: 194
  },
  filledWrap: {
    flex: 1,
    marginTop: 30
  },
  eventsList: {
    gap: 15
  },
  eventsSpacer: {
    flex: 1,
    minHeight: 28
  },
  addButton: {
    marginTop: 28
  }
});
