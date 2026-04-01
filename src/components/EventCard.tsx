import { StyleSheet, Text, View } from 'react-native';

import { BookedEvent } from '../domain/types';
import { theme } from '../theme';

type EventCardProps = {
  event: BookedEvent;
};

export function EventCard({ event }: EventCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.meta}>{event.date}</Text>
      <Text style={styles.meta}>{event.time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    minHeight: 106,
    paddingHorizontal: 24,
    paddingVertical: 15
  },
  title: {
    color: '#000000',
    fontFamily: theme.typography.bold,
    fontSize: 26,
    lineHeight: 31,
    marginBottom: 6
  },
  meta: {
    color: '#000000',
    fontFamily: theme.typography.medium,
    fontSize: 20,
    lineHeight: 24
  }
});
