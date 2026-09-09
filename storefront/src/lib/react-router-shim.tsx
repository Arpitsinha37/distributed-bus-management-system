/**
 * React Router DOM compatibility shim for Next.js App Router.
 * 
 * NRT pages import from 'react-router-dom'. This module re-exports
 * equivalents using Next.js's routing hooks so we don't have to rewrite
 * every page.
 */
'use client';

import NextLink from 'next/link';
import { useRouter, usePathname, useSearchParams as useNextSearchParams, useParams as useNextParams } from 'next/navigation';
import React, { forwardRef, useCallback, useMemo } from 'react';

// ─── Link ──────────────────────────────────────────────────
export const Link = forwardRef<HTMLAnchorElement, any>(
  ({ to, children, className, style, onClick, ...rest }, ref) => {
    return (
      <NextLink href={to || '/'} className={className} style={style} onClick={onClick} ref={ref} {...rest}>
        {children}
      </NextLink>
    );
  }
);
Link.displayName = 'Link';

// ─── useNavigate ───────────────────────────────────────────
export function useNavigate() {
  const router = useRouter();
  return useCallback(
    (to: string | number, options?: { replace?: boolean; state?: any }) => {
      if (typeof to === 'number') {
        if (to === -1) router.back();
        else router.forward();
        return;
      }
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    },
    [router]
  );
}

// ─── useParams ─────────────────────────────────────────────
export function useParams() {
  return useNextParams() || {};
}

// ─── useSearchParams (returns [searchParams, setSearchParams]) ──
export function useSearchParams(): [URLSearchParams, (params: any) => void] {
  const searchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const setSearchParams = useCallback(
    (newParams: Record<string, string> | URLSearchParams) => {
      const params = new URLSearchParams(
        newParams instanceof URLSearchParams ? newParams.toString() : newParams
      );
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );
  
  // Return a URLSearchParams-compatible object
  const params = useMemo(() => new URLSearchParams(searchParams?.toString() || ''), [searchParams]);
  
  return [params, setSearchParams];
}

// ─── useLocation ───────────────────────────────────────────
export function useLocation() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  return {
    pathname,
    search: searchParams?.toString() ? `?${searchParams.toString()}` : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state: null,
  };
}

// ─── NavLink (same as Link but with active class support) ──
export const NavLink = forwardRef<HTMLAnchorElement, any>(
  ({ to, children, className, activeClassName, style, ...rest }, ref) => {
    const pathname = usePathname();
    const isActive = pathname === to || pathname?.startsWith(to + '/');
    
    const resolvedClassName = typeof className === 'function' 
      ? className({ isActive }) 
      : `${className || ''} ${isActive && activeClassName ? activeClassName : ''}`.trim();
    
    return (
      <NextLink href={to || '/'} className={resolvedClassName} style={style} ref={ref} {...rest}>
        {typeof children === 'function' ? children({ isActive }) : children}
      </NextLink>
    );
  }
);
NavLink.displayName = 'NavLink';

// ─── Outlet (not used in Next.js but prevents import errors) ──
export function Outlet() {
  return null;
}

// ─── BrowserRouter (no-op wrapper) ─────────────────────────
export function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// ─── Routes / Route (no-op wrappers) ───────────────────────
export function Routes({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Route({ element }: { element?: React.ReactNode; path?: string }) {
  return <>{element}</>;
}
