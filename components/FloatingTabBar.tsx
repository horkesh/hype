
import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FloatingTabButtons } from '@/components/tabbar/FloatingTabButtons';
import { FloatingTabIndicator } from '@/components/tabbar/FloatingTabIndicator';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';
import Animated, {
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href } from 'expo-router';
import {
  getActiveTabIndex,
  getTabBarSurfaceColors,
  getTabIndicatorTranslateRange,
  getTabIndicatorWidthPercent,
} from '@/utils/floatingTabBar';

const { width: screenWidth } = Dimensions.get('window');

export interface TabBarItem {
  name: string;
  route: Href;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = screenWidth / 2.5,
  borderRadius = 35,
  bottomMargin
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useTheme();
  const animatedValue = useSharedValue(0);
  const pathnameString = typeof pathname === 'string' ? pathname : '';

  const activeTabIndex = React.useMemo(() => {
    return getActiveTabIndex(pathnameString, tabs);
  }, [pathnameString, tabs]);

  React.useEffect(() => {
    if (activeTabIndex >= 0) {
      animatedValue.value = withSpring(activeTabIndex, {
        damping: 20,
        stiffness: 120,
        mass: 1,
      });
    }
  }, [activeTabIndex]);

  const handleTabPress = (route: Href) => {
    router.push(route);
  };

  const tabWidthPercent = getTabIndicatorWidthPercent(tabs.length);
  const [indicatorStart, indicatorEnd] = getTabIndicatorTranslateRange(containerWidth, tabs.length);
  const surfaceColors = getTabBarSurfaceColors(isDark);

  const dynamicStyles = {
    blurContainer: {
      ...styles.blurContainer,
      borderWidth: 1.2,
      borderColor: surfaceColors.borderColor,
      ...Platform.select({
        ios: {
          backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : surfaceColors.backgroundColor,
        },
        android: {
          backgroundColor: surfaceColors.backgroundColor,
        },
        web: {
          backgroundColor: surfaceColors.backgroundColor,
          backdropFilter: 'blur(10px)',
        },
      }),
    },
    background: {
      ...styles.background,
    },
    indicator: {
      ...styles.indicator,
      backgroundColor: surfaceColors.indicatorColor,
      width: `${tabWidthPercent}%` as `${number}%`,
    },
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={[
        styles.container,
        {
          width: containerWidth,
          marginBottom: bottomMargin ?? 20
        }
      ]}>
        <BlurView
          intensity={80}
          style={[dynamicStyles.blurContainer, { borderRadius }]}
        >
          <View style={dynamicStyles.background} />
          <FloatingTabIndicator
            animatedValue={animatedValue}
            indicatorColor={surfaceColors.indicatorColor}
            indicatorEnd={indicatorEnd}
            maxIndex={Math.max(tabs.length - 1, 0)}
            indicatorStart={indicatorStart}
            tabWidthPercent={tabWidthPercent}
          />
          <FloatingTabButtons
            activeTabIndex={activeTabIndex}
            iconColor={surfaceColors.iconColor}
            labelColor={surfaceColors.labelColor}
            tabs={tabs}
            onPressTab={handleTabPress}
          />
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  container: {
    marginHorizontal: 20,
    alignSelf: 'center',
  },
  blurContainer: {
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
});
