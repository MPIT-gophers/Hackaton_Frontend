import { useEffect, useRef } from 'react';
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
  const hasSeenFocusRef = useRef(false);
  const { refreshEvents, startEventDraft } = actions;

  const openProfile = () => navigation.navigate('Profile');
  const openForm = () => {
    startEventDraft();
    navigation.navigate('EventForm');
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!hasSeenFocusRef.current) {
        hasSeenFocusRef.current = true;
        return;
      }

      if (!state.session.isAuthenticated) {
        return;
      }

      void refreshEvents().catch(() => {});
    });

    return unsubscribe;
  }, [navigation, refreshEvents, state.session.isAuthenticated]);

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
              <Image source={imageAssets.mascot} style={styles.mascotImage} />
              <MascotShadowIcon />
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
    alignSelf: 'flex-start',
    marginTop: 2
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 2
  },
  emptyHero: {
    alignItems: 'center',
    marginTop: 176
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
    marginTop: 24,
    width: '100%'
  },
  mascotImage: {
    height: 180,
    marginBottom: -30,
    width: 190,
    zIndex: 1
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
