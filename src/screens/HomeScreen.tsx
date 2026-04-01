import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventCard } from '../components/EventCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { MascotShadowIcon, ProfileOutlineIcon } from '../components/icons';
import { useAppContext } from '../context/AppContext';
import { imageAssets } from '../data/assets';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { state, actions } = useAppContext();

  const openProfile = () => navigation.navigate('Profile');
  const openForm = () => {
    actions.startEventDraft();
    navigation.navigate('EventForm');
  };

  return (
    <ScreenContainer>
      <Pressable accessibilityRole="button" onPress={openProfile} style={styles.profileButton} testID="home-profile-button">
        <ProfileOutlineIcon />
      </Pressable>

      {state.events.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyHero}>
            <Text style={styles.emptyHeadline}>У вас на данный момент{`\n`}нет мероприятий</Text>

            <View style={styles.mascotWrap}>
              <View style={styles.shadowWrap}>
                <MascotShadowIcon />
              </View>
              <Image source={imageAssets.mascot} style={styles.mascotImage} />
            </View>
          </View>

          <PrimaryButton onPress={openForm} style={styles.emptyButton} testID="home-create-button" title="Создать мероприятие!" />
        </View>
      ) : (
        <View style={styles.filledWrap}>
          <ScrollView contentContainerStyle={styles.eventsList} showsVerticalScrollIndicator={false}>
            {state.events.map((event, index) => (
              <EventCard
                event={event}
                imageKey={index % 2 === 0 ? 'venueCover1' : 'venueCover2'}
                key={event.id}
                onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
              />
            ))}
            <View style={styles.eventsBottomSpacer} />
          </ScrollView>

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
    flex: 1,
    justifyContent: 'space-between'
  },
  emptyHero: {
    alignItems: 'center',
    marginTop: 165
  },
  emptyHeadline: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 26,
    lineHeight: 31,
    textAlign: 'center'
  },
  emptyButton: {
    marginTop: 24
  },
  mascotWrap: {
    alignItems: 'center',
    marginTop: 42,
    width: '100%'
  },
  shadowWrap: {
    marginBottom: -28,
    transform: [{ scale: 0.84 }]
  },
  mascotImage: {
    height: 188,
    width: 190
  },
  filledWrap: {
    flex: 1,
    marginTop: 30
  },
  eventsList: {
    gap: 15,
    paddingBottom: 20
  },
  eventsBottomSpacer: {
    height: 106
  },
  addButton: {
    marginTop: 12
  }
});
