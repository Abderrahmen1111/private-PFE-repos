'use client';

import React, { useState } from 'react';
import { Review } from '@/types';
import { mockReviews, mockBusinessProfile } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Star, MessageCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReviewWithResponse extends Review {
  ownerResponse?: {
    text: string;
    respondedAt: Date;
  };
}

const ratingDistribution = [
  { rating: '5 stars', count: 72, percentage: 57 },
  { rating: '4 stars', count: 38, percentage: 30 },
  { rating: '3 stars', count: 12, percentage: 10 },
  { rating: '2 stars', count: 4, percentage: 3 },
  { rating: '1 star', count: 1, percentage: 1 },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithResponse[]>(mockReviews);
  const [isOpen, setIsOpen] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [response, setResponse] = useState('');

  const handleRespond = (reviewId: string) => {
    if (!response.trim()) {
      toast.error('Please write a response');
      return;
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              ownerResponse: {
                text: response,
                respondedAt: new Date(),
              },
            }
          : r
      )
    );

    toast.success('Response posted successfully!');
    setResponse('');
    setRespondingTo(null);
    setIsOpen(false);
  };

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const unrepliedCount = reviews.filter((r) => !r.ownerResponse).length;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Reviews & Reputation</h1>
        <p className="text-muted-foreground">
          Monitor and respond to customer reviews
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Rating */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-2">Average Rating</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-foreground">{avgRating}</p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(parseFloat(avgRating))
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Based on {reviews.length} reviews</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Total Reviews */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Total Reviews</p>
              <p className="text-4xl font-bold text-foreground">{reviews.length}</p>
              <p className="text-xs text-muted-foreground mt-2">Customer feedback</p>
            </div>
          </CardContent>
        </Card>

        {/* Unanswered Reviews */}
        <Card className={`border-0 shadow-sm ${unrepliedCount > 0 ? 'border-orange-200 bg-orange-50/50 dark:bg-orange-950/20' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-2">Awaiting Response</p>
                <p className={`text-4xl font-bold ${unrepliedCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-foreground'}`}>
                  {unrepliedCount}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Reviews to respond to</p>
              </div>
              {unrepliedCount > 0 && <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="rating" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--color-primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Recent Reviews</h2>

        {reviews.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">No reviews yet. Keep engaging with customers!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-foreground">{review.author}</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {review.createdAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  {review.ownerResponse && (
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 px-2 py-1 rounded">
                      Replied
                    </span>
                  )}
                </div>

                {/* Review Content */}
                <p className="text-foreground">{review.text}</p>

                {/* Owner Response */}
                {review.ownerResponse && (
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <p className="text-sm font-medium text-foreground mb-2">Your Response</p>
                    <p className="text-sm text-muted-foreground">{review.ownerResponse.text}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Replied on{' '}
                      {review.ownerResponse.respondedAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {/* Response Form */}
                {!review.ownerResponse && (
                  <Dialog open={isOpen && respondingTo === review.id} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) setRespondingTo(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRespondingTo(review.id);
                          setIsOpen(true);
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Respond
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Respond to Review</DialogTitle>
                        <DialogDescription>
                          Write a thoughtful response to {review.author}'s review
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="response" className="mb-2">
                            Your Response
                          </Label>
                          <Textarea
                            id="response"
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Thank you for your feedback..."
                            rows={4}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setIsOpen(false);
                              setRespondingTo(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => handleRespond(review.id)}
                          >
                            Post Response
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
