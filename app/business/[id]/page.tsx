import { getBusinessById } from '@/lib/actions/business';
import { Star, MapPin, Phone, Globe, Clock, Share2, Bookmark, Camera, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BusinessImageGallery from '@/components/BusinessImageGallery';
import { notFound } from 'next/navigation';

export default async function BusinessDetailPage({ params }: { params: { id: string } }) {
  const businessId = params.id;
  const business = await getBusinessById(businessId);

  if (!business) {
    notFound();
  }

  // Use photos from the business if available, otherwise use a default placeholder
  const images = (business.photos && business.photos.length > 0)
    ? business.photos
    : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Hero Section with Photos + Overlay Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto">
          {/* Photo Strip */}
          <div className="relative">
            <BusinessImageGallery images={images} businessName={business.name} />

            {/* Business Header Overlay */}
            <div className="absolute inset-0 flex items-end pointer-events-none bg-gradient-to-t from-black/60 to-transparent">
              <div className="p-6 text-white w-full">
                <div className="flex items-center gap-4">
                  {/* Logo */}
                  <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0">
                    {business.name.substring(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">
                      {business.name}
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div
                            key={i}
                            className={`w-5 h-5 rounded flex items-center justify-center ${i <= Math.round(business.rating) ? 'bg-red-500' : 'bg-gray-400'
                              }`}
                          >
                            <Star className="w-3 h-3 fill-white text-white" />
                          </div>
                        ))}
                      </div>

                      <span className="text-sm font-medium">
                        {business.rating} ({business.reviewCount.toLocaleString()} reviews)
                      </span>
                    </div>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-2 text-sm mt-2 opacity-90">
                      {business.category && (
                        <>
                          <span className="font-semibold">{business.category}</span>
                          {business.priceRange && <span>•</span>}
                        </>
                      )}
                      {business.priceRange && <span>{business.priceRange}</span>}
                    </div>

                    {/* Status Placeholder (Only if real) */}
                    {business.isOpen !== undefined && (
                      <div className="text-sm mt-2">
                        {business.isOpen ? (
                          <span className="text-green-400 font-bold">Open Now</span>
                        ) : (
                          <span className="text-red-400 font-bold">Closed</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="flex flex-wrap gap-3 p-4 border-t">
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md active:scale-95">
              <Star className="w-4 h-4" />
              Write a review
            </button>

            <button className="bg-white border-2 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 font-semibold transition-all active:scale-95">
              <Camera className="w-4 h-4" />
              Add photo
            </button>

            <button className="bg-white border-2 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 font-semibold transition-all active:scale-95">
              <Share2 className="w-4 h-4" />
              Share
            </button>

            <button className="bg-white border-2 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 font-semibold transition-all active:scale-95">
              <Bookmark className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                À propos
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {business.description || "Aucune description détaillée n'est disponible pour cet établissement pour le moment."}
              </div>
            </div>

            {/* Photos Section (if many) */}
            {business.photos && business.photos.length > 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Photos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {business.photos.map((photo, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                      <img src={photo} alt={`${business.name} photo ${index}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section Placeholder */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Avis sur {business.name}
              </h2>
              <div className="py-12 text-center bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">Les avis seront bientôt disponibles directement depuis la base de données.</p>
                <button className="mt-4 bg-white border-2 px-6 py-2 rounded-lg font-bold hover:bg-gray-50 transition-all">
                  Soyez le premier à donner votre avis
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-24">
              <h3 className="text-gray-900 font-bold text-xl mb-6">Informations</h3>

              <div className="space-y-6">
                {/* Phone */}
                {business.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Téléphone</p>
                      <a href={`tel:${business.phone}`} className="text-blue-600 hover:underline">{business.phone}</a>
                    </div>
                  </div>
                )}

                {/* Website */}
                {business.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Site Web</p>
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        {business.website.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>
                  </div>
                )}

                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Adresse</p>
                    <p className="text-gray-700 text-sm">{business.location.address}</p>
                    <button className="mt-1 text-blue-600 text-sm font-semibold hover:underline">
                      Itinéraire
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md">
                  Envoyer un message
                </button>
                <button className="w-full bg-white border-2 text-gray-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                  Réserver
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

