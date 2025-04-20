"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Breadcrumb from '@/components/breadcrumb'; // Import Breadcrumb component

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
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching entry:', err);
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
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error deleting book:', err);
      alert(`Failed to delete book: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
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
    return <div className="container mx-auto py-8 px-4 text-red-500">Error: {error}</div>;
  }

  if (!entry) {
    return <div className="container mx-auto py-8 px-4">Book not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumb itemName={entry?.title} /> {/* Add Breadcrumb component and pass item name */}
      <h1 className="text-2xl font-semibold mb-8">Book Details</h1>

      <Card className="border-none shadow-md py-6">
        <CardHeader>
          <CardTitle>{entry.title}</CardTitle>
          <p className="text-sm text-gray-600">{entry.author}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Recommended:</strong> {entry.recommended ? 'Yes' : 'No'}</p>
          {entry.rating !== null && (
            <div className="flex items-center">
              <strong className="mr-2">Overall Rating:</strong>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`text-yellow-500 ${i < (entry.rating || 0) ? 'fill-current' : ''}`}>
                  {i < (entry.rating || 0) ? '★' : '☆'}
                </span>
              ))}
            </div>
          )}
          {entry.formato && <p><strong>Format:</strong> {entry.formato}</p>}
          {entry.page_number !== null && <p><strong>Page Number:</strong> {entry.page_number}</p>}
          {entry.start_date && <p><strong>Start Date:</strong> {entry.start_date}</p>}
          {entry.end_date && <p><strong>End Date:</strong> {entry.end_date}</p>}
          {entry.fav_character && <p><strong>Favorite Character:</strong> {entry.fav_character}</p>}
          {entry.hated_character && <p><strong>Hated Character:</strong> {entry.hated_character}</p>}
          {entry.rating_details && (
            <div>
              <strong>Detailed Ratings:</strong>
              <div className="space-y-2 mt-2">
                <div className="flex items-center">
                  <strong className="w-24">Romance:</strong>
                  {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`text-red-500 ${i < (entry.rating_details?.romance || 0) ? 'fill-current' : ''}`}>
                    {i < (entry.rating_details?.romance || 0) ? '❤️' : '🤍'}
                  </span>
                  ))}
                </div>
                <div className="flex items-center">
                  <strong className="w-24">Sadness:</strong>
                  {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`text-blue-500 ${i < (entry.rating_details?.sadness || 0) ? 'fill-current' : ''}`}>
                    {i < (entry.rating_details?.sadness || 0) ? '💧' : '◦'} {/* Using '◦' for empty tear drop */}
                  </span>
                  ))}
                </div>
                <div className="flex items-center">
                  <strong className="w-24">Spicy:</strong>
                  {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`text-orange-500 ${i < (entry.rating_details?.spicy || 0) ? 'fill-current' : ''}`}>
                    {i < (entry.rating_details?.spicy || 0) ? '🌶️' : '◦'} {/* Using '◦' for empty chili */}
                  </span>
                  ))}
                </div>
                <div className="flex items-center">
                  <strong className="w-24">Final:</strong>
                  {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`text-green-500 ${i < (entry.rating_details?.final || 0) ? 'fill-current' : ''}`}>
                    {i < (entry.rating_details?.final || 0) ? '✅' : '◦'} {/* Using '◦' for empty checkmark */}
                  </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {entry.genre && <p><strong>Genre:</strong> {entry.genre}</p>}
          {entry.fav_phrases && entry.fav_phrases.length > 0 && (
            <div>
              <strong>Favorite Phrases:</strong>
              <ul className="list-disc list-inside">
                {entry.fav_phrases.map((phrase, index) => <li key={index}>{phrase}</li>)}
              </ul>
            </div>
          )}
          {entry.review && <p><strong>Review:</strong> {entry.review}</p>}
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between">
        <Link href="/recently-read">
          <Button variant="outline">Back to Recently Read</Button>
        </Link>
        <Button variant="destructive" onClick={handleDeleteBook}>
          Delete
        </Button>
      </div>
    </div>
  );
}
