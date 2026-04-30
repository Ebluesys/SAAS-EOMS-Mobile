import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  Dimensions,
  View,
  Text,
  Animated,
  Easing,
  Image,
} from 'react-native';
import PropTypes from 'prop-types';
import { Colors, Images } from '../../themes/ThemePath';

export default function Loader({ visible, text }) {
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let rippleAnimation;
    let rotationLoop;

    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      rippleAnim.setValue(0);
      rippleAnimation = Animated.loop(
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      );
      rippleAnimation.start();

      rotateAnim.setValue(0);
      rotationLoop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      rotationLoop.start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      rippleAnim.stopAnimation();
      rotateAnim.stopAnimation();
    }

    return () => {
      if (rippleAnimation) rippleAnimation.stop();
      if (rotationLoop) rotationLoop.stop();
    };
  }, [visible]);

  const screenHeight = Dimensions.get('window').height;

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 2.5],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return visible ? (
    <Animated.View
      style={{
        flex: 1,
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 99,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        height: screenHeight,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeAnim,
      }}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            position: 'absolute',
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: Colors.button || '#ffffff',
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          }}
        />
        <Animated.Image
          source={Images.earth}
          style={{
            width: 200,
            height: 200,
            resizeMode: 'contain',
            transform: [{ rotate: spin }],
          }}
        />
      </View>

      <Text
        style={{
          alignSelf: 'center',
          marginTop: 24,
          fontSize: 18,
          color: '#ffffff',
          fontWeight: '600',
          textAlign: 'center',
          letterSpacing: 0.5,
        }}
      >
        {text}
      </Text>
    </Animated.View>
  ) : null;
}

Loader.propTypes = {
  visible: PropTypes.bool,
  text: PropTypes.string,
};

Loader.defaultProps = {
  visible: false,
  text: 'Finding your location...',
};
