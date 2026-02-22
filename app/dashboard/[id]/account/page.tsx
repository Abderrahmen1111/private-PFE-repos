'use client';

import React from 'react';
import { mockAccount } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Package, TrendingUp, Zap, BarChart3, Crown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SubscriptionPlan } from '@/types';

const plans: Record<'free' | 'pro' | 'business', { features: string[]; price: number; annualPrice?: number }> = {
  free: {
    price: 0,
    features: [
      'Basic business profile',
      'Up to 5 products/services',
      'Limited analytics',
      'Community support',
    ],
  },
  pro: {
    price: 29,
    annualPrice: 290,
    features: [
      'Everything in Free +',
      'Up to 50 products/services',
      'Advanced analytics',
      'Review management',
      'Promotional tools',
      'Email support',
      'Image gallery (up to 20)',
    ],
  },
  business: {
    price: 99,
    annualPrice: 990,
    features: [
      'Everything in Pro +',
      'Unlimited products/services',
      'Custom branding',
      'API access',
      'Priority support',
      'Advanced reporting',
      'Unlimited image gallery',
      'Team collaboration tools',
    ],
  },
};

export default function AccountPage() {
  const currentPlan = mockAccount.plan.name;

  const handleUpgrade = (plan: 'pro' | 'business') => {
    toast.success(`Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan initiated!`);
  };

  const handleCancel = () => {
    toast.info('Subscription cancellation initiated. This cannot be undone.');
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Account & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your account settings and subscription plan
        </p>
      </div>

      {/* Account Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Business Name</p>
              <p className="text-lg font-medium text-foreground">{mockAccount.businessProfile.name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Email Address</p>
              <p className="text-lg font-medium text-foreground">{mockAccount.email}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Account Created</p>
              <p className="text-lg font-medium text-foreground">
                {mockAccount.createdAt.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Last Updated</p>
              <p className="text-lg font-medium text-foreground">
                {mockAccount.updatedAt.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button variant="outline">Edit Account Information</Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Plan Overview */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Current Plan</p>
              <h3 className="text-2xl font-bold text-foreground capitalize">
                {currentPlan} Plan
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                ${plans[currentPlan as 'free' | 'pro' | 'business'].price}/month
              </p>
            </div>
            <Crown className="w-12 h-12 text-primary opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Feature Limits */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Feature Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(mockAccount.plan.features).map(([key, value]) => {
            let icon;
            let label;
            let progressValue = 0;
            let maxValue = 0;

            if (key === 'products' && typeof value === 'boolean') {
              icon = <Package className="w-5 h-5" />;
              label = 'Products/Services';
            } else if (key === 'maxProducts' && typeof value === 'number') {
              icon = <BarChart3 className="w-5 h-5" />;
              label = 'Product Limit';
              maxValue = value;
              progressValue = currentPlan === 'free' ? 3 : currentPlan === 'pro' ? 42 : value;
            } else if (key === 'imageGallery' && typeof value === 'boolean') {
              icon = <TrendingUp className="w-5 h-5" />;
              label = 'Image Gallery';
            } else if (key === 'promotions' && typeof value === 'boolean') {
              icon = <Zap className="w-5 h-5" />;
              label = 'Promotions';
            } else {
              return null;
            }

            return (
              <div key={key} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="text-primary">{icon}</div>
                  <div>
                    <p className="font-medium text-foreground">{label}</p>
                    {maxValue > 0 && (
                      <>
                        <div className="w-48 h-2 bg-muted rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${(progressValue / maxValue) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {progressValue} of {maxValue}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Available Plans</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(plans).map(([planKey, planData]) => {
            const isCurrent = planKey === currentPlan;
            const isLower =
              (currentPlan === 'business') ||
              (currentPlan === 'pro' && planKey === 'free');

            return (
              <Card
                key={planKey}
                className={`border-0 shadow-sm overflow-hidden transition-all ${
                  isCurrent ? 'ring-2 ring-primary shadow-lg' : ''
                } ${isLower ? 'opacity-75' : ''}`}
              >
                {isCurrent && (
                  <div className="bg-primary text-primary-foreground py-2 px-4 text-center">
                    <p className="text-sm font-bold">CURRENT PLAN</p>
                  </div>
                )}

                <CardHeader className={isCurrent ? '' : ''}>
                  <CardTitle className="capitalize flex items-center justify-between">
                    {planKey} Plan
                    {planKey === 'pro' && <Zap className="w-5 h-5 text-yellow-500" />}
                    {planKey === 'business' && <Crown className="w-5 h-5 text-yellow-600" />}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Pricing */}
                  <div>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-foreground">
                        ${planData.price}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {planData.annualPrice && (
                      <p className="text-xs text-muted-foreground">
                        or ${planData.annualPrice}/year (save 2 months)
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {planData.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {isCurrent ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : isLower ? (
                    <Button disabled variant="outline" className="w-full opacity-50">
                      Downgrade
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(planKey as 'pro' | 'business')}
                    >
                      Upgrade
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Danger Zone */}
      <Card className="border-0 shadow-sm border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              These actions cannot be undone. Please be careful.
            </p>

            {currentPlan !== 'free' && (
              <Button
                variant="outline"
                className="text-orange-600 hover:text-orange-600 border-orange-200"
                onClick={handleCancel}
              >
                Cancel Subscription
              </Button>
            )}

            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => toast.error('Account deletion is not available')}
            >
              Delete Account (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            You're on the free plan, so no billing history yet.
          </p>
          <Button variant="outline" className="mt-4">
            View Full Billing History
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
