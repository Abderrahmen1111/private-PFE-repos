'use client';

import { useParams } from 'next/navigation';
import { mockBusinesses } from '@/lib/mockBusinesses';
import { Star, MapPin, Phone, Globe, Clock, Share2, Bookmark, Camera, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function BusinessDetailPage() {
  const params = useParams();
  const businessId = params.id as string;
  
  // Find the business by ID
  const business = mockBusinesses.find(b => b.id === businessId);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business not found</h1>
          <p className="text-gray-600">The business you're looking for doesn't exist.</p>
          <a href="/search" className="text-red-500 hover:text-red-600 mt-4 inline-block">
            ← Back to search
          </a>
        </div>
      </div>
    );
  }

  // Mock additional images (using the same image for demo)
  const images = [
    business.image,
    business.image,
    business.image,
    business.image,
  ];

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-5 h-5 fill-orange-400 text-orange-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-5 h-5">
          <Star className="w-5 h-5 text-gray-300 absolute" />
          <div className="overflow-hidden w-2.5 absolute">
            <Star className="w-5 h-5 fill-orange-400 text-orange-400" />
          </div>
        </div>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      );
    }

    return stars;
  };

  return (
      <div className="min-h-screen bg-gray-50">
        <Navbar/>   
      {/* Hero Section with Photos + Overlay Header */}
{/* HERO — Yelp Style */}
<div className="bg-white border-b">
  <div className="max-w-7xl mx-auto">

    {/* Photo Strip */}
    <div className="relative h-[260px] md:h-[320px] flex overflow-hidden">

      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt=""
          className="flex-1 object-cover"
        />
      ))}

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

      {/* Business Header */}
      <div className="absolute inset-0 flex items-end">
        <div className="p-6 text-white">

          <div className="flex items-center gap-4">

            {/* Logo */}
            <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center font-bold text-lg shadow-lg">
              {business.name.substring(0, 2)}
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {business.name}
              </h1>

              {/* Yelp Rating */}
              <div className="flex items-center gap-3 mt-1">

                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div
                      key={i}
                      className="w-6 h-6 bg-red-500 rounded flex items-center justify-center"
                    >
                      <Star className="w-4 h-4 fill-white text-white" />
                    </div>
                  ))}
                </div>

                <span className="text-sm">
                  {business.rating} ({business.reviewCount.toLocaleString()} reviews)
                </span>
              </div>

              {/* Metadata Row */}
              <div className="flex items-center gap-2 text-sm mt-1">
                <span className="text-blue-300 font-medium">✓ Claimed</span>
                <span>•</span>
                <span>{business.priceRange}</span>
                <span>•</span>
                <span>{business.category}</span>
              </div>

              {/* Hours */}
              <div className="text-sm mt-1">
                {business.isOpen ? (
                  <span className="text-red-300 font-medium">
                    Closed
                  </span>
                ) : (
                  <span className="text-green-300 font-medium">
                    Open Now
                  </span>
                )}
                <span className="ml-2">11:00 AM - 11:00 PM</span>

                <button className="ml-3 underline text-sm">
                  See hours
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* See All Photos Button */}
      <button className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
        <Camera className="w-4 h-4" />
        See all 3.2k photos
      </button>
    </div>

    {/* ACTION BAR */}
    <div className="flex flex-wrap gap-3 p-4">

      <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2">
        <Star className="w-4 h-4" />
        Write a review
      </button>

      <button className=" bg-red-500 border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50">
        <Camera className="w-4 h-4" />
        Add photos/videos
      </button>

      <button className="text-black bg-white-500 border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50">
        <Share2 className="w-4 h-4" />
        Share
      </button>

      <button className="text-black bg-white-500 border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50">
        <Bookmark className="w-4 h-4" />
        Save
      </button>

      <button className="text-black bg-white-500 border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50">
        Follow
      </button>
    </div>

  </div>
</div>


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recommendation Section */}
            <div className="bg-white-500 rounded-lg shadow-sm p-6">
              <p className="text-black font-semibold mb-3">Do you recommend this business?</p>
              <div className="flex gap-3">
                <button className="text-black px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-green-500 font-medium">
                  Yes
                </button>
                <button className="text-black px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-red-500 font-medium">
                  No
                </button>
                <button className="text-black px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-yellow-500 font-medium">
                  Maybe
                </button>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Business</h2>
              <p className="text-gray-700 leading-relaxed">
                {business.description}
              </p>
            </div>

            {/* Menu Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
                <button className="text-red-500 hover:text-red-600 font-semibold flex items-center gap-1">
                  View full menu
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="text-black text-lg font-semibold mb-3">Popular Dishes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="cursor-pointer group">
                    <img
                      src={business.image}
                      alt="Dish"
                      className="text-black w-full h-32 object-cover rounded-lg mb-2 group-hover:opacity-90 transition-opacity"
                    />
                    <p className="text-black text-sm font-medium">Popular Dish {item}</p>
                    <p className="text-black text-sm text-gray-600">{business.reviewCount} photos</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section Placeholder */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Recommended Reviews for {business.name}
              </h2>
              <p className="text-gray-600">Reviews section coming soon...</p>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Order/Delivery CTA */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 mb-4">
                Order takeout or delivery
                <ExternalLink className="w-4 h-4" />
              </button>
              
              <div className="border-t pt-4">
                <h3 className="text-black font-bold text-lg mb-2">Waitlist closed</h3>
                <p className="text-sm text-gray-600 mb-2">Waitlist usually opens at 11:00 am</p>
                <p className="text-sm text-gray-600">
                  The restaurant is not taking waitlist parties right now.
                </p>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Takeout available</span>
                </div>
              </div>
            </div>

            {/* Location & Hours */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-black font-bold text-lg mb-4">Location & Hours</h3>
              
              {/* Map placeholder */}
              <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-gray-400" />
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-gray-700">{business.location.address}</p>
                <button className="text-red-500 hover:text-red-600 text-sm font-medium">
                  Get directions
                </button>
              </div>

              {/* Hours */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="text-gray-600">{day}</span>
                      <span className="text-gray-900">11:00 AM - 11:00 PM</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-black font-bold text-lg mb-4">Amenities and More</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm text-black text-gray-600">Outdoor seating</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm text-black text-gray-600">Accepts credit cards</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm text-black text-gray-600">Delivery available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm text-black text-gray-600">Wheelchair accessible</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}