import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HeaderBack } from '../components/HeaderBack';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppContext } from '../context/AppContext';
import { UploadablePhoto } from '../domain/types';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';
import { normalizePhotos, stringifyUnknown } from '../utils/backendData';

type EventPhotosScreenProps = NativeStackScreenProps<RootStackParamList, 'EventPhotos'>;

export function EventPhotosScreen({ navigation, route }: EventPhotosScreenProps) {
  const { actions } = useAppContext();
  const [photos, setPhotos] = useState<unknown>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<UploadablePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedPhotos = useMemo(() => normalizePhotos(photos), [photos]);

  const loadPhotos = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await actions.getPhotos(route.params.eventId);
      setPhotos(response);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Не удалось загрузить фотографии');
    } finally {
      setIsLoading(false);
    }
  }, [actions, route.params.eventId]);

  useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  const handlePickPhotos = async () => {
    setError(null);

    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          setError('Нужен доступ к галерее');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        selectionLimit: 10
      });

      if (result.canceled) {
        return;
      }

      const nextPhotos = result.assets.slice(0, 10).map((asset, index) => ({
        uri: asset.uri,
        name: asset.fileName || `photo-${index + 1}.jpg`,
        type: asset.mimeType || 'image/jpeg'
      }));

      setSelectedPhotos(nextPhotos);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Не удалось выбрать фотографии');
    }
  };

  const handleUploadPhotos = async () => {
    if (selectedPhotos.length === 0) {
      setError('Сначала выберите фотографии');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      await actions.uploadPhotos(route.params.eventId, selectedPhotos.slice(0, 10));
      setSelectedPhotos([]);
      await loadPhotos();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Не удалось загрузить фотографии');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScreenContainer scrollable>
      <HeaderBack onPress={navigation.goBack} title="Фото" />

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : (
        <>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Загрузка фото</Text>
            <PrimaryButton onPress={handlePickPhotos} testID="photos-pick-button" title="Выбрать фотографии" />
            <PrimaryButton loading={isUploading} onPress={handleUploadPhotos} style={styles.actionButton} testID="photos-upload-button" title="Загрузить" />
            {selectedPhotos.length > 0 ? <Text style={styles.helperText}>Выбрано: {selectedPhotos.length}</Text> : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Фотографии события</Text>
            {normalizedPhotos.length > 0 ? (
              <View style={styles.grid}>
                {normalizedPhotos.map((photo) => (
                  <Image key={photo.id} source={{ uri: photo.url }} style={styles.image} />
                ))}
              </View>
            ) : (
              <Text style={styles.rawText}>{stringifyUnknown(photos)}</Text>
            )}
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40
  },
  section: {
    backgroundColor: theme.colors.surfaceBright,
    borderRadius: theme.radii.xl,
    marginTop: 20,
    padding: 16,
    ...theme.shadows.card
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 12
  },
  actionButton: {
    marginTop: 12
  },
  helperText: {
    color: theme.colors.muted,
    fontFamily: theme.typography.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  image: {
    borderRadius: theme.radii.md,
    height: 120,
    width: 120
  },
  rawText: {
    color: theme.colors.muted,
    fontFamily: theme.typography.regular,
    fontSize: 13,
    lineHeight: 18
  },
  errorText: {
    color: theme.colors.danger,
    fontFamily: theme.typography.medium,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 20,
    textAlign: 'center'
  }
});
