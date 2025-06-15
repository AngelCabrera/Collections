"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation, type TranslationKey } from "@/translations/TranslationContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Breadcrumb from '@/components/breadcrumb'; // Import Breadcrumb component
import { Rating } from '@smastrom/react-rating' // Import the Rating component
import '@smastrom/react-rating/style.css'
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAuth } from '@/contexts/useRequireAuth';

// Define custom item shapes using Font Awesome icons
const CustomStar = (
<path xmlns="http://www.w3.org/2000/svg" d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
);

const CustomHeart = (
  <path xmlns="http://www.w3.org/2000/svg" d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z"/>
);

// Placeholder for sadness icon - no direct droplet/tear found in react-icons/fa
const CustomSadnessPlaceholder = (
  <path xmlns="http://www.w3.org/2000/svg" d="M491-200q12-1 20.5-9.5T520-230q0-14-9-22.5t-23-7.5q-41 3-87-22.5T343-375q-2-11-10.5-18t-19.5-7q-14 0-23 10.5t-6 24.5q17 91 80 130t127 35ZM480-80q-137 0-228.5-94T160-408q0-100 79.5-217.5T480-880q161 137 240.5 254.5T800-408q0 140-91.5 234T480-80Z"/>
);


const CustomFire = (
  <path xmlns="http://www.w3.org/2000/svg" d="M160-400q0-105 50-187t110-138q60-56 110-85.5l50-29.5v132q0 37 25 58.5t56 21.5q17 0 32.5-7t28.5-23l18-22q72 42 116 116.5T800-400q0 88-43 160.5T644-125q17-24 26.5-52.5T680-238q0-40-15-75.5T622-377L480-516 339-377q-29 29-44 64t-15 75q0 32 9.5 60.5T316-125q-70-42-113-114.5T160-400Zm320-4 85 83q17 17 26 38t9 45q0 49-35 83.5T480-120q-50 0-85-34.5T360-238q0-23 9-44.5t26-38.5l85-83Z"/>
);

const CustomFinal = (
  <path
    xmlns="http://www.w3.org/2000/svg"
    d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0-83-31.5-156T763-197q-54-54-127-85.5T480-80Z"
  />
);

const overallRatingStyles = {
  itemShapes: CustomStar,
  activeFillColor: '#ffb700',
  inactiveFillColor: '#fbf1a9',
};

const romanceRatingStyles = {
  itemShapes: CustomHeart,
  activeFillColor: '#e31b23', // Red color for heart
  inactiveFillColor: '#ffb3b3', // Lighter red
};

const sadnessRatingStyles = {
  itemShapes: CustomSadnessPlaceholder,
  activeFillColor: '#007bff', // Blue color for placeholder
  inactiveFillColor: '#b3d9ff', // Lighter blue
};

const spicyRatingStyles = {
  itemShapes: CustomFire,
  activeFillColor: '#ff6b00',
  inactiveFillColor: '#f8d7da',
};

const finalRatingStyles = {
  itemShapes: CustomFinal,
  activeFillColor: '#28a745',
  inactiveFillColor: '#d4edda',
};


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
  useRequireAuth();
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const bookId = parseInt(params.bookId as string, 10);

  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchEntry = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user) {
          setEntry(null);
          setLoading(false);
          return;
        }
        // Fetch the specific entry by ID and user_id
        const response = await fetch(`/api/entries?id=${bookId}&user_id=${user.id}`);
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
        setError(err instanceof Error ? err.message : typeof t === 'function' ? String(t('unknownError')) : 'Unknown error');
        console.error(typeof t === 'function' ? String(t('errorFetchingEntry')) : 'Error fetching entry', err);
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchEntry();
    }
  }, [bookId, t, user]); // Refetch when bookId or user changes

  const handleDeleteBook = async () => {
    if (!user) {
      setError('You must be logged in to delete an entry.');
      return;
    }
    try {
      const response = await fetch('/api/entries', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: bookId, user_id: user.id }),
      });

      if (!response.ok) {
        throw new Error(`Error deleting book: ${response.statusText}`);
      }

      // Navigate back to the recently read list after successful deletion
      router.push('/recently-read');

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : typeof t === 'function' ? String(t('unknownError')) : 'Unknown error');
        console.error(typeof t === 'function' ? String(t('errorDeletingBook')) : 'Error deleting book', err);
        alert(`${typeof t === 'function' ? String(t('failedToDeleteBook')) : 'Failed to delete book'}: ${err instanceof Error ? err.message : typeof t === 'function' ? String(t('unknownError')) : 'Unknown error'}`);
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
                value={entry.rating || 0}
                readOnly={true}
                items={5}
                halfFillMode="svg"
                itemStyles={overallRatingStyles}
                style={{ maxWidth: "150px" }} // Set max width
              />
            </div>
          )}
          {entry.formato && <p><strong>{t('format')}:</strong> {t(`format${entry.formato.charAt(0).toUpperCase()}${entry.formato.slice(1)}` as TranslationKey)}</p>}
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
                    value={entry.rating_details?.romance || 0}
                    readOnly={true}
                    items={5}
                    halfFillMode="svg"
                    itemStyles={romanceRatingStyles}
                    style={{ maxWidth: "150px" }} // Set max width
                  />
                </div>
                <div className="flex items-center">
                  <strong className="w-24">{t('sadness')}:</strong>
                  <Rating
                    value={entry.rating_details?.sadness || 0}
                    readOnly={true}
                    items={5}
                    halfFillMode="svg"
                    itemStyles={sadnessRatingStyles}
                    style={{ maxWidth: "150px" }} // Set max width
                  />
                </div>
                <div className="flex items-center">
                  <strong className="w-24">{t('spicy')}:</strong>
                  <Rating
                    value={entry.rating_details?.spicy || 0}
                    readOnly={true}
                    items={5}
                    halfFillMode="svg"
                    itemStyles={spicyRatingStyles}
                    style={{ maxWidth: "150px" }} // Set max width
                  />
                </div>
                <div className="flex items-center">
                  <strong className="w-24">{t('final')}:</strong>
                  <Rating
                    value={entry.rating_details?.final || 0}
                    readOnly={true}
                    items={5}
                    halfFillMode="svg"
                    itemStyles={finalRatingStyles}
                    style={{ maxWidth: "150px" }} // Set max width
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
