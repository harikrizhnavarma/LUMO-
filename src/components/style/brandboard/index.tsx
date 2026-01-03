'use client';

import React, { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { StyleGuide } from '@/redux/api/style-guide';
import type { MoodBoardImage } from '@/hooks/use-styles';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  projectId?: string | null;
  brandName?: string | null;
  styleGuide?: StyleGuide | null;
  moodboardImages: MoodBoardImage[];
};

const sectionTitleClass =
  'text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase';

const pickTypography = (styleGuide?: StyleGuide | null) => {
  const sections = styleGuide?.typographySections ?? [];
  const heading = sections[0]?.styles?.[0];
  const subheading = sections[1]?.styles?.[0] ?? sections[0]?.styles?.[1];
  const body =
    sections[2]?.styles?.[0] ??
    sections[1]?.styles?.[1] ??
    sections[0]?.styles?.[2];

  return { heading, subheading, body };
};

const pickPalette = (styleGuide?: StyleGuide | null) => {
  if (!styleGuide?.colorSections) return [];
  const seen = new Set<string>();
  const swatches: Array<{ name?: string; hexColor: string }> = [];

  for (const section of styleGuide.colorSections) {
    for (const swatch of section?.swatches ?? []) {
      const key = swatch.hexColor?.toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        swatches.push({ name: swatch.name, hexColor: swatch.hexColor });
      }
    }
  }

  return swatches.slice(0, 6);
};

