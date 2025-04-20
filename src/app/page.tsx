import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Placeholder data
const recentlyReadBooks = [
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
];

const wishlistBooks = [
  { id: 1, title: "Wishlist Book 1", author: "Wishlist Author 1", note: "Heard good things." },
  { id: 2, title: "Wishlist Book 2", author: "Wishlist Author 2", note: "Recommended by a friend." },
  { id: 3, title: "Wishlist Book 3", author: "Wishlist Author 3", note: "Looks interesting." },
];

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-8">Hi, John Doe 👋</h1>

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
              <Card key={book.id} className="border-none shadow-md hover:bg-gray-100 active:bg-gray-100">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold">{book.title}</h3>
                  <p className="text-sm text-gray-600">{book.author}</p>
                  <p className="text-sm text-gray-500 mt-2">{book.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
