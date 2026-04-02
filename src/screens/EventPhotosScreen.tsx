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
import { normalizePhotos } from '../utils/backendData';
import { logger } from '../utils/logger';

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
    logger.debug('EventPhotosScreen', 'Loading event photos', {
      eventId: route.params.eventId
    });

    try {
      const response = await actions.getPhotos(route.params.eventId);
      setPhotos(response);
      logger.info('EventPhotosScreen', 'Event photos loaded', {
        eventId: route.params.eventId,
        photoCount: normalizePhotos(response).length
      });
    } catch (nextError) {
      logger.error('EventPhotosScreen', 'Failed to load event photos', {
        eventId: route.params.eventId,
        error: nextError
      });
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
    logger.info('EventPhotosScreen', 'Selecting photos from gallery');

    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          logger.warn('EventPhotosScreen', 'Gallery permission denied');
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
        logger.debug('EventPhotosScreen', 'Photo selection canceled');
        return;
      }

      const nextPhotos = result.assets.slice(0, 10).map((asset, index) => ({
        uri: asset.uri,
        name: asset.fileName || `photo-${index + 1}.jpg`,
        type: asset.mimeType || 'image/jpeg'
      }));

      setSelectedPhotos(nextPhotos);
      logger.info('EventPhotosScreen', 'Photos selected', {
        count: nextPhotos.length
      });
    } catch (nextError) {
      logger.error('EventPhotosScreen', 'Failed to select photos', nextError);
      setError(nextError instanceof Error ? nextError.message : 'Не удалось выбрать фотографии');
    }
  };

  const handleUploadPhotos = async () => {
    if (selectedPhotos.length === 0) {
      logger.warn('EventPhotosScreen', 'Upload attempted without selected photos');
      setError('Сначала выберите фотографии');
      return;
    }

    setError(null);
    setIsUploading(true);
    logger.info('EventPhotosScreen', 'Uploading selected photos', {
      eventId: route.params.eventId,
      count: selectedPhotos.length
    });

    try {
      await actions.uploadPhotos(route.params.eventId, selectedPhotos.slice(0, 10));
      setSelectedPhotos([]);
      await loadPhotos();
      logger.info('EventPhotosScreen', 'Photos uploaded successfully', {
        eventId: route.params.eventId
      });
    } catch (nextError) {
      logger.error('EventPhotosScreen', 'Failed to upload photos', {
        eventId: route.params.eventId,
        error: nextError
      });
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
              <Text style={styles.rawText}>Фотографии пока не загружены.</Text>
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
