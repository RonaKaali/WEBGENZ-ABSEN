import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface CameraSelfieScreenProps {
  onCapture: (uri: string, base64?: string) => void;
  onClose: () => void;
}

export default function CameraSelfieScreen({ onCapture, onClose }: CameraSelfieScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    if (photo?.uri) {
      setPhotoUri(photo.uri);
    }
  };

  const handleUsePhoto = () => {
    if (photoUri) {
      onCapture(photoUri);
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Meminta izin kamera...</Text>
      </View>
    );
  }

  // Preview foto setelah diambil
  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <View style={styles.previewActions}>
          <TouchableOpacity onPress={handleRetake} style={styles.retakeBtn} activeOpacity={0.8}>
            <Text style={styles.retakeText}>Ulangi</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleUsePhoto} style={styles.useBtn} activeOpacity={0.8}>
            <Text style={styles.useText}>Gunakan Foto</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Kamera view
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="front">
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.captureArea}>
          <TouchableOpacity onPress={takePicture} style={styles.captureBtn} activeOpacity={0.7}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 999,
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  camera: {
    flex: 1,
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  captureArea: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewActions: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  retakeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
  },
  retakeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  useBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0d9488',
    alignItems: 'center',
  },
  useText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
