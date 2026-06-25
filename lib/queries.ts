import { createClient } from "@/lib/supabase/server";
import type {
  Tour,
  Destination,
  Testimonial,
  TeamMember,
  Review,
  TourImage,
  TourHighlight,
  TourItinerary,
  TourInclusion,
} from "@/lib/database.types";

export type TourWithActivities = Tour & {
  destinations: { name: string; slug: string } | null;
  tour_activities: { activity_types: { name: string } | null }[];
};

export type TourDetail = Tour & {
  destinations: { name: string; slug: string } | null;
  tour_images: TourImage[];
  tour_highlights: TourHighlight[];
  tour_itinerary: TourItinerary[];
  tour_inclusions: TourInclusion[];
  reviews: Review[];
};

// True only when Supabase is configured. Lets pages render (empty) instead of
// crashing the build before env vars are set.
const hasEnv = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TOUR_LIST_SELECT =
  "*, destinations(name, slug), tour_activities(activity_types(name))";

export async function getFeaturedTours(): Promise<TourWithActivities[]> {
  if (!hasEnv) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tours")
      .select(TOUR_LIST_SELECT)
      .eq("is_featured", true)
      .order("sort_order", { ascending: false });
    return (data as unknown as TourWithActivities[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAllTours(): Promise<TourWithActivities[]> {
  if (!hasEnv) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tours")
      .select(TOUR_LIST_SELECT)
      .order("sort_order", { ascending: false });
    return (data as unknown as TourWithActivities[]) ?? [];
  } catch {
    return [];
  }
}

export async function getTourSlugs(): Promise<string[]> {
  if (!hasEnv) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("tours").select("slug");
    return (data ?? []).map((t) => t.slug);
  } catch {
    return [];
  }
}

export async function getTourBySlug(slug: string): Promise<TourDetail | null> {
  if (!hasEnv) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tours")
      .select(
        "*, destinations(name, slug), tour_images(*), tour_highlights(*), tour_itinerary(*), tour_inclusions(*), reviews(*)",
      )
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return null;

    const detail = data as unknown as TourDetail;
    detail.tour_images = [...detail.tour_images].sort((a, b) => a.position - b.position);
    detail.tour_highlights = [...detail.tour_highlights].sort((a, b) => a.position - b.position);
    detail.tour_itinerary = [...detail.tour_itinerary].sort((a, b) => a.day_number - b.day_number);
    detail.tour_inclusions = [...detail.tour_inclusions].sort((a, b) => a.position - b.position);
    return detail;
  } catch {
    return null;
  }
}

export async function getDestinations(): Promise<Destination[]> {
  if (!hasEnv) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("destinations").select("*").order("sort_order");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getFeaturedDestination(): Promise<Destination | null> {
  if (!hasEnv) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("destinations")
      .select("*")
      .eq("is_featured", true)
      .order("sort_order")
      .limit(1)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

export async function getActivityTypes(): Promise<string[]> {
  if (!hasEnv) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("activity_types")
      .select("name")
      .order("sort_order");
    return (data ?? []).map((a) => a.name);
  } catch {
    return [];
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!hasEnv) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("testimonials").select("*").order("sort_order");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getTeam(): Promise<TeamMember[]> {
  if (!hasEnv) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("team_members").select("*").order("sort_order");
    return data ?? [];
  } catch {
    return [];
  }
}

// Returns a key -> jsonb value map for the brand micro-content blocks.
export async function getSiteContent(): Promise<Record<string, unknown>> {
  if (!hasEnv) return {};
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_content").select("key, value");
    const map: Record<string, unknown> = {};
    for (const row of data ?? []) map[row.key] = row.value;
    return map;
  } catch {
    return {};
  }
}

export async function getFavoriteTourIds(userId: string): Promise<string[]> {
  if (!hasEnv) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("favorites")
      .select("tour_id")
      .eq("user_id", userId);
    return (data ?? []).map((f) => f.tour_id);
  } catch {
    return [];
  }
}
