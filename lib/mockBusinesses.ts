export interface Business {
    id: string;
    name: string;
    image: string;
    rating: number;
    reviewCount: number;
    category: string;
    priceRange: '$' | '$$' | '$$$' | '$$$$';
    isOpen: boolean;
    description: string;
    location: {
      address: string;
      lat: number;
      lng: number;
    };
  }
  
  export const mockBusinesses: Business[] = [
    {
      id: '1',
      name: 'Golden Dragon Restaurant',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      rating: 4.5,
      reviewCount: 248,
      category: 'Chinese, Dim Sum',
      priceRange: '$$',
      isOpen: true,
      description: 'Traditional Cantonese cuisine with authentic dim sum. Family-owned for over 20 years.',
      location: {
        address: '1234 Grant Ave, San Francisco, CA',
        lat: 37.7955,
        lng: -122.4068,
      },
    },
    {
      id: '2',
      name: 'Bella Italia Trattoria',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
      rating: 4.8,
      reviewCount: 512,
      category: 'Italian, Pizza, Pasta',
      priceRange: '$$$',
      isOpen: true,
      description: 'Award-winning Italian restaurant featuring handmade pasta and wood-fired pizzas.',
      location: {
        address: '567 Columbus Ave, San Francisco, CA',
        lat: 37.8005,
        lng: -122.4102,
      },
    },
    {
      id: '3',
      name: 'The Blue Café',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
      rating: 4.2,
      reviewCount: 187,
      category: 'Café, Breakfast, Brunch',
      priceRange: '$',
      isOpen: false,
      description: 'Cozy neighborhood café serving artisan coffee, fresh pastries, and all-day breakfast.',
      location: {
        address: '890 Valencia St, San Francisco, CA',
        lat: 37.7599,
        lng: -122.4211,
      },
    },
    {
      id: '4',
      name: 'Sushi Zen',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      rating: 4.7,
      reviewCount: 423,
      category: 'Japanese, Sushi Bar',
      priceRange: '$$$',
      isOpen: true,
      description: 'Fresh sushi and sashimi prepared by master chefs. Omakase available by reservation.',
      location: {
        address: '2345 Fillmore St, San Francisco, CA',
        lat: 37.7885,
        lng: -122.4324,
      },
    },
    {
      id: '5',
      name: 'Taco Loco',
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop',
      rating: 4.4,
      reviewCount: 356,
      category: 'Mexican, Tacos, Takeout',
      priceRange: '$',
      isOpen: true,
      description: 'Authentic street-style tacos with homemade tortillas and fresh ingredients.',
      location: {
        address: '678 Mission St, San Francisco, CA',
        lat: 37.7855,
        lng: -122.4010,
      },
    },
    {
      id: '6',
      name: 'Le Petit Bistro',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
      rating: 4.6,
      reviewCount: 298,
      category: 'French, Wine Bar',
      priceRange: '$$$$',
      isOpen: false,
      description: 'Classic French bistro with an extensive wine list and seasonal tasting menus.',
      location: {
        address: '456 Bush St, San Francisco, CA',
        lat: 37.7908,
        lng: -122.4051,
      },
    },
    {
      id: '7',
      name: 'Green Bowl Kitchen',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      rating: 4.3,
      reviewCount: 215,
      category: 'Vegan, Healthy, Bowls',
      priceRange: '$$',
      isOpen: true,
      description: 'Plant-based comfort food with organic ingredients. Gluten-free options available.',
      location: {
        address: '789 Market St, San Francisco, CA',
        lat: 37.7875,
        lng: -122.4005,
      },
    },
    {
      id: '8',
      name: 'BBQ Smokehouse',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop',
      rating: 4.5,
      reviewCount: 445,
      category: 'BBQ, American, Smokehouse',
      priceRange: '$$',
      isOpen: true,
      description: 'Texas-style BBQ with slow-smoked brisket, ribs, and homemade sides.',
      location: {
        address: '1010 Divisadero St, San Francisco, CA',
        lat: 37.7755,
        lng: -122.4382,
      },
    },
    {
      id: '9',
      name: 'Spice Route',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
      rating: 4.6,
      reviewCount: 378,
      category: 'Indian, Curry, Tandoori',
      priceRange: '$$',
      isOpen: true,
      description: 'Northern Indian cuisine featuring tandoori specialties and rich curries.',
      location: {
        address: '345 Polk St, San Francisco, CA',
        lat: 37.7815,
        lng: -122.4195,
      },
    },
    {
      id: '10',
      name: 'The Burger Joint',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
      rating: 4.1,
      reviewCount: 567,
      category: 'Burgers, American, Fast Food',
      priceRange: '$',
      isOpen: true,
      description: 'Gourmet burgers made with locally sourced beef. Vegetarian options available.',
      location: {
        address: '234 Geary Blvd, San Francisco, CA',
        lat: 37.7872,
        lng: -122.4079,
      },
    },
  ];