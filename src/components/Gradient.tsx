import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { palette } from '@/theme';

let gradientCounter = 0;

/**
 * Riempimento sfumato che occupa tutto lo spazio del genitore (assoluto).
 * Il genitore deve avere `position: relative` (o essere il default) e
 * `overflow: hidden` con lo stesso borderRadius per un bordo pulito.
 */
export function GradientFill({
  radius = 0,
  colors = [palette.primary, palette.primaryGradientEnd],
}: {
  radius?: number;
  colors?: [string, string];
}) {
  const [id] = useState(() => `gradient-${gradientCounter++}`);
  const [size, setSize] = useState({ width: 0, height: 0 });

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ width, height });
      }}
    >
      {size.width > 0 && size.height > 0 ? (
        <Svg width={size.width} height={size.height}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors[0]} />
              <Stop offset="1" stopColor={colors[1]} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={size.width} height={size.height} rx={radius} fill={`url(#${id})`} />
        </Svg>
      ) : null}
    </View>
  );
}
