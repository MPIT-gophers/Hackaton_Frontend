import { ImageSourcePropType } from 'react-native';

export const imageAssets = {
  authHero: require('../../assets/figma-mobile/auth-hero.png'),
  mascot: require('../../assets/figma-mobile/mascot.png'),
  venueCover1: require('../../assets/figma-mobile/venue-cover-1.jpg'),
  venueCover2: require('../../assets/figma-mobile/venue-cover-2.jpg'),
  agentAvatar: require('../../assets/chat/agent-avatar.png')
} as const satisfies Record<string, ImageSourcePropType>;

export type ImageAssetKey = keyof typeof imageAssets;

export function getImageAsset(key: ImageAssetKey): ImageSourcePropType {
  return imageAssets[key];
}
