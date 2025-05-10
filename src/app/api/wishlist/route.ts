import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies as getCookies } from 'next/headers';

async function getSupabaseCookies() {
  const cookieStore = await getCookies();
  return {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
  };
}

// Handle GET requests to fetch wishlist items
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

  let query = supabase.from('items').select('*').eq('user_id', user.id);

  if (id) {
    query = query.eq('id', id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching wishlist items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Handle POST requests to add a new wishlist item
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

  const { title, author, note } = await request.json();

  // Basic validation
  if (!title || !author) {
    return NextResponse.json({ error: 'Title and author are required' }, { status: 400 });
  }

  const { data, error } = await supabase.from('items').insert([{ title, author, note, user_id: user.id }]).select();

  if (error) {
    console.error('Error adding wishlist item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// Handle DELETE requests to remove a wishlist item
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
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
  }

  const { error } = await supabase.from('items').delete().eq('id', id).eq('user_id', user.id);

  if (error) {
    console.error('Error deleting wishlist item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
}
