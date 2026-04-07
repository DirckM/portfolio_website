import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllBlogPosts, getBlogPost } from '@/lib/blog-utils';
import { highlightCode } from '@/lib/shiki';
import BlogPostLayout from '@/components/shell/BlogPostLayout';
import CodeBlock from '@/components/shell/CodeBlock';

import { fullDemos } from '@/lib/component-previews';
import { liveStepCodes } from '@/lib/live-step-codes';
import LiveStep from '@/components/shell/LiveStep';

// Text animations
import BlurText from '@/components/library/text-animations/BlurText';
import GlitchText from '@/components/library/text-animations/GlitchText';
import CircularText from '@/components/library/text-animations/CircularText';
import CurvedLoop from '@/components/library/text-animations/CurvedLoop';
import DecryptedText from '@/components/library/text-animations/DecryptedText';
import FallingText from '@/components/library/text-animations/FallingText';
import RotatingText from '@/components/library/text-animations/RotatingText';
import ScrambledText from '@/components/library/text-animations/ScrambledText';
import ScrollFloat from '@/components/library/text-animations/ScrollFloat';
import ScrollReveal from '@/components/library/text-animations/ScrollReveal';
import { ScrollVelocity } from '@/components/library/text-animations/ScrollVelocity';
import ShinyText from '@/components/library/text-animations/ShinyText';
import Shuffle from '@/components/library/text-animations/Shuffle';
import SplitText from '@/components/library/text-animations/SplitText';
import TextPressure from '@/components/library/text-animations/TextPressure';
import TextType from '@/components/library/text-animations/TextType';
import TrueFocus from '@/components/library/text-animations/TrueFocus';
import VariableProximity from '@/components/library/text-animations/VariableProximity';

// Animations
import Antigravity from '@/components/library/animations/Antigravity';
import Crosshair from '@/components/library/animations/Crosshair';
import ElectricBorder from '@/components/library/animations/ElectricBorder';
import GlareHover from '@/components/library/animations/GlareHover';
import LogoLoop from '@/components/library/animations/LogoLoop';
import MagicRings from '@/components/library/animations/MagicRings';
import Magnet from '@/components/library/animations/Magnet';
import MetaBalls from '@/components/library/animations/MetaBalls';
import MetallicPaint from '@/components/library/animations/MetallicPaint';
import PixelTrail from '@/components/library/animations/PixelTrail';
import ShapeBlur from '@/components/library/animations/ShapeBlur';
import TargetCursor from '@/components/library/animations/TargetCursor';

// Backgrounds
import LineWaves from '@/components/library/backgrounds/LineWaves';

// Components
import AnimatedList from '@/components/library/components/AnimatedList';
import BorderGlow from '@/components/library/components/BorderGlow';
import CircularGallery from '@/components/library/components/CircularGallery';
import Dock from '@/components/library/components/Dock';
import DomeGallery from '@/components/library/components/DomeGallery';
import ElasticSlider from '@/components/library/components/ElasticSlider';
import FlowingMenu from '@/components/library/components/FlowingMenu';
import FluidGlass from '@/components/library/components/FluidGlass';
import Folder from '@/components/library/components/Folder';
import GlassSurface from '@/components/library/components/GlassSurface';
import InfiniteMenu from '@/components/library/components/InfiniteMenu';
import Lanyard from '@/components/library/components/Lanyard';
import MagicBento from '@/components/library/components/MagicBento';
import ReflectiveCard from '@/components/library/components/ReflectiveCard';
import ScrollStack, { ScrollStackItem } from '@/components/library/components/ScrollStack';
import TiltedCard from '@/components/library/components/TiltedCard';

// Blocks
import CirclingElements from '@/components/library/blocks/CirclingElements';
import MacbookScroll from '@/components/library/blocks/MacbookScroll';
import MarqueeAlongSvgPath from '@/components/library/blocks/MarqueeAlongSvgPath';
import Terminal from '@/components/library/blocks/Terminal';
import WorldMap from '@/components/library/blocks/WorldMap';

