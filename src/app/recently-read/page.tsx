"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/translations/TranslationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { FaTrash, FaStar, FaHeart, FaSadTear, FaFire } from 'react-icons/fa'; // Import necessary icons
import Breadcrumb from '@/components/breadcrumb'; // Import Breadcrumb component
import Rating from 'react-rating'; // Import the Rating component
// import '@smastrom/react-rating/style.css' // Remove old package's CSS

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

// Define interface for the new book state (camelCase for frontend form)
interface NewBookState {
  title: string;
  author: string;
  recommended: boolean;
  rating: number;
  formato: string;
  pageNumber: number;
  startDate: string;
  endDate: string;
  favCharacter: string;
  hatedCharacter: string;
  ratingDetails: {
    romance: number;
    sadness: number;
    spicy: number;
    final: number;
  };
  genre: string;
  favPhrases: string; // Change to string to hold raw input
  review: string;
}


export default function RecentlyReadPage() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newBook, setNewBook] = useState<NewBookState>({
    title: "",
    author: "",
    recommended: false,
    rating: 0,
    formato: "",
    pageNumber: 0,
    startDate: "",
    endDate: "",
    favCharacter: "",
    hatedCharacter: "",
    ratingDetails: { romance: 0, sadness: 0, spicy: 0, final: 0 },
    genre: "",
    favPhrases: "", // Initialize as empty string
    review: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/entries');
      if (!response.ok) {
        throw new Error(`Error fetching entries: ${response.statusText}`);
      }
      const data: Entry[] = await response.json();
      setEntries(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []); // Fetch entries on component mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name as keyof NewBookState]: value });
  };

  const handleRatingChange = (type: keyof NewBookState['ratingDetails'], value: string) => {
    setNewBook({
      ...newBook,
      ratingDetails: {
        ...newBook.ratingDetails,
        [type]: parseInt(value, 10) || 0,
      },
    });
  };

  const handleSelectChange = (name: keyof NewBookState, value: string) => {
    setNewBook({ ...newBook, [name]: value });
  };

  const handleAddBook = async () => {
    // Basic validation
    if (!newBook.title || !newBook.author) {
      alert(t('titleAuthorRequired'));
      return;
    }

    // Process favPhrases string into an array, handling empty input
    const processedFavPhrases = newBook.favPhrases
      .split(',')
      .map(phrase => phrase.trim())
      .filter(phrase => phrase.length > 0); // Remove empty strings

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newBook,
          favPhrases: processedFavPhrases, // Send the processed array
        }),
      });

      if (!response.ok) {
        throw new Error(`Error adding entry: ${response.statusText}`);
      }

      // Refetch the entries after adding a new item
      fetchEntries();

      setShowForm(false);
      // Reset form
      setNewBook({
        title: "",
        author: "",
        recommended: false,
        rating: 0,
        formato: "",
        pageNumber: 0,
        startDate: "",
        endDate: "",
        favCharacter: "",
        hatedCharacter: "",
        ratingDetails: { romance: 0, sadness: 0, spicy: 0, final: 0 },
        genre: "",
        favPhrases: "", // Reset to empty string
        review: ""
      });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t('unknownError'));
        console.error(t('errorAddingEntry'), err);
        alert(`${t('failedToAddBook')}: ${err instanceof Error ? err.message : t('unknownError')}`);
      }
    };

  const handleDeleteEntry = async (id: number) => {
    try {
      const response = await fetch('/api/entries', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`Error deleting entry: ${response.statusText}`);
      }

      // Update state by removing the deleted entry
      setEntries(entries.filter(entry => entry.id !== id));

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t('unknownError'));
        console.error(t('errorDeletingEntry'), err);
        alert(`${t('failedToDeleteBook')}: ${err instanceof Error ? err.message : t('unknownError')}`);
      }
    };

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumb /> {/* Add Breadcrumb component */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">{t('allRecentlyReadBooks')}</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? t('cancel') : t('addNewBook')}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 p-4">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">{t('addNewRecentlyReadBook')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="mb-1">{t('title')}</Label>
                <Input id="title" name="title" value={newBook.title} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="author" className="mb-1">{t('author')}</Label>
                <Input id="author" name="author" value={newBook.author} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="recommended" className="mb-1">{t('recommended')}</Label>
                <input
                  type="checkbox"
                  id="recommended"
                  name="recommended"
                  checked={newBook.recommended}
                  onChange={(e) => setNewBook({ ...newBook, recommended: e.target.checked })}
                  className="ml-2"
                />
              </div>
              <div>
                <Label htmlFor="rating" className="mb-1">{t('overallRating')}</Label>
                <Rating
                  initialRating={newBook.rating}
                  onChange={(value: number) => setNewBook({ ...newBook, rating: value })}
                  emptySymbol={<FaStar className="text-gray-300 mr-1" />} // Add right margin
                  fullSymbol={<FaStar className="text-yellow-500 mr-1" />} // Add right margin
                  fractions={2} // Enable half stars
                />
              </div>
              <div>
                <Label htmlFor="formato" className="mb-1">{t('format')}</Label>
                <Select onValueChange={(value) => handleSelectChange("formato", value)} value={newBook.formato}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectFormat')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">{t('digital')}</SelectItem>
                    <SelectItem value="physical">{t('physical')}</SelectItem>
                    <SelectItem value="both">{t('both')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pageNumber" className="mb-1">{t('pageNumber')}</Label>
                <Input type="number" id="pageNumber" name="pageNumber" value={newBook.pageNumber} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="startDate" className="mb-1">{t('startDate')}</Label>
                <Input type="date" id="startDate" name="startDate" value={newBook.startDate} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="endDate" className="mb-1">{t('endDate')}</Label>
                <Input type="date" id="endDate" name="endDate" value={newBook.endDate} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="favCharacter" className="mb-1">{t('favoriteCharacter')}</Label>
                <Input id="favCharacter" name="favCharacter" value={newBook.favCharacter} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="hatedCharacter" className="mb-1">{t('hatedCharacter')}</Label>
                <Input id="hatedCharacter" name="hatedCharacter" value={newBook.hatedCharacter} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="genre" className="mb-1">{t('genre')}</Label>
                <Input id="genre" name="genre" value={newBook.genre} onChange={handleInputChange} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="favPhrases" className="mb-1">{t('favoritePhrases')}</Label>
                <Input
                  id="favPhrases"
                  name="favPhrases"
                  value={newBook.favPhrases} // Use the raw string value
                  onChange={handleInputChange} // Use the generic input handler
                  placeholder={t('separatePhrasesWithCommas')} // Add placeholder text
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="review" className="mb-1">{t('review')}</Label>
                <Textarea id="review" name="review" value={newBook.review} onChange={handleInputChange} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-lg font-semibold mb-2">{t('detailedRatings')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating-romance" className="mb-1">{t('romance')}</Label>
                    <Rating
                      initialRating={newBook.ratingDetails.romance}
                      onChange={(value: number) => handleRatingChange('romance', value.toString())} // Pass value as string to match existing handler
                      emptySymbol={<FaHeart className="text-gray-300 mr-1" />} // Add right margin
                      fullSymbol={<FaHeart className="text-red-500 mr-1" />} // Add right margin (red for romance)
                      fractions={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating-sadness" className="mb-1">{t('sadness')}</Label>
                    <Rating
                      initialRating={newBook.ratingDetails.sadness}
                      onChange={(value: number) => handleRatingChange('sadness', value.toString())} // Pass value as string
                      emptySymbol={<FaSadTear className="text-gray-300 mr-1" />} // Add right margin
                      fullSymbol={<FaSadTear className="text-blue-500 mr-1" />} // Add right margin (blue for sadness)
                      fractions={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating-spicy" className="mb-1">{t('spicy')}</Label>
                    <Rating
                      initialRating={newBook.ratingDetails.spicy}
                      onChange={(value: number) => handleRatingChange('spicy', value.toString())} // Pass value as string
                      emptySymbol={<FaFire className="text-gray-300 mr-1" />} // Add right margin
                      fullSymbol={<FaFire className="text-orange-500 mr-1" />} // Add right margin (orange for spicy)
                      fractions={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating-final" className="mb-1">{t('final')}</Label>
                    <Rating
                      initialRating={newBook.ratingDetails.final}
                      onChange={(value: number) => handleRatingChange('final', value.toString())} // Pass value as string
                      emptySymbol={<FaStar className="text-gray-300 mr-1" />} // Add right margin
                      fullSymbol={<FaStar className="text-yellow-500 mr-1" />} // Add right margin
                      fractions={2}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={handleAddBook} className="mt-4">{t('addBook')}</Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="border-none shadow-md p-4">
              <CardContent className="p-0">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {error && <p className="text-red-500">{t('error')}: {error}</p>}

          {!loading && !error && (
            <div className="flex flex-col gap-4">
              {entries.map((entry) => (
                <Card key={entry.id} className="border-none shadow-md hover:bg-gray-100 active:bg-gray-100 cursor-pointer relative"> {/* Added relative positioning */}
                  <Link href={`/recently-read/${entry.id}`} passHref> {/* Link wraps content */}
                    <CardContent className="p-4 pr-10"> {/* Added right padding to make space for button */}
                      <h3 className="text-lg font-semibold">{entry.title}</h3>
                      <p className="text-sm text-gray-600">{entry.author}</p>
                      {/* Display overall rating if available */}
                      {entry.rating !== null && (
                        <Rating
                          initialRating={entry.rating || 0}
                          readonly={true}
                          emptySymbol={<FaStar className="text-gray-300 mr-1" />} // Add right margin
                          fullSymbol={<FaStar className="text-yellow-500 mr-1" />} // Add right margin
                          fractions={2} // Enable half stars
                        />
                  )}
                  {/* Display review if available */}
                  {entry.review && <p className="text-sm text-gray-500 mt-2">{entry.review}</p>}
                </CardContent>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)} className="absolute top-2 right-2 cursor-pointer"> {/* Positioned in top right */}
                <FaTrash className="text-red-500" /> {/* Added trash icon and color */}
              </Button>
            </Card>
          ))}
        </div>
      )}

  <div className="mt-8">
    <Link href="/">
      <Button variant="outline">{t('backToHome')}</Button>
    </Link>
  </div>
</div>
);
}
