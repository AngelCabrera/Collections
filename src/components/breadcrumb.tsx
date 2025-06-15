"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from "@/translations/TranslationContext";

interface BreadcrumbProps {
  itemName?: string; // Optional prop for the name of the current item
}

export default function Breadcrumb({ itemName }: BreadcrumbProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment !== '');

  return (
    <nav className="mb-4 text-sm text-gray-600">
      <Link href="/" className="hover:underline">{t('home')}</Link>
      {pathSegments.map((segment, index) => {
        const href = '/' + pathSegments.slice(0, index + 1).join('/');
        const isLast = index === pathSegments.length - 1;
        // Use segment as key for translation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const translatedSegment = t(segment as any);
        const displayName = translatedSegment === segment ? segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : translatedSegment; // Basic formatting or translated text

        return (
          <span key={href}>
            <span className="mx-1">/</span>
            {isLast ? (
              <span>{itemName || displayName}</span> // Use itemName if provided, otherwise format segment
            ) : (
              <Link href={href} className="hover:underline">{displayName}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
