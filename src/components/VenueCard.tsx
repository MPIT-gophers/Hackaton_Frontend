import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Venue } from '../domain/types';
import { theme } from '../theme';
import { getImageAsset } from '../data/assets';
import { StarIcon } from './icons';

type VenueCardProps = {
  venue: Venue;
  onPress: () => void;
  testID?: string;
};

export function VenueCard({ venue, onPress, testID }: VenueCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed ? styles.pressed : undefined]} testID={testID}>
      <View style={styles.media}>
        <Image source={getImageAsset(venue.imageKey)} style={styles.image} />
        <Text style={styles.name}>{venue.name}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.summary}>{venue.summary}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>{venue.rating}</Text>
          <StarIcon />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
    ...theme.shadows.card
  },
  pressed: {
    opacity: 0.97,
    transform: [{ translateY: -1 }]
  },
  media: {
    height: 187,
    overflow: 'hidden'
  },
  image: {
    height: '100%',
    width: '100%'
  },
  name: {
    bottom: 15,
    color: theme.colors.surface,
    fontFamily: theme.typography.medium,
    fontSize: 20,
    left: 15,
    lineHeight: 24,
    position: 'absolute'
  },
  body: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    paddingTop: 15
  },
  summary: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22,
    minHeight: 46
  },
  ratingRow: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 2,
    marginTop: 10
  },
  rating: {
    color: theme.colors.star,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 20
  }
});
