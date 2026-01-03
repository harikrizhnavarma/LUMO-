import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import type { StyleGuide } from "@/redux/api/style-guide";
import { MoodBoard } from "@/components/style/mood-board";
import { Palette } from "lucide-react";
import {
  MoodBoardImagesQuery,
  ProjectQuery,
  StyleGuideQuery,
} from "@/convex/query.config";
import StyleGuideTypography from "@/components/style/typography";
import { MoodBoardImage } from "@/hooks/use-styles";
import { ThemeContent } from "@/components/style/theme";
import { BrandPalettesPanel } from "@/components/style/palettes";
import Brandboard from "@/components/style/brandboard";

type Props = {
  searchParams: Promise<{
    project: string;
  }>;
};

const Page = async ({ searchParams }: Props) => {
  const projectId = (await searchParams).project;

  const { project } = await ProjectQuery(projectId);
  const existingStyleGuide = await StyleGuideQuery(projectId);
  const guide = existingStyleGuide.styleGuide
    ?._valueJSON as unknown as StyleGuide | null;

  const colorGuide = guide?.colorSections || [];
  const typographyGuide = guide?.typographySections || [];

  const existingMoodBoardImages = await MoodBoardImagesQuery(projectId);
  const guideImages = existingMoodBoardImages.images
    ._valueJSON as unknown as MoodBoardImage[];
  const brandboardImages = guideImages.map((img) => ({
    ...img,
    // Ensure Next/Image receives a non-empty src; Convex query returns `url`, hook returns `preview`
    preview:
      (img as any).preview && typeof (img as any).preview === "string"
        ? (img as any).preview
        : (img as any).url ?? "",
  }));
  const projectName =
    project?._valueJSON && "name" in project._valueJSON
      ? (project._valueJSON.name as string)
      : undefined;

  return (
    <div>
      <TabsContent value="colours" className="space-y-8">
        {!guide ? (
          <div className="space-y-8">
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                <Palette className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No colors generated yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Upload images to your mood board and generate an AI-powered
                style guide with colors and typography.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <ThemeContent colorGuide={colorGuide} />

            {/* New: Brand palettes panel (Step 5) */}
            <BrandPalettesPanel
              projectId={projectId}
              colorGuide={colorGuide}
            />
          </div>
        )}
      </TabsContent>

      <TabsContent value="typography">
        <StyleGuideTypography typographyGuide={typographyGuide} />
      </TabsContent>

      <TabsContent value="brandboard">
        <Brandboard
          projectId={projectId}
          brandName={projectName ?? guide?.theme}
          styleGuide={guide}
          moodboardImages={brandboardImages}
        />
      </TabsContent>

      <TabsContent value="moodboard">
        <MoodBoard guideImages={guideImages} />
      </TabsContent>
    </div>
  );
};

export default Page;
