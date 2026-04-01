import { StyleSheet, View } from 'react-native';

import { ProfilePersonIcon, ProfileRingIcon } from './icons';

export function ProfileAvatar() {
  return (
    <View style={styles.container}>
      <ProfileRingIcon />
      <View style={styles.personWrap}>
        <ProfilePersonIcon />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: 130,
    justifyContent: 'center',
    position: 'relative',
    width: 130
  },
  personWrap: {
    position: 'absolute'
  }
});
