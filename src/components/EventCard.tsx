import { Image, StyleSheet, Text, View } from 'react-native';

import { getImageAsset } from '../data/assets';
import { BookedEvent, Venue } from '../domain/types';
import { theme } from '../theme';

type EventCardProps = {
  event: BookedEvent;
  venue: Venue;
};

export function EventCard({ event, venue }: EventCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.media}>
        <Image source={getImageAsset(venue.imageKey)} style={styles.image} />
        <Text style={styles.venueName}>{venue.name}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.meta}>{event.date}</Text>
        <Text style={styles.meta}>{event.time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
