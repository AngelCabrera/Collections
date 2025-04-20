"use client";

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Placeholder data (should ideally be fetched from an API or context in a real app)
const initialRecentlyReadBooks = [
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

export default function RecentlyReadBookPage() {
  const params = useParams();
  const bookId = parseInt(params.bookId as string, 10);

  // Find the book with the matching ID
  const book = initialRecentlyReadBooks.find(book => book.id === bookId);

  if (!book) {
    return <div className="container mx-auto py-8 px-4">Book not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-8">Book Details</h1>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>{book.title}</CardTitle>
          <p className="text-sm text-gray-600">{book.author}</p>
        </CardHeader>
        <CardContent className="space-y-4 py-6">
          <p><strong>Recommended:</strong> {book.recommended ? 'Yes' : 'No'}</p>
          <div className="flex items-center">
            <strong className="mr-2">Overall Rating:</strong>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={`text-yellow-500 ${i < book.rating ? 'fill-current' : ''}`}>
                {i < book.rating ? '★' : '☆'}
              </span>
            ))}
          </div>
          <p><strong>Formato:</strong> {book.formato}</p>
          <p><strong>Page Number:</strong> {book.pageNumber}</p>
          <p><strong>Start Date:</strong> {book.startDate}</p>
          <p><strong>End Date:</strong> {book.endDate}</p>
          <p><strong>Favorite Character:</strong> {book.favCharacter}</p>
          <p><strong>Hated Character:</strong> {book.hatedCharacter}</p>
          <div>
            <strong>Detailed Ratings:</strong>
            <div className="space-y-2 mt-2">
              <div className="flex items-center">
                <strong className="w-24">Romance:</strong>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`text-red-500 ${i < book.ratingDetails.romance ? 'fill-current' : ''}`}>
                    {i < book.ratingDetails.romance ? '❤️' : '🤍'}
                  </span>
                ))}
              </div>
              <div className="flex items-center">
                <strong className="w-24">Sadness:</strong>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`text-blue-500 ${i < book.ratingDetails.sadness ? 'fill-current' : ''}`}>
                    {i < book.ratingDetails.sadness ? '💧' : '◦'} {/* Using '◦' for empty tear drop */}
                  </span>
                ))}
              </div>
              <div className="flex items-center">
                <strong className="w-24">Spicy:</strong>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`text-orange-500 ${i < book.ratingDetails.spicy ? 'fill-current' : ''}`}>
                    {i < book.ratingDetails.spicy ? '🌶️' : '◦'} {/* Using '◦' for empty chili */}
                  </span>
                ))}
              </div>
              <div className="flex items-center">
                <strong className="w-24">Final:</strong>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`text-green-500 ${i < book.ratingDetails.final ? 'fill-current' : ''}`}>
                    {i < book.ratingDetails.final ? '✅' : '◦'} {/* Using '◦' for empty checkmark */}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p><strong>Genre:</strong> {book.genre}</p>
          <div>
            <strong>Favorite Phrases:</strong>
            {book.favPhrases.length > 0 ? (
              <ul className="list-disc list-inside">
                {book.favPhrases.map((phrase, index) => <li key={index}>{phrase}</li>)}
              </ul>
            ) : (
              <span> None</span>
            )}
          </div>
          <p><strong>Review:</strong> {book.review}</p>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Link href="/recently-read">
          <Button variant="outline">Back to Recently Read</Button>
        </Link>
      </div>
    </div>
  );
}
