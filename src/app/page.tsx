"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Entry {
  id: number;
  title: string;
  author: string;
  recommended: boolean | null;
  rating: number | null;
  formato: string | null;
  page_number: number | null;
  start_date: string | null;
  end_date: string | null;
  fav_character: string | null;
  hated_character: string | null;
  rating_details: {
    romance: number;
    sadness: number;
    spicy: number;
    final: number;
  } | null;
  genre: string | null;
  fav_phrases: string[] | null;
  review: string | null;
}

interface WishlistItem {
  id: number;
  title: string;
  author: string;
  note: string;
}

export default function Home() {
  const [recentlyReadBooks, setRecentlyReadBooks] = useState<Entry[]>([]);
  const [wishlistBooks, setWishlistBooks] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [entriesResponse, wishlistResponse] = await Promise.all([
          fetch('/api/entries'),
          fetch('/api/wishlist')
        ]);

        if (!entriesResponse.ok) {
          throw new Error(`Error fetching recently read books: ${entriesResponse.statusText}`);
        }
        if (!wishlistResponse.ok) {
          throw new Error(`Error fetching wishlist items: ${wishlistResponse.statusText}`);
        }

        const [entriesData, wishlistData] = await Promise.all([
          entriesResponse.json(),
          wishlistResponse.json()
        ]);

        setRecentlyReadBooks(entriesData);
        setWishlistBooks(wishlistData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-8">Hi, Patricia 👋</h1>

      {error && <p className="text-red-500">Error: {error}</p>}

      {loading && (
        <div className="flex flex-col gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="border-none shadow-md">
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="border-none shadow-md">
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recently Read</h2>
              <Link href="/recently-read">
                <Button variant="link" className="text-gray-500 cursor-pointer hover:no-underline hover:text-gray-700">View All</Button>
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              {recentlyReadBooks.slice(0, 3).map((book) => (
                <Link key={book.id} href={`/recently-read/${book.id}`}>
                  <Card className="border-none shadow-md hover:bg-gray-100 active:bg-gray-100 cursor-pointer">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold">{book.title}</h3>
                      <p className="text-sm text-gray-600">{book.author}</p>
                      {book.rating !== null && (
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={`text-yellow-500 ${i < book.rating! ? 'fill-current' : ''}`}>
                              {i < book.rating! ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                      )}
                      {book.review && <p className="text-sm text-gray-500 mt-2">{book.review}</p>}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Wishlist</h2>
              <Link href="/wishlist">
                <Button variant="link" className="text-gray-500 cursor-pointer hover:no-underline hover:text-gray-700">View All</Button>
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              {wishlistBooks.slice(0, 3).map((book) => (
                <Link key={book.id} href={`/wishlist/${book.id}`}>
                  <Card className="border-none shadow-md hover:bg-gray-100 active:bg-gray-100 cursor-pointer">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold">{book.title}</h3>
                      <p className="text-sm text-gray-600">{book.author}</p>
                      {book.note && <p className="text-sm text-gray-500 mt-2">{book.note}</p>}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
