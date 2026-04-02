import { BackendEvent, BackendLocation, EventDraft, Venue, VenueQuery } from '../domain/types';

function buildVenueQueryString(query: VenueQuery): string {
  return [query.placeType, query.location, query.wishes]
    .join(' ')
    .trim()
    .toLowerCase();
}

function getVenueScore(venue: Venue, queryString: string): number {
  if (!queryString) {
    return venue.id === 'vinzavod' ? 5 : venue.id === 'surasan' ? 4 : 3;
  }

  return venue.tags.reduce((score, tag) => score + (queryString.includes(tag) ? 10 : 0), 0);
}

export function getRecommendedVenues(venues: Venue[], draft: Pick<EventDraft, 'placeType' | 'location' | 'wishes'>): Venue[] {
  const queryString = buildVenueQueryString(draft);

  return [...venues].sort((firstVenue, secondVenue) => {
    const firstScore = getVenueScore(firstVenue, queryString);
    const secondScore = getVenueScore(secondVenue, queryString);

    return secondScore - firstScore;
  });
}

export function getSelectedVenue(
  venues: Venue[],
  draft: Pick<EventDraft, 'placeType' | 'location' | 'wishes'>,
  selectedVenueId: string | null
): Venue | undefined {
  const recommended = getRecommendedVenues(venues, draft);

  if (!selectedVenueId) {
    return recommended[0];
  }

  return recommended.find((venue) => venue.id === selectedVenueId) ?? recommended[0];
}

function mapLocationToVenue(location: BackendLocation, index: number): Venue {
  return {
    id: location.id,
    name: location.title || 'Заведение',
    summary: location.aiComment,
    rating: location.aiScore || '—',
    imageKey: index % 2 === 0 ? 'venueCover1' : 'venueCover2',
    addressLine: location.address,
    address: location.address,
    schedule: '',
    averageCheck: '',
    cuisine: '',
    tags: []
  };
}

export function extractVenuesFromEvent(event: BackendEvent): Venue[] {
  const locations = event.variants
    .flatMap((variant) => variant.locations)
    .filter((loc) => !loc.isRejected)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return locations.map(mapLocationToVenue);
}

export function hasEventLocations(event: BackendEvent): boolean {
  return event.variants.some((variant) => variant.locations.length > 0);
}
