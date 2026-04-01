import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { getImageAsset } from '../data/assets';
import { BackendEvent } from '../domain/types';
import { theme } from '../theme';
import { formatDateDisplay } from '../utils/date';

type EventCardProps = {
  event: BackendEvent;
  imageKey?: 'venueCover1' | 'venueCover2';
  onPress?: () => void;
};

export function EventCard({ event, imageKey = 'venueCover1', onPress }: EventCardProps) {
  const content = (
    <View style={styles.card}>
      <View style={styles.media}>
        <Image source={getImageAsset(imageKey)} style={styles.image} />
        <Text style={styles.venueName}>{event.city || 'Мероприятие'}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.meta}>{formatDateDisplay(event.eventDate) || event.eventDate || 'Дата не указана'}</Text>
        <Text style={styles.meta}>{event.eventTime || '14:00'}</Text>
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.pressable, pressed ? styles.pressed : undefined]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: theme.radii.xl
  },
  pressed: {
    opacity: 0.96
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
    ...theme.shadows.card
  },
  media: {
    height: 187,
    overflow: 'hidden'
  },
  image: {
    height: '100%',
    width: '100%'
  },
  venueName: {
    bottom: 15,
    color: theme.colors.surfaceBright,
    fontFamily: theme.typography.medium,
    fontSize: 20,
    left: 15,
    lineHeight: 24,
    position: 'absolute'
  },
  body: {
    paddingHorizontal: 15,
    paddingVertical: 15
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 6
  },
  meta: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22
  }
});
