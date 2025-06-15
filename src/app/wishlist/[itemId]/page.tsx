"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation, type TranslationKey } from "@/translations/TranslationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Breadcrumb from '@/components/breadcrumb'; // Import Breadcrumb component
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAuth } from '@/contexts/useRequireAuth';

// Define interface for wishlist item data (matching the 'items' table structure)
interface WishlistItem {
  id: number;
  title: string;
  author: string;
  note: string | null;
}

export default function WishlistItemPage() {
  useRequireAuth();

  const { t } = useTranslation();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const itemId = parseInt(params.itemId as string, 10);

  const [item, setItem] = useState<WishlistItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user) {
          setItem(null);
          setLoading(false);
          return;
        }
        // Fetch the specific wishlist item by ID and user_id
        const response = await fetch(`/api/wishlist?id=${itemId}&user_id=${user.id}`);
        if (!response.ok) {
          throw new Error(`Error fetching wishlist item: ${response.statusText}`);
        }
        const data: WishlistItem[] = await response.json();
        if (data.length > 0) {
          setItem(data[0]); // Assuming the API returns an array with one item
        } else {
          setItem(null); // Item not found
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : typeof t === 'function' ? String(t('unknownError')) : 'Unknown error');
        console.error(typeof t === 'function' ? String(t('errorFetchingWishlist' as TranslationKey)) : 'Error fetching wishlist', err);
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId, t, user]); // Refetch when itemId or user changes

  const handleDeleteItem = async () => {
    if (!user) {
      setError('You must be logged in to delete an item.');
      return;
    }
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: itemId, user_id: user.id }),
      });

      if (!response.ok) {
        throw new Error(`Error deleting wishlist item: ${response.statusText}`);
      }

      // Navigate back to the wishlist after successful deletion
      router.push('/wishlist');

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : typeof t === 'function' ? String(t('unknownError')) : 'Unknown error');
      console.error(typeof t === 'function' ? String(t('errorDeletingWishlistItem')) : 'Error deleting wishlist item', err);
      alert(`${typeof t === 'function' ? String(t('failedToDeleteItem')) : 'Failed to delete item'}: ${err instanceof Error ? err.message : typeof t === 'function' ? String(t('unknownError')) : 'Unknown error'}`);
    }
  };


  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-8 w-1/2 mb-8" /> {/* Title skeleton */}
        <Card className="border-none shadow-md py-6">
          <CardHeader>
            <Skeleton className="h-7 w-3/4 mb-2" /> {/* Item Title skeleton */}
            <Skeleton className="h-4 w-1/2" /> {/* Author skeleton */}
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" /> {/* Note skeleton */}
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

  if (!item) {
    return <div className="container mx-auto py-8 px-4">{t('wishlistItemNotFound')}</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumb itemName={item?.title} /> {/* Add Breadcrumb component and pass item name */}
      <h1 className="text-2xl font-semibold mb-8">{t('wishlistItemDetails')}</h1>

      <Card className="border-none shadow-md py-6">
        <CardHeader>
          <CardTitle>{item.title}</CardTitle>
          <p className="text-sm text-gray-600">{item.author}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {item.note && <p><strong>{t('note')}:</strong> {item.note}</p>}
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between">
        <Link href="/wishlist">
          <Button variant="outline">{t('backToWishlist')}</Button>
        </Link>
        <Button variant="destructive" onClick={handleDeleteItem}>
          {t('delete')}
        </Button>
      </div>
    </div>
  );
}
