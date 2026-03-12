import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileSignOutModalProps {
  accentColor: string;
  backgroundColor: string;
  onCancel: () => void;
  onConfirm: () => void;
  textColor: string;
  textSecondaryColor: string;
  visible: boolean;
}

export function ProfileSignOutModal({
  accentColor,
  backgroundColor,
  onCancel,
  onConfirm,
  textColor,
  textSecondaryColor,
  visible,
}: ProfileSignOutModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: '#FFFFFF' }]}>
          <Text style={[styles.modalTitle, { color: textColor }]}>Odjavi se?</Text>
          <Text style={[styles.modalText, { color: textSecondaryColor }]}>
            Da li si siguran/na da želiš da se odjaviš?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.modalButton, { backgroundColor }]}
            >
              <Text style={[styles.modalButtonText, { color: textColor }]}>Otkaži</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.modalButton, { backgroundColor: accentColor }]}
            >
              <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Odjavi se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
