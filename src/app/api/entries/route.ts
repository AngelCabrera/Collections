import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies as getCookies } from 'next/headers';
import type { CookieOptions } from '@supabase/ssr';

// Helper to adapt the cookies() API to the interface expected by Supabase SSR
async function getSupabaseCookies() {
  const cookieStore = await getCookies();
  return {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      // Not needed for API route context
    },
    remove(name: string, options: CookieOptions) {
      // Not needed for API route context
    },
  };
}

// Handle GET requests to fetch entries
export async function GET(request: Request) {
  const cookies = await getSupabaseCookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  let query = supabase.from('entries').select('*').eq('user_id', user.id);

  if (id) {
    query = query.eq('id', id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Handle POST requests to add a new entry
export async function POST(request: Request) {
  const cookies = await getSupabaseCookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    title,
    author,
    recommended,
    rating,
    formato,
    pageNumber,
    startDate,
    endDate,
    favCharacter,
    hatedCharacter,
    ratingDetails,
    genre,
    favPhrases,
    review,
  } = await request.json();

  // Basic validation (title and author are required based on table schema)
  if (!title || !author) {
    return NextResponse.json({ error: 'Title and author are required' }, { status: 400 });
  }

  const { data, error } = await supabase.from('entries').insert([{
    user_id: user.id, // Associate entry with user_id
    title,
    author,
    recommended,
    rating,
    formato,
    page_number: pageNumber, // Map camelCase to snake_case for DB column
    start_date: startDate,   // Map camelCase to snake_case for DB column
    end_date: endDate,       // Map camelCase to snake_case for DB column
    fav_character: favCharacter, // Map camelCase to snake_case for DB column
    hated_character: hatedCharacter, // Map camelCase to snake_case for DB column
    rating_details: ratingDetails, // JSONB column
    genre,
    fav_phrases: favPhrases, // JSONB column
    review,
  }]).select();

  if (error) {
    console.error('Error adding entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// Handle DELETE requests to remove an entry
export async function DELETE(request: Request) {
  const cookies = await getSupabaseCookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
  }

  const { error } = await supabase.from('entries').delete().eq('id', id).eq('user_id', user.id);

  if (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Entry deleted successfully' }, { status: 200 });
}
