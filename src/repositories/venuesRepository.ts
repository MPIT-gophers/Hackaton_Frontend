import { VENUES } from '../data/venues';
import { Venue, VenueQuery } from '../domain/types';
import { getRecommendedVenues } from '../utils/venueRanking';

export type VenuesRepository = {
  getVenues(query: VenueQuery): Promise<Venue[]>;
};

export const venuesRepository: VenuesRepository = {
  async getVenues(query) {
    return getRecommendedVenues(VENUES, query);
  }
};
