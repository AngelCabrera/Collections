"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Breadcrumb from '@/components/breadcrumb'; // Import Breadcrumb component

// Define interface for wishlist item data (matching the 'items' table structure)
interface WishlistItem {
  id: number;
  title: string;
  author: string;
  note: string | null;
}

export default function WishlistItemPage() {
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
        // Fetch the specific wishlist item by ID
        const response = await fetch(`/api/wishlist?id=${itemId}`);
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
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching wishlist item:', err);
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId]); // Refetch when itemId changes

  const handleDeleteItem = async () => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: itemId }),
      });

      if (!response.ok) {
        throw new Error(`Error deleting wishlist item: ${response.statusText}`);
      }

      // Navigate back to the wishlist after successful deletion
      router.push('/wishlist');

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error deleting wishlist item:', err);
      alert(`Failed to delete item: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
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
    return <div className="container mx-auto py-8 px-4 text-red-500">Error: {error}</div>;
  }

  if (!item) {
    return <div className="container mx-auto py-8 px-4">Wishlist item not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumb itemName={item?.title} /> {/* Add Breadcrumb component and pass item name */}
      <h1 className="text-2xl font-semibold mb-8">Wishlist Item Details</h1>

      <Card className="border-none shadow-md py-6">
        <CardHeader>
          <CardTitle>{item.title}</CardTitle>
          <p className="text-sm text-gray-600">{item.author}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {item.note && <p><strong>Note:</strong> {item.note}</p>}
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between">
        <Link href="/wishlist">
          <Button variant="outline">Back to Wishlist</Button>
        </Link>
        <Button variant="destructive" onClick={handleDeleteItem}>
          Delete
        </Button>
      </div>
    </div>
  );
}