// Dynamic (WebGL / heavy)
const ASCIIText = dynamic(() => import('@/components/library/text-animations/ASCIIText'), { ssr: false });
const SoftAurora = dynamic(() => import('@/components/library/backgrounds/SoftAurora'), { ssr: false });
const ColorBends = dynamic(() => import('@/components/library/backgrounds/ColorBends'), { ssr: false });
const DarkVeil = dynamic(() => import('@/components/library/backgrounds/DarkVeil'), { ssr: false });
const EvilEye = dynamic(() => import('@/components/library/backgrounds/EvilEye'), { ssr: false });
const LightPillar = dynamic(() => import('@/components/library/backgrounds/LightPillar'), { ssr: false });
const Radar = dynamic(() => import('@/components/library/backgrounds/Radar'), { ssr: false });
const PixelCard = dynamic(() => import('@/components/library/components/PixelCard'), { ssr: false });
const ParallaxFloating = dynamic(() => import('@/components/library/blocks/ParallaxFloating').then(m => ({ default: m.default })), { ssr: false });
const FloatingElement = dynamic(() => import('@/components/library/blocks/ParallaxFloating').then(m => ({ default: m.FloatingElement })), { ssr: false });

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: 'Not Found' };

  return {
    title: `${post.title} | Dirck Mulder`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

function extractCode(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (node == null || typeof node === 'boolean') return '';
  if (Array.isArray(node)) return node.map(extractCode).join('');
  if (typeof node === 'object' && 'props' in node) {
    return extractCode((node as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  }
  return '';
}

async function HighlightedPre({
  children,
  ...props
}: React.HTMLAttributes<HTMLPreElement> & { children?: React.ReactNode }) {
  try {
    const codeElement = children as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }>;

    if (!codeElement?.props) {
      return <pre {...props}>{children}</pre>;
    }

    const className = codeElement.props.className || '';
    const lang = className.replace('language-', '') || 'tsx';
    const code = extractCode(codeElement.props.children).trim();

    if (!code) {
      return <pre {...props}>{children}</pre>;
    }

    const highlightedHtml = await highlightCode(code, lang);

    return <CodeBlock code={code} language={lang} highlightedHtml={highlightedHtml} />;
  } catch {
    return <pre {...props}>{children}</pre>;
  }
}

const mdxComponents = {
  LiveStep: (props: any) => {
    const code = props.codeId ? liveStepCodes[props.codeId] : props.code;
    return (
      <LiveStep
        {...props}
        code={code || ''}
        scope={{
          BlurText, GlitchText, CircularText, CurvedLoop, DecryptedText,
          FallingText, RotatingText, ScrambledText, ScrollFloat, ScrollReveal,
          ScrollVelocity, ShinyText, Shuffle, SplitText, TextPressure,
          TextType, TrueFocus, VariableProximity, ASCIIText,
          Antigravity, Crosshair, ElectricBorder, GlareHover, LogoLoop,
          MagicRings, Magnet, MetaBalls, MetallicPaint, PixelTrail,
          ShapeBlur, TargetCursor,
          LineWaves, SoftAurora, ColorBends, DarkVeil, EvilEye, LightPillar, Radar,
          AnimatedList, BorderGlow, CircularGallery, Dock, DomeGallery,
          ElasticSlider, FlowingMenu, FluidGlass, Folder, GlassSurface,
          InfiniteMenu, Lanyard, MagicBento, PixelCard, ReflectiveCard,
          ScrollStack, ScrollStackItem, TiltedCard,
          CirclingElements, MacbookScroll, MarqueeAlongSvgPath, Terminal, WorldMap,
          ParallaxFloating, FloatingElement,
          ...props.scope,
        }}
      />
    );
  },
  pre: HighlightedPre,
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className='text-2xl font-[family-name:var(--font-instrument-serif)] mt-12 mb-4'>
      {children}
    </h2>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className='text-black/80 leading-relaxed mb-4'>{children}</p>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className='text-black/80 leading-relaxed'>{children}</li>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className='font-semibold text-black'>{children}</strong>
  ),
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <div className='pt-32 text-center'>
        <h1 className='text-2xl font-[family-name:var(--font-instrument-serif)]'>
          Post not found
        </h1>
      </div>
    );
  }

  return (
    <BlogPostLayout post={post} demo={fullDemos[post.componentSlug]}>
      <MDXRemote source={post.content} components={mdxComponents} />
    </BlogPostLayout>
  );
}