export const Brandboard: React.FC<Props> = ({
  projectId,
  brandName,
  styleGuide,
  moodboardImages,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingMarks, setIsGeneratingMarks] = useState(false);
  const [marks, setMarks] = useState<{
    logo?: string;
    monogram?: string;
    submark?: string;
  }>({});
  const [templateIndex, setTemplateIndex] = useState(0);
  const [tileSize, setTileSize] = useState(180);
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [editingImages, setEditingImages] = useState<
    Array<MoodBoardImage & { w: number; h: number }>
  >([]);

  const safeBrandName = brandName?.trim() || 'Your Brand';
  const brandInitial = safeBrandName.charAt(0).toUpperCase() || 'B';

  const palette = useMemo(() => pickPalette(styleGuide), [styleGuide]);
  const { heading, subheading, body } = useMemo(
    () => pickTypography(styleGuide),
    [styleGuide]
  );

  const images = useMemo(
    () =>
      moodboardImages
        .filter((img) => typeof img?.preview === 'string' && img.preview.trim().length > 0)
        .slice(0, 9),
    [moodboardImages]
  );

  React.useEffect(() => {
    const baseSize = tileSize;
    setEditingImages(
      images.map((img) => ({
        ...img,
        w: baseSize,
        h: Math.max(baseSize - 20, 120),
      }))
    );
  }, [images, tileSize]);

  const svgToDataUrl = (svg?: string) => {
    if (!svg) return null;
    const encoded = encodeURIComponent(svg);
    return `data:image/svg+xml;utf8,${encoded}`;
  };

  const handleGenerateMarks = async () => {
    if (!projectId) {
      toast.error('Select a project before generating marks.');
      return;
    }
    setIsGeneratingMarks(true);
    try {
      const res = await fetch('/api/brandboard/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to generate marks');
      }
      const { logoSvg, monogramSvg, submarkSvg } = data.marks || {};
      setMarks({
        logo: svgToDataUrl(logoSvg),
        monogram: svgToDataUrl(monogramSvg),
        submark: svgToDataUrl(submarkSvg),
      });
      toast.success('Brand marks generated');
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : 'Unable to generate brand marks right now.'
      );
    } finally {
      setIsGeneratingMarks(false);
    }
  };

  const handleExport = async () => {
    if (!boardRef.current) return;

    setIsExporting(true);
    try {
      const { toPng } = await import('html-to-image');

      const dataUrl = await toPng(boardRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${safeBrandName.replace(/\s+/g, '-').toLowerCase()}-brandboard.png`;
      link.click();

      toast.success('Brandboard exported');
    } catch (error) {
      console.error(error);
      toast.error('Unable to export brandboard right now.');
    } finally {
      setIsExporting(false);
    }
  };

  const templateCount = 6;

  const goPrev = () => {
    setTemplateIndex((prev) => (prev - 1 + templateCount) % templateCount);
  };
  const goNext = () => {
    setTemplateIndex((prev) => (prev + 1) % templateCount);
  };

  const LogoBlock = ({ align }: { align?: 'left' | 'center' }) => (
    <div
      className={`flex flex-col ${align === 'left' ? 'items-start' : 'items-center'} gap-2`}
    >
      <div className={sectionTitleClass}>Logo</div>
      {marks.logo ? (
        <img
          src={marks.logo}
          alt="AI logo"
          className="max-h-20 sm:max-h-24 object-contain"
        />
      ) : (
        <div
          className="text-4xl sm:text-5xl font-semibold"
          style={{
            fontFamily: heading?.fontFamily || 'serif',
            letterSpacing: heading?.letterSpacing || '0.08em',
          }}
        >
          {safeBrandName}
        </div>
      )}
    </div>
  );

  const SubmarkBlock = ({ align }: { align?: 'left' | 'center' }) => (
    <div className={`p-2 flex flex-col ${align === 'left' ? 'items-start' : 'items-center'} gap-4`}>
      <div className={sectionTitleClass}>Submark</div>
      {marks.submark ? (
        <img src={marks.submark} alt="AI submark" className="h-20 object-contain" />
      ) : (
        <div
          className="text-3xl font-semibold"
          style={{ fontFamily: heading?.fontFamily || 'serif' }}
        >
          {safeBrandName}
        </div>
      )}
      <div className="w-12 h-[2px] bg-slate-200" />
    </div>
  );

  const MonogramBlock = ({ align }: { align?: 'left' | 'center' }) => (
    <div
      className={`px-2 flex flex-col ${align === 'left' ? 'items-start' : 'items-center'} gap-4`}
    >
      <div className={sectionTitleClass}>Monogram</div>
      {marks.monogram ? (
        <img
          src={marks.monogram}
          alt="AI monogram"
          className="w-20 h-20 rounded-full object-contain bg-slate-50 border border-slate-200 p-3"
        />
      ) : (
        <div className="w-20 h-20 rounded-full border border-slate-200 flex items-center justify-center text-3xl font-semibold">
          {brandInitial}
        </div>
      )}
      <div className="text-xs text-slate-400">Secondary badge</div>
    </div>
  );

  const TypographyBlock = ({ condensed }: { condensed?: boolean }) => (
    <div className="space-y-4">
      <div className={sectionTitleClass}>Typography</div>
      <div className={`grid grid-cols-1 sm:grid-cols-3 ${condensed ? 'gap-3' : 'gap-4'}`}>
        <div className="p-4">
          <div className="text-xs text-slate-500 mb-2">Headings</div>
          <div
            style={{
              fontFamily: heading?.fontFamily,
              fontWeight: heading?.fontWeight as React.CSSProperties['fontWeight'],
              lineHeight: heading?.lineHeight,
              letterSpacing: heading?.letterSpacing || 'normal',
            }}
            className="text-lg"
          >
            The quick brown fox
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {heading?.fontFamily} / {heading?.fontWeight} / {heading?.fontSize}
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs text-slate-500 mb-2">Subheadings</div>
          <div
            style={{
              fontFamily: subheading?.fontFamily,
              fontWeight: subheading?.fontWeight as React.CSSProperties['fontWeight'],
              lineHeight: subheading?.lineHeight,
              letterSpacing: subheading?.letterSpacing || 'normal',
            }}
            className="text-base"
          >
            The quick brown fox
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {subheading?.fontFamily} / {subheading?.fontWeight} / {subheading?.fontSize}
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs text-slate-500 mb-2">Body copy</div>
          <div
            style={{
              fontFamily: body?.fontFamily,
              fontWeight: body?.fontWeight as React.CSSProperties['fontWeight'],
              lineHeight: body?.lineHeight,
              letterSpacing: body?.letterSpacing || 'normal',
            }}
            className="text-sm"
          >
            The quick brown fox jumps over the lazy dog.
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {body?.fontFamily} / {body?.fontWeight} / {body?.fontSize}
          </div>
        </div>
      </div>
    </div>
  );

  const PaletteBlock = ({ center }: { center?: boolean }) => (
    <div className="space-y-3">
      <div className={sectionTitleClass}>Color palette</div>
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 ${center ? 'justify-items-center' : ''}`}>
        {palette.length === 0 ? (
          <div className="col-span-6 text-sm text-slate-500">
            No colors available. Generate a style guide first.
          </div>
        ) : (
          palette.map((swatch, idx) => (
            <div
              key={`${swatch.hexColor}-${idx}`}
              className="flex flex-col items-center gap-3 p-3"
            >
              <div
                className="w-18 h-18 rounded-full border border-slate-200 shadow-sm"
                style={{ backgroundColor: swatch.hexColor }}
              />
              <div className="text-xs font-medium text-slate-700 text-center">
                {swatch.name || `Color ${idx + 1}`}
              </div>
              <div className="text-[11px] text-slate-500">
                {swatch.hexColor}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const handleDragStart = (id: string) => setDraggingId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    setEditingImages((prev) => {
      const from = prev.findIndex((img) => img.id === draggingId);
      const to = prev.findIndex((img) => img.id === targetId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDraggingId(null);
  };
  const handleResizeCommit = (id: string, target: HTMLDivElement | null) => {
    if (!target) return;
    const { width, height } = target.getBoundingClientRect();
    setEditingImages((prev) =>
      prev.map((img) => {
        if (img.id !== id) return img;
        if (Math.abs(img.w - width) < 1 && Math.abs(img.h - height) < 1) {
          return img;
        }
        return { ...img, w: width, h: height };
      })
    );
  };

  const MoodboardBlock = () => {
    const renderImages = isEditingBoard ? editingImages : editingImages;
    if (renderImages.length === 0) {
      return (
        <div className="space-y-3">
          <div className={sectionTitleClass}>Moodboard</div>
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 text-center">
            Add moodboard images to populate this section.
          </div>
        </div>
      );
    }

    if (isEditingBoard) {
      return (
        <div className="space-y-3">
          <div className={sectionTitleClass}>Moodboard</div>
          <div className="flex flex-wrap gap-3 md:gap-4">
            {renderImages.map((image) => (
              <div
                key={image.id}
                className="relative overflow-hidden rounded-xl bg-slate-100"
                style={{
                  width: image.w,
                  height: image.h,
                  resize: 'both',
                  overflow: 'hidden',
                  cursor: 'move',
                }}
                draggable
                onDragStart={() => handleDragStart(image.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(image.id)}
                onMouseUp={(e) => handleResizeCommit(image.id, e.currentTarget)}
              >
                <Image
                  src={image.preview}
                  alt="Moodboard"
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className={sectionTitleClass}>Moodboard</div>
        <div
          className="grid gap-3 md:gap-4"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(${tileSize}px, 1fr))`,
            gridAutoRows: `${Math.max(tileSize - 20, 120)}px`,
            gridAutoFlow: 'dense',
          }}
        >
          {renderImages.map((image, index) => {
            const pattern = index % 7;
            const span =
              pattern === 0
                ? { col: 2, row: 2 }
                : pattern === 1 || pattern === 2
                ? { col: 2, row: 1 }
                : pattern === 3
                ? { col: 1, row: 2 }
                : { col: 1, row: 1 };
            return (
              <div
                key={image.id}
                className="relative overflow-hidden rounded-xl h-full"
                style={{
                  gridColumn: `span ${span.col}`,
                  gridRow: `span ${span.row}`,
                }}
              >
                <Image
                  src={image.preview}
                  alt="Moodboard"
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const templates = [
    {
      name: 'Classic Grid',
      render: () => (
        <>
          <LogoBlock />
          <div className="border-b border-slate-200" />
          <div className="grid grid-cols-2 gap-6 items-start">
            <SubmarkBlock />
            <MonogramBlock />
          </div>
          <div className="border-b border-slate-200" />
          <TypographyBlock />
          <div className="border-b border-slate-200" />
          <PaletteBlock />
          <div className="border-b border-slate-200" />
          <MoodboardBlock />
        </>
      ),
    },
    {
      name: 'Side Rail',
      render: () => (
        <div className="grid grid-cols-4 gap-6 h-full">
          <div className="col-span-1 space-y-6">
            <LogoBlock align="left" />
            <SubmarkBlock align="left" />
            <MonogramBlock align="left" />
          </div>
          <div className="col-span-3 space-y-6">
            <TypographyBlock condensed />
            <PaletteBlock />
            <MoodboardBlock />
          </div>
        </div>
      ),
    },
    {
      name: 'Hero Focus',
      render: () => (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <LogoBlock align="left" />
            <div className="flex items-center gap-6">
              <SubmarkBlock />
              <MonogramBlock />
            </div>
          </div>
          <TypographyBlock />
          <PaletteBlock />
          <MoodboardBlock />
        </div>
      ),
    },
    {
      name: 'Palette First',
      render: () => (
        <div className="space-y-6">
          <PaletteBlock center />
          <div className="border-b border-slate-200" />
          <LogoBlock />
          <div className="grid grid-cols-2 gap-6 items-start">
            <SubmarkBlock />
            <MonogramBlock />
          </div>
          <TypographyBlock />
          <MoodboardBlock />
        </div>
      ),
    },
    {
      name: 'Typography Lead',
      render: () => (
        <div className="space-y-6">
          <TypographyBlock />
          <div className="border-b border-slate-200" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <LogoBlock />
            <div className="flex gap-6">
              <SubmarkBlock />
              <MonogramBlock />
            </div>
          </div>
          <PaletteBlock />
          <MoodboardBlock />
        </div>
      ),
    },
    {
      name: 'Moodboard Hero',
      render: () => (
        <div className="space-y-6">
          <MoodboardBlock />
          <div className="border-b border-slate-200" />
          <LogoBlock />
          <div className="grid grid-cols-2 gap-6 items-start">
            <SubmarkBlock />
            <MonogramBlock />
          </div>
          <PaletteBlock />
          <TypographyBlock condensed />
        </div>
      ),
    },
  ];

  if (!styleGuide) {
    return (
      <div className="rounded-2xl border border-border/60 p-8 text-center">
        <p className="text-lg font-medium text-foreground mb-2">
          No style guide yet
        </p>
        <p className="text-sm text-muted-foreground">
          Generate a style guide from your moodboard to see the brandboard preview here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Brandboard</h3>
            <p className="text-sm text-muted-foreground">
              A printable A4 summary of your logo, typography, palette, and moodboard.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={isEditingBoard ? 'default' : 'secondary'}
              onClick={() => setIsEditingBoard((v) => !v)}
            >
              {isEditingBoard ? 'Finish editing' : 'Edit brandboard'}
            </Button>
            <Button
              variant="secondary"
              disabled={isGeneratingMarks || !projectId}
              onClick={handleGenerateMarks}
            >
            {isGeneratingMarks ? 'Generating...' : 'Generate AI marks'}
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export as PNG'}
          </Button>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto">
        <div className="relative">
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-10">
            <Button size="icon" variant="ghost" onClick={goPrev}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
          <div className="absolute -right-12 top-1/2 -translate-y-1/2 z-10">
            <Button size="icon" variant="ghost" onClick={goNext}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <div
            ref={boardRef}
            className="bg-white text-slate-900 rounded-[28px] shadow-2xl border border-border/40 overflow-hidden"
            style={{ aspectRatio: '210 / 297' }}
          >
            <div className="relative h-full p-6">
              <div className="flex flex-col gap-3 h-full">
                <div className="text-sm text-slate-500 uppercase tracking-[0.12em]">
                  {templates[templateIndex].name}
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  {templates[templateIndex].render()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Brandboard;
