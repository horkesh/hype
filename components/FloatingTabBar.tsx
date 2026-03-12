
import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FloatingTabButton } from '@/components/tabbar/FloatingTabButton';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
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

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            animatedValue.value,
            [0, tabs.length - 1],
            [indicatorStart, indicatorEnd]
          ),
        },
      ],
    };
  });

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
          <Animated.View style={[dynamicStyles.indicator, indicatorStyle]} />
          <View style={styles.tabsContainer}>
            {tabs.map((tab, index) => {
              const isActive = activeTabIndex === index;
              const iconColor = isActive ? '#D4A056' : surfaceColors.iconColor;
              const labelColor = isActive ? '#D4A056' : surfaceColors.labelColor;

              return (
                <FloatingTabButton
                  key={typeof tab.route === 'string' ? tab.route : `${tab.name}-${index}`}
                  tab={tab}
                  isActive={isActive}
                  iconColor={iconColor}
                  labelColor={labelColor}
                  onPress={() => handleTabPress(tab.route)}
                />
              );
            })}
          </View>
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
  indicator: {
    position: 'absolute',
    top: 4,
    left: 2,
    bottom: 4,
    borderRadius: 27,
    width: `${(100 / 2) - 1}%`,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
});
