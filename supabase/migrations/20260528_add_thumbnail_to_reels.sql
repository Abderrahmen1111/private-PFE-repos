-- Migration: Add Thumbnail URL to Reels
-- Description: Adds an optional thumbnail_url text column to the reels table to store custom thumbnail URLs.

ALTER TABLE public.reels ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
