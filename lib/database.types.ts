// Hand-maintained types for the Supabase schema (see supabase/migrations).
// Regenerate with `supabase gen types typescript` once a project is linked.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// --- Standalone row shapes -------------------------------------------------

export type DestinationRow = {
  id: string;
  slug: string;
  name: string;
  tag: string;
  description: string;
  long_description: string | null;
  hero_image_url: string;
  is_featured: boolean;
  avg_temp: string | null;
  best_season: string | null;
  signature_tours: number;
  sort_order: number;
  created_at: string;
}

export type ActivityTypeRow = {
  id: string;
  name: string;
  sort_order: number;
}

export type TourRow = {
  id: string;
  slug: string;
  title: string;
  destination_id: string;
  location: string;
  price_cents: number;
  rating: number;
  reviews_count: number;
  duration_days: number;
  duration_label: string;
  badge: string | null;
  badge_color: string;
  card_image_url: string;
  overview: string | null;
  is_featured: boolean;
  is_published: boolean;
  spots_left: number | null;
  booked_last_24h: number | null;
  sort_order: number;
  created_at: string;
}

export type TourActivityRow = {
  tour_id: string;
  activity_type_id: string;
}

export type TourImageRow = {
  id: string;
  tour_id: string;
  url: string;
  position: number;
  in_carousel: boolean;
}

export type TourHighlightRow = {
  id: string;
  tour_id: string;
  text: string;
  position: number;
}

export type TourItineraryRow = {
  id: string;
  tour_id: string;
  day_number: number;
  title: string;
  body: string;
}

export type TourInclusionRow = {
  id: string;
  tour_id: string;
  kind: "included" | "excluded";
  text: string;
  position: number;
}

export type ReviewRow = {
  id: string;
  tour_id: string;
  author_name: string;
  initials: string;
  rating: number;
  body: string;
  review_date: string;
  is_published: boolean;
  created_at: string;
}

export type TestimonialRow = {
  id: string;
  quote: string;
  initials: string;
  name: string;
  trip: string;
  rating: number;
  sort_order: number;
}

export type TeamMemberRow = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string;
  sort_order: number;
}

export type SiteContentRow = {
  key: string;
  value: Json;
  updated_at: string;
}

export type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

export type FavoriteRow = {
  user_id: string;
  tour_id: string;
  created_at: string;
}

export type BookingRequestRow = {
  id: string;
  user_id: string | null;
  tour_id: string;
  travel_date: string | null;
  travelers: number;
  insurance: boolean;
  total_cents: number;
  status: "pending" | "confirmed" | "cancelled";
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
}

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interest: string | null;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
}

export type NewsletterSubscriberRow = {
  id: string;
  email: string;
  created_at: string;
}

// --- Table helper: Row / Insert / Update / Relationships -------------------

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      destinations: TableDef<DestinationRow>;
      activity_types: TableDef<ActivityTypeRow>;
      tours: TableDef<TourRow>;
      tour_activities: {
        Row: TourActivityRow;
        Insert: TourActivityRow;
        Update: Partial<TourActivityRow>;
        Relationships: [];
      };
      tour_images: TableDef<TourImageRow>;
      tour_highlights: TableDef<TourHighlightRow>;
      tour_itinerary: TableDef<TourItineraryRow>;
      tour_inclusions: TableDef<TourInclusionRow>;
      reviews: TableDef<ReviewRow>;
      testimonials: TableDef<TestimonialRow>;
      team_members: TableDef<TeamMemberRow>;
      site_content: TableDef<SiteContentRow>;
      profiles: TableDef<ProfileRow>;
      favorites: {
        Row: FavoriteRow;
        Insert: { user_id: string; tour_id: string; created_at?: string };
        Update: Partial<FavoriteRow>;
        Relationships: [];
      };
      booking_requests: TableDef<BookingRequestRow>;
      contact_messages: TableDef<ContactMessageRow>;
      newsletter_subscribers: {
        Row: NewsletterSubscriberRow;
        Insert: { email: string; id?: string; created_at?: string };
        Update: Partial<NewsletterSubscriberRow>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

// Convenience aliases used across the app
export type Destination = DestinationRow;
export type ActivityType = ActivityTypeRow;
export type Tour = TourRow;
export type TourImage = TourImageRow;
export type TourHighlight = TourHighlightRow;
export type TourItinerary = TourItineraryRow;
export type TourInclusion = TourInclusionRow;
export type Review = ReviewRow;
export type Testimonial = TestimonialRow;
export type TeamMember = TeamMemberRow;
export type Profile = ProfileRow;
export type BookingRequest = BookingRequestRow;
