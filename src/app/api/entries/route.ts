import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Handle GET requests to fetch entries
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  let query = supabase.from('entries').select('*');

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
  }]);

  if (error) {
    console.error('Error adding entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// Handle DELETE requests to remove an entry
export async function DELETE(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
  }

  const { error } = await supabase.from('entries').delete().eq('id', id);

  if (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Entry deleted successfully' }, { status: 200 });
}
