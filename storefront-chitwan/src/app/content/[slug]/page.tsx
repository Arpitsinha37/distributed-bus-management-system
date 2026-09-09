import { notFound } from 'next/navigation';
import { Metadata } from 'next';

async function getPageData(slug: string) {
  try {
    const siteId = process.env.NEXT_PUBLIC_SITE_ID || 'pokhara-travels';
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
    // Using the NRT cms page controller endpoint
    const url = `${baseUrl}/cms/pages/by-slug/${slug}?tenantId=${siteId}`;
    
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getPageData(params.slug);
  if (!page) return {};
  
  return {
    title: page.seoTitle || page.title,
    description: page.seoDesc || '',
    keywords: page.seoKeywords || '',
  };
}

export default async function ContentPage({ params }: { params: { slug: string } }) {
  const page = await getPageData(params.slug);
  
  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-8 font-display">{page.title}</h1>
        {page.content ? (
          <div 
            className="prose prose-slate max-w-none lg:prose-lg"
            dangerouslySetInnerHTML={{ __html: page.content }} 
          />
        ) : (
          <p className="text-slate-500">No content available.</p>
        )}
      </div>
    </div>
  );
}
