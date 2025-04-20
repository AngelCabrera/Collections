"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { FaTrash } from 'react-icons/fa'; // Import the trash icon
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
  favPhrases: string[];
  review: string;
}


export default function RecentlyReadPage() {
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
    favPhrases: [],
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
      alert("Title and Author are required.");
      return;
    }

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBook),
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
        favPhrases: [],
        review: ""
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error adding entry:', err);
      alert(`Failed to add book: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
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
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error deleting entry:', err);
      alert(`Failed to delete book: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumb /> {/* Add Breadcrumb component */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">All Recently Read Books</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add New Book'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 p-4">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Add New Recently Read Book</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="mb-1">Title</Label>
                <Input id="title" name="title" value={newBook.title} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="author" className="mb-1">Author</Label>
                <Input id="author" name="author" value={newBook.author} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="recommended" className="mb-1">Recommended</Label>
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
                <Label htmlFor="rating" className="mb-1">Overall Rating</Label>
                <Input type="number" id="rating" name="rating" value={newBook.rating} onChange={handleInputChange} min="0" max="5" />
              </div>
              <div>
                <Label htmlFor="formato" className="mb-1">Format</Label>
                <Select onValueChange={(value) => handleSelectChange("formato", value)} value={newBook.formato}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pageNumber" className="mb-1">Page Number</Label>
                <Input type="number" id="pageNumber" name="pageNumber" value={newBook.pageNumber} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="startDate" className="mb-1">Start Date</Label>
                <Input type="date" id="startDate" name="startDate" value={newBook.startDate} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="endDate" className="mb-1">End Date</Label>
                <Input type="date" id="endDate" name="endDate" value={newBook.endDate} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="favCharacter" className="mb-1">Favorite Character</Label>
                <Input id="favCharacter" name="favCharacter" value={newBook.favCharacter} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="hatedCharacter" className="mb-1">Hated Character</Label>
                <Input id="hatedCharacter" name="hatedCharacter" value={newBook.hatedCharacter} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="genre" className="mb-1">Genre</Label>
                <Input id="genre" name="genre" value={newBook.genre} onChange={handleInputChange} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="favPhrases" className="mb-1">Favorite Phrases (comma-separated)</Label>
                <Input
                  id="favPhrases"
                  name="favPhrases"
                  value={newBook.favPhrases.join(', ')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBook({ ...newBook, favPhrases: e.target.value.split(',').map((phrase: string) => phrase.trim()) })}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="review" className="mb-1">Review</Label>
                <Textarea id="review" name="review" value={newBook.review} onChange={handleInputChange} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-lg font-semibold mb-2">Detailed Ratings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating-romance" className="mb-1">Romance</Label>
                    <Input type="number" id="rating-romance" name="romance" value={newBook.ratingDetails.romance} onChange={(e) => handleRatingChange('romance', e.target.value)} min="0" max="5" />
                  </div>
                  <div>
                    <Label htmlFor="rating-sadness" className="mb-1">Sadness</Label>
                    <Input type="number" id="rating-sadness" name="sadness" value={newBook.ratingDetails.sadness} onChange={(e) => handleRatingChange('sadness', e.target.value)} min="0" max="5" />
                  </div>
                  <div>
                    <Label htmlFor="rating-spicy" className="mb-1">Spicy</Label>
                    <Input type="number" id="rating-spicy" name="spicy" value={newBook.ratingDetails.spicy} onChange={(e) => handleRatingChange('spicy', e.target.value)} min="0" max="5" />
                  </div>
                  <div>
                    <Label htmlFor="rating-final" className="mb-1">Final</Label>
                    <Input type="number" id="rating-final" name="final" value={newBook.ratingDetails.final} onChange={(e) => handleRatingChange('final', e.target.value)} min="0" max="5" />
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={handleAddBook} className="mt-4">Add Book</Button>
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
      {error && <p className="text-red-500">Error: {error}</p>}

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
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={`text-yellow-500 ${i < (entry.rating || 0) ? 'fill-current' : ''}`}>
                              {i < (entry.rating || 0) ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
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
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
