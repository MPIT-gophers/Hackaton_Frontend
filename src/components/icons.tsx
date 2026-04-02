import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { theme } from '../theme';

type IconProps = {
  size?: number;
  color?: string;
};

export function BackArrowIcon({ size = 17, color = theme.colors.primary }: IconProps) {
  return (
    <Svg width={size} height={14} viewBox="0 0 18 15" fill="none">
      <Path d="M2.635 8h14.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M6.885.75.981 8l5.897 6.75" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function CheckCircleIcon({ size = 20, color = theme.colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx={10} cy={10} r={9.25} stroke={color} strokeOpacity={0.5} strokeWidth={1.5} />
      <Path d="M5.5 9.5 9 13l8-8.5" stroke={color} strokeOpacity={0.5} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function ProfileOutlineIcon({ size = 26, color = theme.colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <Path d="M11 15.434h4c2.347 0 4.25 1.903 4.25 4.25v.565H6.75v-.565c0-2.347 1.903-4.25 4.25-4.25Z" stroke={color} strokeWidth={1.5} />
      <Path d="M13 6.75c2.076 0 3.625 1.502 3.625 3.197 0 1.695-1.549 3.197-3.625 3.197s-3.625-1.502-3.625-3.197S10.924 6.75 13 6.75Z" stroke={color} strokeWidth={1.5} />
      <Circle cx={13} cy={13} r={12.25} stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export function StarIcon({ size = 25, color = theme.colors.star }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 19" fill="none">
      <Path
        d="M8.861.691c.3-.922 1.603-.922 1.902 0l1.63 5.019a1 1 0 0 0 .952.691h5.278c.969 0 1.372 1.24.588 1.81l-4.27 3.102a1 1 0 0 0-.363 1.118l1.631 5.02c.3.92-.755 1.687-1.539 1.118L10.4 15.466a1 1 0 0 0-1.176 0l-4.27 3.102c-.784.57-1.838-.197-1.539-1.118l1.63-5.02a1 1 0 0 0-.362-1.118L.414 8.21c-.784-.57-.381-1.81.588-1.81h5.277a1 1 0 0 0 .952-.691L8.86.69Z"
        fill={color}
      />
    </Svg>
  );
}

export function ProfileRingIcon({ size = 130, color = theme.colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 130 130" fill="none">
      <Circle cx={65} cy={65} r={64.25} stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export function ProfilePersonIcon({ size = 50, color = theme.colors.primary }: IconProps) {
  return (
    <Svg width={size} height={58} viewBox="0 0 50 58" fill="none">
      <Path d="M0 57.197c0-13.073 10.597-23.671 23.671-23.671h2.658C39.403 33.526 50 44.124 50 57.197" stroke={color} strokeWidth={1.5} />
      <Path d="M25 .75c8.232 0 14.875 6.514 14.875 14.513 0 7.999-6.643 14.513-14.875 14.513S10.125 23.262 10.125 15.263C10.125 7.264 16.768.75 25 .75Z" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export function MascotShadowIcon() {
  return (
    <Svg width={192} height={52} viewBox="0 0 192 52" fill="none">
      <Ellipse cx={96} cy={26} rx={90} ry={20} fill={theme.colors.mascotShadow} />
    </Svg>
  );
}

export function SendIcon({ size = 24, color = '#EFF4FD' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12L4.396 6.563C4.223 5.007 5.825 3.864 7.24 4.535L19.184 10.193C20.709 10.915 20.709 13.085 19.184 13.807L7.24 19.466C5.825 20.136 4.223 18.994 4.396 17.438L5 12ZM5 12H12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
