"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/translations/TranslationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { FaTrash } from 'react-icons/fa'; // Import the trash icon
import Breadcrumb from '@/components/breadcrumb'; // Import Breadcrumb component
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth to get the current user
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { useRequireAuth } from '@/contexts/useRequireAuth'; // Import useRequireAuth hook

// Define interface for wishlist book data
interface WishlistBook {
  id: number;
  title: string;
  author: string;
  note: string;
}

export default function WishlistPage() {
  useRequireAuth(); // Enforce login redirect using useRequireAuth hook

  const { t } = useTranslation();
  const { user, isLoading } = useAuth(); // Get the current user and loading state
  const router = useRouter();
  const [wishlistBooks, setWishlistBooks] = useState<WishlistBook[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newBook, setNewBook] = useState<Omit<WishlistBook, 'id'>>({
    title: "",
    author: "",
    note: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user) {
        setWishlistBooks([]);
        setLoading(false);
        return;
      }
      const response = await fetch(`/api/wishlist?user_id=${user.id}`);
      if (!response.ok) {
        throw new Error(`Error fetching wishlist: ${response.statusText}`);
      }
      const data: WishlistBook[] = await response.json();
      setWishlistBooks(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []); // Fetch wishlist on component mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name]: value });
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      setError('You must be logged in to add an item.');
      return;
    }

    // Basic validation
    if (!newBook.title || !newBook.author) {
      alert(t('titleAuthorRequired'));
      return;
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newBook, user_id: user.id }),
      });

      if (!response.ok) {
        throw new Error(`Error adding wishlist item: ${response.statusText}`);
      }

      // Refetch the wishlist after adding a new item
      fetchWishlist();

      setShowForm(false);
      // Reset form
      setNewBook({
        title: "",
        author: "",
        note: "",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('unknownError'));
      console.error(t('errorAddingWishlistItem'), err);
      alert(`${t('failedToAddBook')}: ${err instanceof Error ? err.message : t('unknownError')}`);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`Error deleting wishlist item: ${response.statusText}`);
      }

      // Update state by removing the deleted item
      setWishlistBooks(wishlistBooks.filter(item => item.id !== id));

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('unknownError'));
      console.error(t('errorDeletingWishlistItem'), err);
      alert(`${t('failedToDeleteBook')}: ${err instanceof Error ? err.message : t('unknownError')}`);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumb /> {/* Add Breadcrumb component */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">{t('allWishlistBooks')}</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? t('cancel') : t('addNewBook')}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 p-4">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">{t('addNewWishlistBook')}</h2>
            <form onSubmit={handleAddBook}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="mb-1">{t('title')}</Label>
                  <Input id="title" name="title" value={newBook.title} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="author" className="mb-1">{t('author')}</Label>
                  <Input id="author" name="author" value={newBook.author} onChange={handleInputChange} />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Label htmlFor="note" className="mb-1">{t('note')}</Label>
                  <Textarea id="note" name="note" value={newBook.note} onChange={handleInputChange} />
                </div>
              </div>
              <Button type="submit" className="mt-4">{t('addBook')}</Button>
            </form>
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
              {wishlistBooks.map((book) => (
                <Card key={book.id} className="border-none shadow-md hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-800 cursor-pointer relative"> {/* Added relative positioning */}
                  <Link href={`/wishlist/${book.id}`} passHref> {/* Link wraps content */}
                    <CardContent className="p-4 pr-10"> {/* Added right padding to make space for button */}
                      <h3 className="text-lg font-semibold">{book.title}</h3>
                      <p className="text-sm text-gray-600">{book.author}</p>
                      {book.note && <p className="text-sm text-gray-500 mt-2">{t('note')}: {book.note}</p>}
                    </CardContent>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(book.id)} className="absolute top-2 right-2 cursor-pointer"> {/* Changed variant, added cursor-pointer */}
                    <FaTrash className="text-red-500" /> {/* Using the trash icon and added color */}
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
