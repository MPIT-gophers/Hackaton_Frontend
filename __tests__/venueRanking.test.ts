import { VENUES } from '../src/data/venues';
import { getRecommendedVenues } from '../src/utils/venueRanking';

describe('getRecommendedVenues', () => {
  it('keeps the default priority when query is empty', () => {
    const [firstVenue] = getRecommendedVenues(VENUES, {
      placeType: '',
      location: '',
      wishes: ''
    });

    expect(firstVenue.id).toBe('vinzavod');
  });

  it('promotes venues by matching tags in draft query', () => {
    const [firstVenue] = getRecommendedVenues(VENUES, {
      placeType: 'лофт',
      location: 'центр',
      wishes: 'просторно'
    });

    expect(firstVenue.id).toBe('surasan-loft');
  });
});
