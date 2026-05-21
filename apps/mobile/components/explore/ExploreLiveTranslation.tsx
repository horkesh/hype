import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { translateScene } from '@/utils/ai/translate';
import type { TranslationResult } from '@/utils/ai/translate';
import { useTheme } from '@/hooks/useTheme';

interface ExploreLiveTranslationProps {
  visible: boolean;
  onClose: () => void;
}

export function ExploreLiveTranslation({ visible, onClose }: ExploreLiveTranslationProps) {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const cameraRef = useRef<any>(null);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      setCapturedImage(photo.uri);
      setTranslating(true);
      try {
        const translation = await translateScene(photo.base64, 'image/jpeg');
        setResult(translation);
      } catch {
        /* translation failed silently */
      } finally {
        setTranslating(false);
      }
    } catch {
      /* capture failed silently */
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setResult(null);
  };

  if (!visible) return null;

  if (!permission?.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.permissionText, { color: colors.text }]}>
            Camera access is needed to translate Bosnian text
          </Text>
          <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant Access</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.cameraContainer}>
        {!capturedImage ? (
          <>
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
            <View style={styles.cameraOverlay}>
              <Text style={styles.instruction}>Point at Bosnian text</Text>
              <TouchableOpacity onPress={handleCapture} style={styles.shutterButton}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.resultContainer}>
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
            {translating ? (
              <GlassContainer style={styles.resultCard}>
                <ActivityIndicator size="small" color="#D4A056" />
                <Text style={styles.translatingText}>Translating...</Text>
              </GlassContainer>
            ) : result ? (
              <GlassContainer style={styles.resultCard}>
                <Text style={styles.originalLabel}>Original:</Text>
                <Text style={styles.originalText}>{result.original_text}</Text>
                <Text style={styles.translationLabel}>Translation:</Text>
                <Text style={styles.translationText}>{result.translation}</Text>
                {result.context ? (
                  <GlassContainer style={styles.contextCard} glowColor="#D4A056">
                    <Text style={styles.contextText}>{result.context}</Text>
                  </GlassContainer>
                ) : null}
              </GlassContainer>
            ) : (
              <GlassContainer style={styles.resultCard}>
                <Text style={styles.errorText}>Could not translate. Try again with clearer text.</Text>
              </GlassContainer>
            )}
            <TouchableOpacity onPress={handleReset} style={styles.retryButton}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity onPress={onClose} style={styles.closeCameraButton}>
          <Text style={{ color: '#FFF', fontSize: 24 }}>{'\u2715'}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  permissionText: { fontSize: 16, textAlign: 'center', marginBottom: 20, fontFamily: 'DMSans_400Regular' },
  permissionButton: { backgroundColor: '#D4A056', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  permissionButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700', fontFamily: 'DMSans_700Bold' },
  closeButton: { marginTop: 16 },
  closeText: { fontSize: 14, fontFamily: 'DMSans_400Regular' },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60 },
  instruction: { color: '#FFF', fontSize: 16, marginBottom: 20, fontFamily: 'DMSans_500Medium' },
  shutterButton: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF' },
  closeCameraButton: { position: 'absolute', top: 60, right: 20 },
  resultContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  capturedImage: { width: '100%', height: 200, borderRadius: 16, marginBottom: 16 },
  resultCard: { padding: 16, marginBottom: 12 },
  translatingText: { color: '#D4A056', marginTop: 8, textAlign: 'center', fontFamily: 'DMSans_500Medium' },
  originalLabel: { fontSize: 11, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'DMSans_700Bold' },
  originalText: { fontSize: 16, color: '#FAFAF8', marginBottom: 12, fontFamily: 'DMSans_500Medium' },
  translationLabel: { fontSize: 11, color: '#D4A056', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'DMSans_700Bold' },
  translationText: { fontSize: 16, color: '#FAFAF8', fontFamily: 'DMSans_500Medium' },
  contextCard: { marginTop: 12, padding: 10 },
  contextText: { fontSize: 13, color: '#A0A0A0', lineHeight: 18, fontFamily: 'DMSans_400Regular', fontStyle: 'italic' },
  errorText: { color: '#EF4444', textAlign: 'center', fontFamily: 'DMSans_400Regular' },
  retryButton: { alignSelf: 'center', marginTop: 12 },
  retryText: { color: '#D4A056', fontSize: 14, fontWeight: '600', fontFamily: 'DMSans_700Bold' },
});
