"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/translations/TranslationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { FaTrash } from "react-icons/fa"; // Import necessary icons
import Breadcrumb from "@/components/breadcrumb"; // Import Breadcrumb component
import { Rating } from "@smastrom/react-rating"; // Import the Rating component
import "@smastrom/react-rating/style.css";
import { useAuth } from "@/contexts/AuthContext";

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
  end_date: string | null; // Note: snake_case from DB
  fav_character: string | null; // Note: snake_case from DB
  hated_character: string | null; // Note: snake_case from DB
  rating_details: {
    // JSONB column
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

// Define custom item shapes using Font Awesome icons
const CustomStar = (
  <path
    xmlns="http://www.w3.org/2000/svg"
    d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"
  />
);

const CustomHeart = (
  <path
    xmlns="http://www.w3.org/2000/svg"
    d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z"
  />
);

// Placeholder for sadness icon - no direct droplet/tear found in react-icons/fa
const CustomSadnessPlaceholder = (
  <path
    xmlns="http://www.w3.org/2000/svg"
    d="M491-200q12-1 20.5-9.5T520-230q0-14-9-22.5t-23-7.5q-41 3-87-22.5T343-375q-2-11-10.5-18t-19.5-7q-14 0-23 10.5t-6 24.5q17 91 80 130t127 35ZM480-80q-137 0-228.5-94T160-408q0-100 79.5-217.5T480-880q161 137 240.5 254.5T800-408q0 140-91.5 234T480-80Z"
  />
);

const CustomFire = (
  <path
    xmlns="http://www.w3.org/2000/svg"
    d="M160-400q0-105 50-187t110-138q60-56 110-85.5l50-29.5v132q0 37 25 58.5t56 21.5q17 0 32.5-7t28.5-23l18-22q72 42 116 116.5T800-400q0 88-43 160.5T644-125q17-24 26.5-52.5T680-238q0-40-15-75.5T622-377L480-516 339-377q-29 29-44 64t-15 75q0 32 9.5 60.5T316-125q-70-42-113-114.5T160-400Zm320-4 85 83q17 17 26 38t9 45q0 49-35 83.5T480-120q-50 0-85-34.5T360-238q0-23 9-44.5t26-38.5l85-83Z"
  />
);

const CustomFinal = (
  <path
    xmlns="http://www.w3.org/2000/svg"
    d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"
  />
);

const overallRatingStyles = {
  itemShapes: CustomStar,
  activeFillColor: "#ffb700",
  inactiveFillColor: "#fbf1a9",
};

const romanceRatingStyles = {
  itemShapes: CustomHeart,
  activeFillColor: "#e31b23", // Red color for heart
  inactiveFillColor: "#ffb3b3", // Lighter red
};

const sadnessRatingStyles = {
  itemShapes: CustomSadnessPlaceholder,
  activeFillColor: "#007bff", // Blue color for placeholder
  inactiveFillColor: "#b3d9ff", // Lighter blue
};

const spicyRatingStyles = {
  itemShapes: CustomFire,
  activeFillColor: "#ff6b00",
  inactiveFillColor: "#f8d7da",
};

const finalRatingStyles = {
  itemShapes: CustomFinal,
  activeFillColor: '#28a745',
  inactiveFillColor: '#d4edda',
};

export default function RecentlyReadPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
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
    review: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user) {
        setEntries([]);
        setLoading(false);
        return;
      }
      const response = await fetch(`/api/entries?user_id=${user.id}`);
      if (!response.ok) {
        throw new Error(`Error fetching entries: ${response.statusText}`);
      }
      const data: Entry[] = await response.json();
      setEntries(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching entries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []); // Fetch entries on component mount

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name as keyof NewBookState]: value });
  };

  const handleRatingChange = (
    type: keyof NewBookState["ratingDetails"],
    value: number
  ) => {
    setNewBook({
      ...newBook,
      ratingDetails: {
        ...newBook.ratingDetails,
        [type]: value,
      },
    });
  };

  const handleSelectChange = (name: keyof NewBookState, value: string) => {
    setNewBook({ ...newBook, [name]: value });
  };

  const handleAddBook = async () => {
    // Basic validation
    if (!newBook.title || !newBook.author) {
      alert(t("titleAuthorRequired"));
      return;
    }

    if (!user) {
      setError("You must be logged in to add an entry.");
      return;
    }

    // Process favPhrases string into an array, handling empty input
    const processedFavPhrases = newBook.favPhrases
      .split(",")
      .map((phrase) => phrase.trim())
      .filter((phrase) => phrase.length > 0); // Remove empty strings

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newBook,
          favPhrases: processedFavPhrases, // Send the processed array
          user_id: user.id, // Include user_id
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
        review: "",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("unknownError"));
      console.error(t("errorAddingEntry"), err);
      alert(
        `${t("failedToAddBook")}: ${
          err instanceof Error ? err.message : t("unknownError")
        }`
      );
    }
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      const response = await fetch("/api/entries", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`Error deleting entry: ${response.statusText}`);
      }

      // Update state by removing the deleted entry
      setEntries(entries.filter((entry) => entry.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("unknownError"));
      console.error(t("errorDeletingEntry"), err);
      alert(
        `${t("failedToDeleteBook")}: ${
          err instanceof Error ? err.message : t("unknownError")
        }`
      );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumb /> {/* Add Breadcrumb component */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">{t("allRecentlyReadBooks")}</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? t("cancel") : t("addNewBook")}
        </Button>
      </div>
      {showForm && (
        <Card className="mb-8 p-4">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">
              {t("addNewRecentlyReadBook")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="mb-1">
                  {t("title")}
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={newBook.title}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="author" className="mb-1">
                  {t("author")}
                </Label>
                <Input
                  id="author"
                  name="author"
                  value={newBook.author}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="recommended" className="mb-1">
                  {t("recommended")}
                </Label>
                <input
                  type="checkbox"
                  id="recommended"
                  name="recommended"
                  checked={newBook.recommended}
                  onChange={(e) =>
                    setNewBook({ ...newBook, recommended: e.target.checked })
                  }
                  className="ml-2"
                />
              </div>
              <div>
                <Label htmlFor="rating" className="mb-1">
                  {t("overallRating")}
                </Label>
                <Rating
                  value={newBook.rating}
                  onChange={(value: number) =>
                    setNewBook({ ...newBook, rating: value })
                  }
                  items={5} // 5 stars
                  halfFillMode="svg"
                  itemStyles={overallRatingStyles}
                  style={{ maxWidth: "150px" }} // Set the width to 1rem
                />
              </div>
              <div>
                <Label htmlFor="formato" className="mb-1">
                  {t("format")}
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("formato", value)
                  }
                  value={newBook.formato}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectFormat")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">{t("digital")}</SelectItem>
                    <SelectItem value="physical">{t("physical")}</SelectItem>
                    <SelectItem value="both">{t("both")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pageNumber" className="mb-1">
                  {t("pageNumber")}
                </Label>
                <Input
                  type="number"
                  id="pageNumber"
                  name="pageNumber"
                  value={newBook.pageNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="startDate" className="mb-1">
                  {t("startDate")}
                </Label>
                <Input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={newBook.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="mb-1">
                  {t("endDate")}
                </Label>
                <Input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={newBook.endDate}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="favCharacter" className="mb-1">
                  {t("favoriteCharacter")}
                </Label>
                <Input
                  id="favCharacter"
                  name="favCharacter"
                  value={newBook.favCharacter}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="hatedCharacter" className="mb-1">
                  {t("hatedCharacter")}
                </Label>
                <Input
                  id="hatedCharacter"
                  name="hatedCharacter"
                  value={newBook.hatedCharacter}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="genre" className="mb-1">
                  {t("genre")}
                </Label>
                <Input
                  id="genre"
                  name="genre"
                  value={newBook.genre}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-lg font-semibold mb-2">
                  {t("detailedRatings")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating-romance" className="mb-1">
                      {t("romance")}
                    </Label>
                    <Rating
                      value={newBook.ratingDetails.romance}
                      onChange={(value: number) =>
                        handleRatingChange("romance", value)
                      }
                      items={5}
                      halfFillMode="svg"
                      itemStyles={romanceRatingStyles}
                      style={{ maxWidth: "150px" }} // Set max width
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating-sadness" className="mb-1">
                      {t("sadness")}
                    </Label>
                    <Rating
                      value={newBook.ratingDetails.sadness}
                      onChange={(value: number) =>
                        handleRatingChange("sadness", value)
                      }
                      items={5}
                      halfFillMode="svg"
                      itemStyles={sadnessRatingStyles}
                      style={{ maxWidth: "150px" }} // Set max width
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating-spicy" className="mb-1">
                      {t("spicy")}
                    </Label>
                    <Rating
                      value={newBook.ratingDetails.spicy}
                      onChange={(value: number) =>
                        handleRatingChange("spicy", value)
                      }
                      items={5}
                      halfFillMode="svg"
                      itemStyles={spicyRatingStyles}
                      style={{ maxWidth: "150px" }} // Set max width
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating-final" className="mb-1">
                      {t("final")}
                    </Label>
                    <Rating
                      value={newBook.ratingDetails.final}
                      onChange={(value: number) =>
                        handleRatingChange("final", value)
                      }
                      items={5}
                      halfFillMode="svg"
                      itemStyles={finalRatingStyles}
                      style={{ maxWidth: "150px" }} // Set max width
                    />
                  </div>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="favPhrases" className="mb-1">
                  {t("favoritePhrases")}
                </Label>
                <Input
                  id="favPhrases"
                  name="favPhrases"
                  value={newBook.favPhrases} // Use the raw string value
                  onChange={handleInputChange} // Use the generic input handler
                  placeholder={t("separatePhrasesWithCommas")} // Add placeholder text
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="review" className="mb-1">
                  {t("review")}
                </Label>
                <Textarea
                  id="review"
                  name="review"
                  value={newBook.review}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <Button onClick={handleAddBook} className="mt-4">
              {t("addBook")}
            </Button>
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
      {error && (
        <p className="text-red-500">
          {t("error")}: {error}
        </p>
      )}
      {!loading && !error && (
        <div className="flex flex-col gap-4">
          {entries.map((entry) => (
            <Card
              key={entry.id}
              className="border-none shadow-md hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-800 cursor-pointer relative"
            >
              {" "}
              {/* Added relative positioning */}
              <Link href={`/recently-read/${entry.id}`} passHref>
                {" "}
                {/* Link wraps content */}
                <CardContent className="p-4 pr-10">
                  {" "}
                  {/* Added right padding to make space for button */}
                  <h3 className="text-lg font-semibold">{entry.title}</h3>
                  <p className="text-sm text-gray-600">{entry.author}</p>
                  {entry.review && (
                    <p className="text-sm text-gray-500 my-2">{entry.review}</p>
                  )}
                  {/* Display overall rating if available */}
                  {entry.rating !== null && (
                    <Rating
                      value={entry.rating || 0}
                      readOnly={true}
                      items={5}
                      halfFillMode="svg"
                      itemStyles={overallRatingStyles}
                      style={{ maxWidth: "150px" }} // Set max width
                    />
                  )}
                </CardContent>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteEntry(entry.id)}
                className="absolute top-2 right-2 cursor-pointer"
              >
                {" "}
                {/* Positioned in top right */}
                <FaTrash className="text-red-500" />{" "}
                {/* Added trash icon and color */}
              </Button>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-8">
        <Link href="/">
          <Button variant="outline">{t("backToHome")}</Button>
        </Link>
      </div>
    </div>
  );
}
