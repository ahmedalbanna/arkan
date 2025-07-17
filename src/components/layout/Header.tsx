
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { HomeIcon, SlidersHorizontal, Users, Palette, FileImage, Bot, LogOut } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuth } from '@/context/AuthContext'; // Import your useAuth hook
import { useLogout } from '@/hooks/use-user'; // Import your useLogout mutation hook
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function Header() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useLocalization();
  const { firebaseUser, userProfile, isLoading: isLoadingAuth } = useAuth(); // Get firebaseUser, userProfile, and loading state
  const logoutMutation = useLogout(); // Use the useLogout mutation hook
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering for hooks
  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };

  const navLinks = [
    { href: '/', label: t('header.home'), icon: HomeIcon },
    { href: '/generate', label: t('header.generateDocs'), icon: SlidersHorizontal },
  ];

  // These might be admin-only links, you'll need to add logic to check userProfile.role or similar
  const adminLinks = [
    { href: '/manage-users', label: t('header.manageUsers'), icon: Users },
    { href: '/manage-templates', label: t('header.exportTemplates'), icon: Palette },
    { href: '/manage-pptx-templates', label: t('header.pptxTemplates'), icon: FileImage },
    { href: '/manage-agents', label: t('header.agentManager'), icon: Bot },
  ];

  const renderNavLinks = (links: typeof navLinks | typeof adminLinks, isMobile = false) =>
    links.map((link) => (
      <Button
        key={link.href}
        asChild
        variant={pathname.startsWith(link.href) && link.href !== '/' || pathname === '/' && link.href === '/' ? 'secondary' : 'ghost'}
        className={cn(
          'font-headline',
          isMobile && 'w-full justify-start text-lg py-6'
        )}
      >
        <Link href={link.href}>
          {isMobile && <link.icon className="ml-4 rtl:ml-0 rtl:mr-4 h-5 w-5" />}
          {link.label}
        </Link>
      </Button>
    ));

  // Handle logout
  const handleLogout = async () => {
      await logoutMutation.mutate(); // Trigger the logout mutation
  };

  // Don't render until client-side is ready if needed for hooks
  if (!isClient && typeof window !== 'undefined') {
      return null; // Or a loading placeholder
  }


  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
             {/* Replace with your logo component or image */}
            <span className="inline-block font-bold">App Name</span>
          </Link>
          {/* Main navigation links */}
          <nav className="hidden gap-6 md:flex">
            {renderNavLinks(navLinks)}
             {/* Render admin links only if user is admin */}
             {userProfile?.role === 'admin' && renderNavLinks(adminLinks)}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
             {/* Language Toggle */}
             <Button
                variant="ghost"
                size="sm"
                onClick={toggleLocale}
                className="font-headline"
             >
                {locale === 'en' ? 'العربية' : 'English'}
             </Button>
             {/* Theme Toggle - Assuming you have this component */}
             {/* <ThemeToggle /> */}

             {/* Conditional Rendering based on Authentication State */}
            {isLoadingAuth ? (
              // Show loading state while auth is being determined
              <Skeleton className="h-8 w-24" />
            ) : firebaseUser ? (
              // If user is logged in, display user info and logout button
              <>
                {/* Display user's name or a placeholder */}
                {userProfile && userProfile.name ? (
                   <span className="font-headline hidden md:inline">{userProfile.name}</span>
                ) : (
                   <span className="font-headline hidden md:inline">Welcome!</span>
                )}
                {/* Link to profile page (optional) */}
                 {userProfile && (
                   <Button variant="ghost" size="sm" asChild>
                     <Link href={`/profile/${firebaseUser.uid}`}>Profile</Link> {/* Assuming a profile page */}
                   </Button>
                 )}
                {/* Logout Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending} // Disable button while logging out
                  className="font-headline"
                >
                   {logoutMutation.isPending ? 'Logging out...' : (
                      <>
                         <LogOut className="mr-2 h-4 w-4" />
                         Logout
                      </>
                   )}
                </Button>
              </>
            ) : (
              // If user is not logged in, display Login and Sign Up links
              <>
                <Button variant="ghost" size="sm" asChild className="font-headline">
                  <Link href="/login">Login</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="font-headline">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
           {/* Mobile Menu Toggle (assuming you have one) */}
           {/* <MobileMenuToggle /> */}
        </div>
      </div>
    </header>
  );
}
