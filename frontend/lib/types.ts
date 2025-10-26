export interface HouseListing {
  id: string;
  title: string;
  location: string;
  price: number;
  images: string[];
  description: string;
  amenities: string[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
}

export interface UserPreference {
  input: string;
  inputMethod: 'text' | 'voice' | 'images';
  timestamp: number;
}

export type SwipeDirection = 'left' | 'right';

export interface SwipeAction {
  listingId: string;
  direction: SwipeDirection;
  timestamp: number;
}
