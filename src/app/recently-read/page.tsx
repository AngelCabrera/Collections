"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

// Define interface for book data
interface Book {
  id: number;
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

// Placeholder data (should ideally be fetched from an API or context in a real app)
const initialRecentlyReadBooks: Book[] = [
  {
    id: 1,
    title: "Book 1",
    author: "Author 1",
    recommended: true,
    rating: 5,
    formato: "digital",
    pageNumber: 300,
    startDate: "2023-01-01",
    endDate: "2023-01-15",
    favCharacter: "Character A",
    hatedCharacter: "Character B",
    ratingDetails: { romance: 4, sadness: 2, spicy: 1, final: 5 },
    genre: "Fiction",
    favPhrases: ["Phrase 1", "Phrase 2"],
    review: "Great book!"
  },
  {
    id: 2,
    title: "Book 2",
    author: "Author 2",
    recommended: false,
    rating: 4,
    formato: "physical",
    pageNumber: 450,
    startDate: "2023-02-01",
    endDate: "2023-02-20",
    favCharacter: "Character C",
    hatedCharacter: "Character D",
    ratingDetails: { romance: 1, sadness: 5, spicy: 0, final: 4 },
    genre: "Drama",
    favPhrases: ["Phrase 3"],
    review: "Enjoyed it."
  },
  {
    id: 3,
    title: "Book 3",
    author: "Author 3",
    recommended: true,
    rating: 3,
    formato: "both",
    pageNumber: 250,
    startDate: "2023-03-01",
    endDate: "2023-03-10",
    favCharacter: "Character E",
    hatedCharacter: "Character F",
    ratingDetails: { romance: 3, sadness: 3, spicy: 3, final: 3 },
    genre: "Fantasy",
    favPhrases: [],
    review: "Okay read."
  },
  {
    id: 4,
    title: "Book 4",
    author: "Author 4",
    recommended: false,
    rating: 4,
    formato: "digital",
    pageNumber: 350,
    startDate: "2023-04-01",
    endDate: "2023-04-18",
    favCharacter: "Character G",
    hatedCharacter: "Character H",
    ratingDetails: { romance: 2, sadness: 4, spicy: 1, final: 4 },
    genre: "Mystery",
    favPhrases: ["Phrase 4"],
    review: "Good read."
  },
  {
    id: 5,
    title: "Book 5",
    author: "Author 5",
    recommended: true,
    rating: 5,
    formato: "physical",
    pageNumber: 500,
    startDate: "2023-05-01",
    endDate: "2023-05-25",
    favCharacter: "Character I",
    hatedCharacter: "Character J",
    ratingDetails: { romance: 5, sadness: 1, spicy: 4, final: 5 },
    genre: "Romance",
    favPhrases: ["Phrase 5", "Phrase 6"],
    review: "Loved it!"
  },
];


export default function RecentlyReadPage() {
  const [recentlyReadBooks, setRecentlyReadBooks] = useState<Book[]>(initialRecentlyReadBooks);
  const [showForm, setShowForm] = useState(false);
  const [newBook, setNewBook] = useState<Omit<Book, 'id'>>({
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name]: value });
  };

  const handleRatingChange = (type: keyof typeof newBook.ratingDetails, value: string) => {
    setNewBook({
      ...newBook,
      ratingDetails: {
        ...newBook.ratingDetails,
        [type]: parseInt(value, 10) || 0,
      },
    });
  };

  const handleSelectChange = (name: keyof Omit<Book, 'id'>, value: string) => {
    setNewBook({ ...newBook, [name]: value });
  };

  const handleAddBook = () => {
    // Basic validation
    if (!newBook.title || !newBook.author) {
      alert("Title and Author are required.");
      return;
    }

    const bookToAdd: Book = {
      ...newBook,
      id: recentlyReadBooks.length + 1, // Simple ID generation
      rating: parseInt(newBook.rating.toString(), 10) || 0, // Ensure rating is a number
      pageNumber: parseInt(newBook.pageNumber.toString(), 10) || 0, // Ensure pageNumber is a number
    };

    setRecentlyReadBooks([...recentlyReadBooks, bookToAdd]);
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
  };

  return (
    <div className="container mx-auto py-8 px-4">
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
                <Label htmlFor="formato" className="mb-1">Formato</Label>
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

      <div className="flex flex-col gap-4">
        {recentlyReadBooks.map((book) => (
          <Link key={book.id} href={`/recently-read/${book.id}`} passHref>
            <Card className="border-none shadow-md hover:bg-gray-100 active:bg-gray-100 cursor-pointer">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold">{book.title}</h3>
                <p className="text-sm text-gray-600">{book.author}</p>
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={`text-yellow-500 ${i < book.rating ? 'fill-current' : ''}`}>
                      {i < book.rating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">{book.review}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
