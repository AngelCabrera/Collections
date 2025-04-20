"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

// Define interface for wishlist book data
interface WishlistBook {
  id: number;
  title: string;
  author: string;
  note: string;
}

// Placeholder data (should ideally be fetched from an API or context in a real app)
const initialWishlistBooks: WishlistBook[] = [
  { id: 1, title: "Wishlist Book 1", author: "Wishlist Author 1", note: "Heard good things." },
  { id: 2, title: "Wishlist Book 2", author: "Wishlist Author 2", note: "Recommended by a friend." },
  { id: 3, title: "Wishlist Book 3", author: "Wishlist Author 3", note: "Looks interesting." },
  { id: 4, title: "Wishlist Book 4", author: "Wishlist Author 4", note: "Want to read this year." },
  { id: 5, title: "Wishlist Book 5", author: "Wishlist Author 5", note: "Gift idea." },
];

export default function WishlistPage() {
  const [wishlistBooks, setWishlistBooks] = useState<WishlistBook[]>(initialWishlistBooks);
  const [showForm, setShowForm] = useState(false);
  const [newBook, setNewBook] = useState<Omit<WishlistBook, 'id'>>({
    title: "",
    author: "",
    note: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name]: value });
  };

  const handleAddBook = () => {
    // Basic validation
    if (!newBook.title || !newBook.author) {
      alert("Title and Author are required.");
      return;
    }

    const bookToAdd: WishlistBook = {
      ...newBook,
      id: wishlistBooks.length + 1, // Simple ID generation
    };

    setWishlistBooks([...wishlistBooks, bookToAdd]);
    setShowForm(false);
    // Reset form
    setNewBook({
      title: "",
      author: "",
      note: "",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">All Wishlist Books</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add New Book'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 p-4">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Add New Wishlist Book</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="mb-1">Title</Label>
                <Input id="title" name="title" value={newBook.title} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="author" className="mb-1">Author</Label>
                <Input id="author" name="author" value={newBook.author} onChange={handleInputChange} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="note" className="mb-1">Note</Label>
                <Textarea id="note" name="note" value={newBook.note} onChange={handleInputChange} />
              </div>
            </div>
            <Button onClick={handleAddBook} className="mt-4">Add Book</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        {wishlistBooks.map((book) => (
          <Card key={book.id} className="border-none shadow-md hover:bg-gray-100 active:bg-gray-100 cursor-pointer">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">{book.title}</h3>
              <p className="text-sm text-gray-600">{book.author}</p>
              {book.note && <p className="text-sm text-gray-500 mt-2">{book.note}</p>}
            </CardContent>
          </Card>
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
