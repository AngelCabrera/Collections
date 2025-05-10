'use client';

import { useTranslation } from "@/translations/TranslationContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Select onValueChange={(value) => setLocale(value)} value={locale}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="es">Español</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? "☀️" : "🌙"}
      </Button>
      {user ? (
        <Button variant="outline" onClick={logout} className="ml-2">Logout</Button>
      ) : (
        <>
          <Link href="/login" className="ml-2"><Button variant="outline">Login</Button></Link>
          <Link href="/signup" className="ml-2"><Button variant="outline">Sign Up</Button></Link>
        </>
      )}
    </div>
  );
}
