import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Handle GET requests to fetch wishlist items
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  let query = supabase.from('items').select('*');

  console.log(id)

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
  const { title, author, note } = await request.json();

  // Basic validation
  if (!title || !author) {
    return NextResponse.json({ error: 'Title and author are required' }, { status: 400 });
  }

  const { data, error } = await supabase.from('items').insert([{ title, author, note }]);

  if (error) {
    console.error('Error adding wishlist item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// Handle DELETE requests to remove a wishlist item
export async function DELETE(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
  }

  const { error } = await supabase.from('items').delete().eq('id', id);

  if (error) {
    console.error('Error deleting wishlist item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
}
