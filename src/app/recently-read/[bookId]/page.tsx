"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/translations/TranslationContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Breadcrumb from '@/components/breadcrumb'; // Import Breadcrumb component
import Rating from 'react-rating'; // Import the Rating component
import { FaStar, FaHeart, FaSadTear, FaFire } from 'react-icons/fa'; // Import necessary icons

// Define interface for entry data (matching the 'entries' table structure)
interface Entry {
  id: number;
  title: string;
  author: string;
  recommended: boolean | null;
  rating: number | null;
  formato: string | null;
  page_number: number | null; // Note: snake_case from DB
  start_date: string | null; // Note: snake_case from DB
  end_date: string | null;   // Note: snake_case from DB
  fav_character: string | null; // Note: snake_case from DB
  hated_character: string | null; // Note: snake_case from DB
  rating_details: { // JSONB column
    romance: number;
    sadness: number;
    spicy: number;
    final: number;
  } | null;
  genre: string | null;
  fav_phrases: string[] | null; // JSONB column
  review: string | null;
}


export default function RecentlyReadBookPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const bookId = parseInt(params.bookId as string, 10);

  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntry = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the specific entry by ID
        const response = await fetch(`/api/entries?id=${bookId}`);
        if (!response.ok) {
          throw new Error(`Error fetching entry: ${response.statusText}`);
        }
        const data: Entry[] = await response.json();
        if (data.length > 0) {
          setEntry(data[0]); // Assuming the API returns an array with one item
        } else {
          setEntry(null); // Book not found
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t('unknownError'));
        console.error(t('errorFetchingEntry'), err);
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchEntry();
    }
  }, [bookId]); // Refetch when bookId changes

  const handleDeleteBook = async () => {
    try {
      const response = await fetch('/api/entries', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: bookId }),
      });

      if (!response.ok) {
        throw new Error(`Error deleting book: ${response.statusText}`);
      }

      // Navigate back to the recently read list after successful deletion
      router.push('/recently-read');

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t('unknownError'));
        console.error(t('errorDeletingBook'), err);
        alert(`${t('failedToDeleteBook')}: ${err instanceof Error ? err.message : t('unknownError')}`);
      }
    };


  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-8 w-1/2 mb-8" /> {/* Title skeleton */}
        <Card className="border-none shadow-md py-6">
          <CardHeader>
            <Skeleton className="h-7 w-3/4 mb-2" /> {/* Book Title skeleton */}
            <Skeleton className="h-4 w-1/2" /> {/* Author skeleton */}
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-1/4" /> {/* Recommended skeleton */}
            <Skeleton className="h-4 w-1/3" /> {/* Overall Rating skeleton */}
            <Skeleton className="h-4 w-1/4" /> {/* Format skeleton */}
            <Skeleton className="h-4 w-1/4" /> {/* Page Number skeleton */}
            <Skeleton className="h-4 w-1/4" /> {/* Start Date skeleton */}
            <Skeleton className="h-4 w-1/4" /> {/* End Date skeleton */}
            <Skeleton className="h-4 w-1/3" /> {/* Favorite Character skeleton */}
            <Skeleton className="h-4 w-1/3" /> {/* Hated Character skeleton */}
            <Skeleton className="h-4 w-1/4" /> {/* Genre skeleton */}
            <Skeleton className="h-20 w-full" /> {/* Review skeleton */}
          </CardContent>
        </Card>
        <div className="mt-8 flex justify-between">
          <Skeleton className="h-10 w-32" /> {/* Back button skeleton */}
          <Skeleton className="h-10 w-24" /> {/* Delete button skeleton */}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto py-8 px-4 text-red-500">{t('error')}: {error}</div>;
  }

  if (!entry) {
    return <div className="container mx-auto py-8 px-4">{t('bookNotFound')}</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumb itemName={entry?.title} /> {/* Add Breadcrumb component and pass item name */}
      <h1 className="text-2xl font-semibold mb-8">{t('bookDetails')}</h1>

      <Card className="border-none shadow-md py-6">
        <CardHeader>
          <CardTitle>{entry.title}</CardTitle>
          <p className="text-sm text-gray-600">{entry.author}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>{t('recommended')}:</strong> {entry.recommended ? t('yes') : t('no')}</p>
          {entry.rating !== null && (
            <div className="flex items-center">
              <strong className="mr-2">{t('overallRating')}:</strong>
              <Rating
                initialRating={entry.rating || 0}
                readonly={true}
                emptySymbol={<FaStar className="text-gray-300 mr-1" />} // Use FaStar for empty symbol
                fullSymbol={<FaStar className="text-yellow-500 mr-1" />} // Use FaStar for full symbol
                fractions={2} // Enable half stars
              />
            </div>
          )}
          {entry.formato && <p><strong>{t('format')}:</strong> {t(`format${entry.formato.charAt(0).toUpperCase()}${entry.formato.slice(1)}`)}</p>}
          {entry.page_number !== null && <p><strong>{t('pageNumber')}:</strong> {entry.page_number}</p>}
          {entry.start_date && <p><strong>{t('startDate')}:</strong> {new Date(entry.start_date).toLocaleDateString()}</p>}
          {entry.end_date && <p><strong>{t('endDate')}:</strong> {new Date(entry.end_date).toLocaleDateString()}</p>}
          {entry.fav_character && <p><strong>{t('favoriteCharacter')}:</strong> {entry.fav_character}</p>}
          {entry.hated_character && <p><strong>{t('hatedCharacter')}:</strong> {entry.hated_character}</p>}
          {entry.rating_details && (
            <div>
              <strong>{t('detailedRatings')}:</strong>
              <div className="space-y-2 mt-2">
                <div className="flex items-center">
                  <strong className="w-24">{t('romance')}:</strong>
                  <Rating
                    initialRating={entry.rating_details?.romance || 0}
                    readonly={true}
                    emptySymbol={<FaHeart className="text-gray-300 mr-1" />} // Use FaHeart for empty symbol
                    fullSymbol={<FaHeart className="text-red-500 mr-1" />} // Use FaHeart for full symbol (red for romance)
                    fractions={2}
                  />
                </div>
                <div className="flex items-center">
                  <strong className="w-24">{t('sadness')}:</strong>
                  <Rating
                    initialRating={entry.rating_details?.sadness || 0}
                    readonly={true}
                    emptySymbol={<FaSadTear className="text-gray-300 mr-1" />} // Use FaSadTear for empty symbol
                    fullSymbol={<FaSadTear className="text-blue-500 mr-1" />} // Use FaSadTear for full symbol (blue for sadness)
                    fractions={2}
                  />
                </div>
                <div className="flex items-center">
                  <strong className="w-24">{t('spicy')}:</strong>
                  <Rating
                    initialRating={entry.rating_details?.spicy || 0}
                    readonly={true}
                    emptySymbol={<FaFire className="text-gray-300 mr-1" />} // Use FaFire for empty symbol
                    fullSymbol={<FaFire className="text-orange-500 mr-1" />} // Use FaFire for full symbol (orange for spicy)
                    fractions={2}
                  />
                </div>
                <div className="flex items-center">
                  <strong className="w-24">{t('final')}:</strong>
                  <Rating
                    initialRating={entry.rating_details?.final || 0}
                    readonly={true}
                    emptySymbol={<FaStar className="text-gray-300 mr-1" />} // Use FaStar for empty symbol
                    fullSymbol={<FaStar className="text-yellow-500 mr-1" />} // Use FaStar for full symbol
                    fractions={2}
                  />
                </div>
              </div>
            </div>
          )}
          {entry.genre && <p><strong>{t('genre')}:</strong> {entry.genre}</p>}
          {entry.fav_phrases && entry.fav_phrases.length > 0 && (
            <div>
              <strong>{t('favoritePhrases')}:</strong>
              <ul className="list-disc list-inside">
                {entry.fav_phrases.map((phrase, index) => <li key={index}>{phrase}</li>)}
              </ul>
            </div>
          )}
          {entry.review && <p><strong>{t('review')}:</strong> {entry.review}</p>}
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between">
        <Link href="/recently-read">
          <Button variant="outline">{t('backToRecentlyRead')}</Button>
        </Link>
        <Button variant="destructive" onClick={handleDeleteBook}>
          {t('delete')}
        </Button>
      </div>
    </div>
  );
}
