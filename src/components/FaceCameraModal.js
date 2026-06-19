/**
 * FaceCameraModal.js
 *
 * A self-contained Vision Camera modal for face registration.
 * Renders a full-screen camera view with:
 *   - Animated face-scan overlay (corner brackets + pulse ring + scan line)
 *   - Flip button (front ↔ back) — value becomes face_angle
 *   - Shutter button with press animation
 *   - Photo preview with retake / confirm actions
 *
 * Props:
 *   visible    {boolean}   — controls modal visibility
 *   onClose    {function}  — called when user dismisses
 *   onCapture  {function}  — called with ({ uri, face_angle: 'front'|'back' })
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from 'react-native-vision-camera';

const { width: SW, height: SH } = Dimensions.get('window');
const FRAME_SIZE = SW * 0.72;
const normalize = v => Math.round(v * (SW / 375));

// ─── Corner bracket ───────────────────────────────────────────────────────────
const Corner = ({ top, left, right, bottom, color }) => {
  const bw = 3;
  const len = 22;
  return (
    <View
      style={{
        position: 'absolute',
        width: len,
        height: len,
        borderColor: color,
        top,
        left,
        right,
        bottom,
        borderTopWidth: top !== undefined ? bw : 0,
        borderLeftWidth: left !== undefined && right === undefined ? bw : 0,
        borderRightWidth: right !== undefined && left === undefined ? bw : 0,
        borderBottomWidth: bottom !== undefined ? bw : 0,
      }}
    />
  );
};

// ─── Animated face frame overlay ─────────────────────────────────────────────
const FaceFrame = ({ pulse, color }) => {
  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.35, 0.7, 0.35],
  });
  const scanLineTop = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME_SIZE * 1.08],
  });
  const scanLineOpacity = pulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.85, 0],
  });

  return (
    <View style={styles.frameWrapper} pointerEvents="none">
      {/* Pulse ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          { transform: [{ scale }], opacity, borderColor: color },
        ]}
      />

      {/* Dashed face oval guide */}
      <View style={[styles.faceOval, { borderColor: color + '55' }]} />

      {/* Corner brackets */}
      <Corner top={0} left={0} color={color} />
      <Corner top={0} right={0} color={color} />
      <Corner bottom={0} left={0} color={color} />
      <Corner bottom={0} right={0} color={color} />

      {/* Scan line */}
      <Animated.View
        style={[
          styles.scanLine,
          {
            backgroundColor: color,
            opacity: scanLineOpacity,
            top: scanLineTop,
          },
        ]}
      />
    </View>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const FaceCameraModal = ({ visible, onClose, onCapture }) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const frontDevice = useCameraDevice('front');
  const backDevice = useCameraDevice('back');

  const [facing, setFacing] = useState('front');
  const [photoUri, setPhotoUri] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [permChecked, setPermChecked] = useState(false);

  const cameraRef = useRef(null);
  const pulse = useRef(new Animated.Value(0)).current;
  const shutterScale = useRef(new Animated.Value(1)).current;

  const device = facing === 'front' ? frontDevice : backDevice;

  // ── High-resolution photo format ──────────────────────────────────────────
  // Vision Camera negotiates a format automatically by default, which often
  // favours smooth preview/video over still-photo resolution. Explicitly
  // requesting the highest-resolution photo format the device supports (with
  // a reasonable cap so files don't balloon) gives a sharper face capture.
  const format = useCameraFormat(device, [
    { photoResolution: { width: 1920, height: 1920 } },
    { photoAspectRatio: 1 },
  ]);

  // ── Permission on open ────────────────────────────────────────────────────
  useEffect(() => {
    if (visible && !permChecked) {
      (async () => {
        if (!hasPermission) await requestPermission();
        setPermChecked(true);
      })();
    }
    if (!visible) {
      setPhotoUri(null);
      setPermChecked(false);
    }
  }, [visible]);

  // ── Pulse loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [visible]);

  // ── Shutter press animation ───────────────────────────────────────────────
  const animateShutter = () => {
    Animated.sequence([
      Animated.timing(shutterScale, {
        toValue: 0.82,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(shutterScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ── Capture ───────────────────────────────────────────────────────────────
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    animateShutter();
    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
        enableShutterSound: false,
        // Keep EXIF (orientation etc.) — stripping it can cause sideways
        // images downstream when the consumer doesn't separately track
        // device orientation.
        skipMetadata: false,
      });
      const uri =
        Platform.OS === 'android' ? `file://${photo.path}` : photo.path;
      setPhotoUri(uri);
    } catch (e) {
      console.warn('FaceCamera capture error:', e);
    } finally {
      setCapturing(false);
    }
  }, [capturing]);

  const handleFlip = () => setFacing(f => (f === 'front' ? 'back' : 'front'));

  const handleConfirm = () => {
    if (photoUri) {
      onCapture({ uri: photoUri, face_angle: facing });
      setPhotoUri(null);
      onClose();
    }
  };

  const handleRetake = () => setPhotoUri(null);

  // Accent colour changes with camera direction
  const ACCENT = facing === 'front' ? '#22D3EE' : '#A78BFA';
  const LABEL = facing === 'front' ? 'FRONT' : 'BACK';

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.root}>
        {/* ── PREVIEW STATE ── */}
        {photoUri ? (
          <View style={styles.previewRoot}>
            <Image
              source={{ uri: photoUri }}
              style={styles.previewImage}
              resizeMode="cover"
            />

            <View style={styles.previewOverlay}>
              <View style={styles.previewBadge}>
                <View
                  style={[styles.previewDot, { backgroundColor: ACCENT }]}
                />
                <Text style={styles.previewBadgeText}>{LABEL} CAMERA</Text>
              </View>
              <Text style={styles.previewTitle}>Looks good?</Text>
              <Text style={styles.previewSub}>
                Make sure your face is clearly visible and well-lit.
              </Text>

              <View style={styles.previewActions}>
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={handleRetake}
                  activeOpacity={0.8}
                >
                  <Text style={styles.retakeIcon}>↩</Text>
                  <Text style={styles.retakeBtnText}>Retake</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: ACCENT }]}
                  onPress={handleConfirm}
                  activeOpacity={0.85}
                >
                  <Text style={styles.confirmBtnText}>Use Photo</Text>
                  <Text style={styles.confirmIcon}>→</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          /* ── CAMERA STATE ── */
          <>
            {device && hasPermission ? (
              <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                format={format}
                isActive={visible && !photoUri}
                photo
                photoQualityBalance="quality"
                enableZoomGesture={false}
                // Lets the AE/AF/AWB system settle on the subject's face
                // before takePhoto fires, instead of relying on whatever
                // exposure the preview happened to be at.
                enableAutoStabilization
              />
            ) : (
              <View style={styles.noCamBox}>
                <Text style={styles.noCamEmoji}>📷</Text>
                <Text style={styles.noCamText}>
                  {!hasPermission
                    ? 'Camera permission required'
                    : 'Camera not available'}
                </Text>
              </View>
            )}

            {/* Vignette overlays — top & bottom */}
            <View style={styles.vignetteTop} pointerEvents="none" />
            <View style={styles.vignetteBottom} pointerEvents="none" />

            {/* ── Top bar ── */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.75}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>

              <View style={styles.topCenter}>
                <View style={[styles.modePill, { borderColor: ACCENT + '80' }]}>
                  <View style={[styles.modeDot, { backgroundColor: ACCENT }]} />
                  <Text style={[styles.modePillText, { color: ACCENT }]}>
                    {LABEL} CAMERA
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.flipBtn, { borderColor: ACCENT + '60' }]}
                onPress={handleFlip}
                activeOpacity={0.75}
              >
                <Text style={styles.flipIcon}>⟳</Text>
              </TouchableOpacity>
            </View>

            {/* ── Face frame overlay ── */}
            <View style={styles.frameArea} pointerEvents="none">
              <FaceFrame pulse={pulse} color={ACCENT} />
              <Text style={[styles.frameHint, { color: ACCENT }]}>
                Centre your face inside the frame
              </Text>
            </View>

            {/* ── Bottom controls ── */}
            <View style={styles.bottomBar}>
              <Animated.View style={{ transform: [{ scale: shutterScale }] }}>
                <TouchableOpacity
                  style={[styles.shutterOuter, { borderColor: ACCENT }]}
                  onPress={handleCapture}
                  activeOpacity={0.9}
                  disabled={capturing}
                >
                  <View
                    style={[
                      styles.shutterInner,
                      { backgroundColor: capturing ? '#666' : ACCENT },
                    ]}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Vignette
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SH * 0.22,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SH * 0.28,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },

  // Top bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? normalize(54) : normalize(36),
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(16),
  },
  closeBtn: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: normalize(16), fontWeight: '700' },
  topCenter: { flex: 1, alignItems: 'center' },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    borderWidth: 1,
    borderRadius: normalize(20),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(6),
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modeDot: { width: 7, height: 7, borderRadius: 4 },
  modePillText: {
    fontSize: normalize(11),
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  flipBtn: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipIcon: {
    color: '#fff',
    fontSize: normalize(22),
    lineHeight: normalize(28),
  },

  // Face frame
  frameArea: {
    position: 'absolute',
    top: '18%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  frameWrapper: {
    width: FRAME_SIZE,
    height: FRAME_SIZE * 1.08,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: FRAME_SIZE + normalize(24),
    height: FRAME_SIZE * 1.08 + normalize(24),
    borderRadius: FRAME_SIZE / 2 + normalize(12),
    borderWidth: 1.5,
  },
  faceOval: {
    width: FRAME_SIZE * 0.68,
    height: FRAME_SIZE * 0.88,
    borderRadius: FRAME_SIZE * 0.44,
    borderWidth: 1,
    borderStyle: 'dashed',
    position: 'absolute',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
  },
  frameHint: {
    marginTop: normalize(18),
    fontSize: normalize(12),
    fontWeight: '600',
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Bottom controls
  bottomBar: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(36),
    paddingBottom: Platform.OS === 'ios' ? normalize(52) : normalize(32),
    paddingTop: normalize(20),
  },
  sideSlot: { alignItems: 'center', width: normalize(56) },
  tipEmoji: { fontSize: normalize(22) },
  tipText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: normalize(10),
    textAlign: 'center',
    marginTop: 3,
    lineHeight: normalize(14),
  },
  shutterOuter: {
    width: normalize(78),
    height: normalize(78),
    borderRadius: normalize(39),
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  shutterInner: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
  },

  // No camera fallback
  noCamBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  noCamEmoji: { fontSize: normalize(52), marginBottom: normalize(16) },
  noCamText: {
    color: '#94A3B8',
    fontSize: normalize(15),
    textAlign: 'center',
    paddingHorizontal: normalize(32),
  },

  // Preview
  previewRoot: { flex: 1, backgroundColor: '#000' },
  previewImage: { ...StyleSheet.absoluteFillObject },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: normalize(24),
    paddingTop: normalize(24),
    paddingBottom: Platform.OS === 'ios' ? normalize(52) : normalize(32),
    borderTopLeftRadius: normalize(28),
    borderTopRightRadius: normalize(28),
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginBottom: normalize(10),
  },
  previewDot: { width: 8, height: 8, borderRadius: 4 },
  previewBadgeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: normalize(11),
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  previewTitle: {
    color: '#fff',
    fontSize: normalize(22),
    fontWeight: '800',
    marginBottom: normalize(6),
  },
  previewSub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: normalize(13),
    lineHeight: normalize(19),
    marginBottom: normalize(28),
  },
  previewActions: { flexDirection: 'row', gap: normalize(12) },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: normalize(14),
    paddingVertical: normalize(15),
    gap: normalize(8),
  },
  retakeIcon: { color: '#fff', fontSize: normalize(18) },
  retakeBtnText: { color: '#fff', fontSize: normalize(15), fontWeight: '700' },
  confirmBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: normalize(14),
    paddingVertical: normalize(15),
    gap: normalize(8),
  },
  confirmBtnText: { color: '#000', fontSize: normalize(15), fontWeight: '800' },
  confirmIcon: { color: '#000', fontSize: normalize(18), fontWeight: '800' },
});

export default FaceCameraModal;