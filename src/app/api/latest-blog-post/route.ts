import { NextResponse } from 'next/server';
import { getAllBlogPosts } from '@/lib/blog-utils';

export async function GET() {
  const posts = getAllBlogPosts();
  const latest = posts.slice(0, 3);

  if (latest.length === 0) {
    return NextResponse.json([]);
  }

  return NextResponse.json(
    latest.map(post => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      category: post.category,
      readingTime: post.readingTime,
    }))
  );
}
