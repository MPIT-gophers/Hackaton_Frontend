import { NormalizedPhoto, NormalizedWishlistItem } from '../domain/types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function stringifyUnknown(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!isRecord(value)) {
    return [];
  }

  if (Array.isArray(value.items)) {
    return value.items;
  }

  if (Array.isArray(value.photos)) {
    return value.photos;
  }

  if (Array.isArray(value.data)) {
    return value.data;
  }

  return [];
}

function readString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

export function normalizeWishlistItems(payload: unknown): NormalizedWishlistItem[] {
  const candidates = asArray(payload);

  return candidates.map((item, index) => {
    if (!isRecord(item)) {
      return {
        id: `wishlist-${index}`,
        title: String(item),
        raw: item
      };
    }

    const title =
      readString(item, ['title', 'name', 'text', 'label']) ||
      `Wishlist item ${index + 1}`;

    const subtitle =
      readString(item, ['description', 'status', 'reserved_by', 'booked_by']) ||
      readString(item, ['fund_status', 'current_fund', 'target_amount']);

    return {
      id: readString(item, ['id', 'itemID', 'item_id']) || `wishlist-${index}`,
      title,
      subtitle: subtitle || undefined,
      raw: item
    };
  });
}

export function normalizePhotos(payload: unknown): NormalizedPhoto[] {
  const candidates = asArray(payload);

  return candidates.reduce<NormalizedPhoto[]>((photos, item, index) => {
    if (typeof item === 'string' && item.trim()) {
      photos.push({
        id: `photo-${index}`,
        url: item.trim(),
        raw: item
      });

      return photos;
    }

    if (!isRecord(item)) {
      return photos;
    }

    const url = readString(item, ['url', 'photo_url', 'src', 'href']);

    if (!url) {
      return photos;
    }

    photos.push({
      id: readString(item, ['id', 'photo_id']) || `photo-${index}`,
      url,
      raw: item
    });

    return photos;
  }, []);
}
