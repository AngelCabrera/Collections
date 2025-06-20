"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useTranslation } from "@/translations/TranslationContext";
import { Card, CardContent } from "@/components/ui/card";
import LanguageSwitcher from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Rating } from '@smastrom/react-rating' // Import the Rating component
import '@smastrom/react-rating/style.css'
import { useRequireAuth } from '@/contexts/useRequireAuth';
import { Input } from "@/components/ui/input";

// Define custom item shapes using Font Awesome icons
const CustomStar = (
<path xmlns="http://www.w3.org/2000/svg" d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
);

const overallRatingStyles = {
  itemShapes: CustomStar,
  activeFillColor: '#ffb700',
  inactiveFillColor: '#fbf1a9',
};


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

export default function HomePage() {
  useRequireAuth();
  const { t } = useTranslation();
  const [recentlyReadBooks, setRecentlyReadBooks] = useState<Entry[]>([]);
  const [wishlistBooks, setWishlistBooks] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const handleNameUpdate = async () => {
    if (!newName.trim()) {
      setNameError('Name cannot be empty');
      return;
    }

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update name');
      }

      const data = await response.json();
      setUserName(data.name);
      setIsEditingName(false);
      setNewName('');
      setNameError(null);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Failed to update name');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [entriesResponse, wishlistResponse, userResponse] = await Promise.all([
          fetch('/api/entries'),
          fetch('/api/wishlist'),
          fetch('/api/user')
        ]);

        if (!entriesResponse.ok) {
          throw new Error(`Error fetching recently read books: ${entriesResponse.text}`);
        }
        if (!wishlistResponse.ok) {
          throw new Error(`Error fetching wishlist items: ${wishlistResponse.text}`);
        }
        if (!userResponse.ok) {
          throw new Error(`Error fetching user data: ${userResponse.text}`);
        }

        const [entriesData, wishlistData, userData] = await Promise.all([
          entriesResponse.json(),
          wishlistResponse.json(),
          userResponse.json()
        ]);

        setRecentlyReadBooks(entriesData);
        setWishlistBooks(wishlistData);
        setUserName(userData.name || '');
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
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={userName || 'Enter your name'}
                className="w-48"
              />
              <Button onClick={handleNameUpdate} size="sm">Save</Button>
              <Button onClick={() => {
                setIsEditingName(false);
                setNewName('');
                setNameError(null);
              }} variant="outline" size="sm">Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">
                {t('greeting', {
                  name: (
                    <span 
                      onClick={() => {
                        setIsEditingName(true);
                        setNewName(userName);
                      }}
                      className="cursor-pointer hover:text-primary transition-colors"
                    >
                      {userName}
                    </span>
                  )
                })}
              </h1>
            </div>
          )}
          {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
        </div>
        <LanguageSwitcher />
      </div>

      {error && <p className="text-red-500">{t('error')}: {error}</p>}

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
              <h2 className="text-xl font-semibold">{t('recentlyRead')}</h2>
              <Link href="/recently-read">
                <Button variant="link" className="text-gray-500 cursor-pointer hover:no-underline hover:text-gray-700">{t('viewAll')}</Button>
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              {recentlyReadBooks.slice(0, 3).map((book) => (
                <Link key={book.id} href={`/recently-read/${book.id}`}>
                  <Card className="border-none shadow-md hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-800 cursor-pointer">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold">{book.title}</h3>
                      <p className="text-sm text-gray-600">{book.author}</p>
                      {book.review && <p className="text-sm text-gray-500 my-2">{book.review}</p>}
                      {book.rating !== null && (
                        <Rating
                          value={book.rating || 0}
                          readOnly={true}
                          items={5}
                          halfFillMode="svg"
                          itemStyles={overallRatingStyles}
                          style={{ maxWidth: "150px" }} // Set max width
                        />
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t('wishlist')}</h2>
              <Link href="/wishlist">
                <Button variant="link" className="text-gray-500 cursor-pointer hover:no-underline hover:text-gray-700">{t('viewAll')}</Button>
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              {wishlistBooks.slice(0, 3).map((book) => (
                <Link key={book.id} href={`/wishlist/${book.id}`}>
                  <Card className="border-none shadow-md hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-800 cursor-pointer">
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
