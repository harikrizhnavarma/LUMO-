"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { GeneratedUIShape, updateShape, removeShape } from "@/redux/slice/shapes";
import { useUpdateContainer } from "@/hooks/use-styles";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Code2,
  Eye,
  Download,
  Copy,
  MessageCircle,
  Workflow,
  X,
  Monitor,
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const toCrcTable = () => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
};

const crcTable = toCrcTable();

const crc32 = (data: Uint8Array) => {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const buildLocalHeader = (
  nameBytes: Uint8Array,
  crc: number,
  size: number
) => {
  const buffer = new ArrayBuffer(30 + nameBytes.length);
  const view = new DataView(buffer);
  let offset = 0;
  view.setUint32(offset, 0x04034b50, true);
  offset += 4;
  view.setUint16(offset, 20, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint32(offset, crc, true);
  offset += 4;
  view.setUint32(offset, size, true);
  offset += 4;
  view.setUint32(offset, size, true);
  offset += 4;
  view.setUint16(offset, nameBytes.length, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  new Uint8Array(buffer, 30).set(nameBytes);
  return new Uint8Array(buffer);
};

const buildCentralHeader = (
  nameBytes: Uint8Array,
  crc: number,
  size: number,
  localOffset: number
) => {
  const buffer = new ArrayBuffer(46 + nameBytes.length);
  const view = new DataView(buffer);
  let offset = 0;
  view.setUint32(offset, 0x02014b50, true);
  offset += 4;
  view.setUint16(offset, 20, true);
  offset += 2;
  view.setUint16(offset, 20, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint32(offset, crc, true);
  offset += 4;
  view.setUint32(offset, size, true);
  offset += 4;
  view.setUint32(offset, size, true);
  offset += 4;
  view.setUint16(offset, nameBytes.length, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint32(offset, 0, true);
  offset += 4;
  view.setUint32(offset, localOffset, true);
  new Uint8Array(buffer, 46).set(nameBytes);
  return new Uint8Array(buffer);
};

const buildEndOfCentralDirectory = (
  entries: number,
  centralSize: number,
  centralOffset: number
) => {
  const buffer = new ArrayBuffer(22);
  const view = new DataView(buffer);
  let offset = 0;
  view.setUint32(offset, 0x06054b50, true);
  offset += 4;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, 0, true);
  offset += 2;
  view.setUint16(offset, entries, true);
  offset += 2;
  view.setUint16(offset, entries, true);
  offset += 2;
  view.setUint32(offset, centralSize, true);
  offset += 4;
  view.setUint32(offset, centralOffset, true);
  offset += 4;
  view.setUint16(offset, 0, true);
  return new Uint8Array(buffer);
};

const createZipBlob = (
  files: Array<{ path: string; content: string | Uint8Array }>
) => {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let localOffset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.path);
    const dataBytes =
      typeof file.content === "string"
        ? encoder.encode(file.content)
        : file.content;
    const crc = crc32(dataBytes);
    const localHeader = buildLocalHeader(nameBytes, crc, dataBytes.length);
    localParts.push(localHeader, dataBytes);

    const centralHeader = buildCentralHeader(
      nameBytes,
      crc,
      dataBytes.length,
      localOffset
    );
    centralParts.push(centralHeader);
    localOffset += localHeader.length + dataBytes.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const endRecord = buildEndOfCentralDirectory(
    files.length,
    centralSize,
    localOffset
  );

  const blobParts = [
    ...localParts,
    ...centralParts,
    endRecord,
  ] as unknown as BlobPart[];
  return new Blob(blobParts, {
    type: "application/zip",
  });
};

const stripScripts = (html: string) =>
  html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

const detectExtension = (url: string) => {
  const cleanUrl = url.split("?")[0]?.split("#")[0] ?? "";
  const ext = cleanUrl.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) {
    return ext === "jpeg" ? "jpg" : ext;
  }
  if (["woff", "woff2", "ttf", "otf"].includes(ext)) {
    return ext;
  }
  if (ext === "css") return "css";
  return "png";
};

const dataUrlToBytes = (dataUrl: string) => {
  const [, meta, base64] =
    dataUrl.match(/^data:([^;]+);base64,(.*)$/) ?? [];
  if (!base64) return null;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return { bytes, mime: meta ?? "" };
};

const mimeToExtension = (mime: string) => {
  const normalized = mime.split(";")[0]?.toLowerCase() ?? "";
  if (normalized.includes("image/")) {
    return detectExtension(normalized.replace("image/", ""));
  }
  if (normalized === "image/svg+xml") return "svg";
  if (normalized === "font/woff2") return "woff2";
  if (normalized === "font/woff") return "woff";
  if (normalized === "font/ttf") return "ttf";
  if (normalized === "font/otf") return "otf";
  if (normalized === "text/css") return "css";
  return "bin";
};

const isRemoteUrl = (value: string) =>
  value.startsWith("http://") ||
  value.startsWith("https://") ||
  value.startsWith("data:");

const extractCssUrls = (cssText: string) => {
  const urls: string[] = [];
  const regex = /url\(([^)]+)\)/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(cssText)) !== null) {
    const raw = match[1]?.trim() ?? "";
    const cleaned = raw.replace(/^['"]|['"]$/g, "");
    if (cleaned && isRemoteUrl(cleaned)) {
      urls.push(cleaned);
    }
  }
  return urls;
};

const extractCssImports = (cssText: string) => {
  const urls: string[] = [];
  const regex = /@import\s+(?:url\()?['"]?([^'")]+)['"]?\)?/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(cssText)) !== null) {
    const cleaned = match[1]?.trim() ?? "";
    if (cleaned && isRemoteUrl(cleaned)) {
      urls.push(cleaned);
    }
  }
  return urls;
};

const toPascalCase = (value: string) =>
  value
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const sanitizeComponentName = (value: string, fallback: string) => {
  const name = toPascalCase(value);
  if (!name) return fallback;
  if (/^[0-9]/.test(name)) return `${fallback}${name}`;
  return name;
};

const buildProjectFiles = (htmlSource: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlSource, "text/html");
  const root =
    doc.querySelector("[data-generated-ui]") ?? doc.body ?? doc.documentElement;

  let styleText = "";
  const styleNodes = Array.from(root.querySelectorAll("style"));
  styleNodes.forEach((node) => {
    styleText += `${node.textContent ?? ""}\n`;
    node.remove();
  });

  let wrapper = root as HTMLElement;
  let sections = Array.from(wrapper.children).filter(
    (child) => child.tagName.toLowerCase() !== "style"
  );

  if (sections.length === 1 && sections[0].children.length > 0) {
    const candidate = sections[0] as HTMLElement;
    const hasSectionChildren = Array.from(candidate.children).some(
      (child) => child.tagName.toLowerCase() === "section"
    );
    if (hasSectionChildren) {
      wrapper = candidate;
      sections = Array.from(candidate.children);
    }
  }

  if (sections.length === 0) {
    sections = [wrapper];
  }

  const wrapperTag = wrapper.tagName.toLowerCase() || "div";
  const wrapperAttributes = Array.from(wrapper.attributes).reduce(
    (acc, attr) => {
      if (attr.name === "class") {
        acc.className = attr.value;
        return acc;
      }
      acc[attr.name] = attr.value;
      return acc;
    },
    {} as Record<string, string>
  );

  const sectionComponents = sections.map((section, index) => {
    const id = section.getAttribute("id") ?? "";
    const componentName = sanitizeComponentName(id, `Section${index + 1}`);
    const filePath = `components/sections/${componentName}.tsx`;
    const html = section.outerHTML;
    const componentCode = `export const ${componentName} = () => (
  <div
    dangerouslySetInnerHTML={{ __html: ${JSON.stringify(html)} }}
  />
);
`;
    return { componentName, filePath, componentCode };
  });

  const exportStatements = sectionComponents
    .map((section) => `export { ${section.componentName} } from "./${section.componentName}";`)
    .join("\n");

  const wrapperProps = Object.entries(wrapperAttributes)
    .map(([key, value]) => {
      if (key === "className") {
        return `className=${JSON.stringify(value)}`;
      }
      if (key === "data-generated-ui") {
        return "data-generated-ui";
      }
      return `${key}=${JSON.stringify(value)}`;
    })
    .join(" ");

  const wrapperOpen = `<${wrapperTag}${wrapperProps ? ` ${wrapperProps}` : ""}>`;
  const wrapperClose = `</${wrapperTag}>`;

  const sectionImports = sectionComponents
    .map(
      (section) =>
        `import { ${section.componentName} } from "../components/sections/${section.componentName}";`
    )
    .join("\n");

  const sectionRender = sectionComponents
    .map((section) => `      <${section.componentName} />`)
    .join("\n");

  const pageTsx = `import "./generated.css";
${sectionImports}

export default function Page() {
  return (
${wrapperOpen}
${sectionRender}
${wrapperClose}
  );
}
`;

  const generatedCss = `/* Generated styles */\n${styleText.trim()}\n`;

  const files: Record<string, string> = {
    "app/page.tsx": pageTsx,
    "app/layout.tsx": `import "./globals.css";

export const metadata = {
  title: "Lumo Generated UI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900">{children}</body>
    </html>
  );
}
`,
    "app/generated.css": generatedCss,
    "app/globals.css": `@import "tailwindcss";

@layer base {
  body {
    @apply bg-white text-neutral-900;
  }
}
`,
    "components/sections/index.ts": exportStatements || "",
    "lib/utils.ts": `export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");`,
    "hooks/use-scroll.ts": `import { useEffect, useState } from "react";

export const useScroll = () => {
  const [y, setY] = useState(0);

  useEffect(() => {
    const handler = () => setY(window.scrollY);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return { y };
};`,
    "hooks/use-theme.ts": `import { useEffect, useState } from "react";

export const useTheme = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setTheme(media.matches ? "dark" : "light");
    handler();
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  return { theme };
};`,
    "package.json": `{
  "name": "lumo-generated-ui",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "15.4.10",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "postcss": "^8",
    "autoprefixer": "^10",
    "typescript": "^5"
  }
}`,
    "next.config.js": `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
module.exports = nextConfig;
`,
    "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", "**/*.html"],
  "exclude": ["node_modules"]
}
`,
    "postcss.config.js": `module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
`,
    "tailwind.config.js": `module.exports = {
  content: ["./app/**/*.{ts,tsx,html}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
`,
    "next-env.d.ts": `/// <reference types="next" />
/// <reference types="next/image-types/global" />
`,
    ".gitignore": `node_modules
.next
.env
`,
    "README.md": `This export contains the generated HTML inside app/page.html and index.html.
Run \`npm install\` then \`npm run dev\` to start the Next.js app.`,
  };

  sectionComponents.forEach((section) => {
    files[section.filePath] = section.componentCode;
  });

  return {
    files,
    wrapper: { tag: wrapperTag, attributes: wrapperAttributes },
    sectionComponents,
  };
};

export const GeneratedPanel = ({
  toggleChat,
  generateWorkflow,
  exportDesign,
  isChatOpen,
  activeChatId,
}: {
  toggleChat: (generatedUIId: string) => void;
  generateWorkflow: (generatedUIId: string) => void;
  exportDesign: (generatedUIId: string, element: HTMLElement | null) => void;
  isChatOpen: boolean;
  activeChatId: string | null;
}) => {
  const dispatch = useAppDispatch();
  const shapesState = useAppSelector((state) => state.shapes.shapes);

  const generatedShapes = useMemo(() => {
    return (shapesState.ids as string[])
      .map((id) => shapesState.entities[id])
      .filter(
        (shape): shape is GeneratedUIShape =>
          !!shape && shape.type === "generatedui"
      );
  }, [shapesState.entities, shapesState.ids]);

  const [panelOpen, setPanelOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [codeValue, setCodeValue] = useState("");
  const lastSyncedRef = useRef<string | null>(null);
  const autoOpenedRef = useRef(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [viewportWidth, setViewportWidth] = useState(1280);
  const [viewportHeight, setViewportHeight] = useState(720);
  const [selectedFile, setSelectedFile] = useState("app/page.html");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    app: true,
    components: true,
    hooks: true,
    lib: true,
    public: true,
    styles: true,
  });

  const previewRef = useRef<HTMLDivElement | null>(null);
  const previewViewportRef = useRef<HTMLDivElement | null>(null);
  const previewContentRef = useRef<HTMLDivElement | null>(null);
  const [contentScale, setContentScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (generatedShapes.length > 0 && !autoOpenedRef.current) {
      setPanelOpen(true);
      autoOpenedRef.current = true;
    }
  }, [generatedShapes.length]);

  useEffect(() => {
    if (generatedShapes.length === 0) {
      setActiveId(null);
      setPanelOpen(false);
      autoOpenedRef.current = false;
      return;
    }

    const exists = activeId
      ? generatedShapes.some((shape) => shape.id === activeId)
      : false;

    if (!exists) {
      setActiveId(generatedShapes[generatedShapes.length - 1].id);
    }
  }, [generatedShapes, activeId]);

  const activeShape = useMemo(() => {
    if (!activeId) return null;
    return (
      generatedShapes.find((shape) => shape.id === activeId) ?? null
    );
  }, [generatedShapes, activeId]);

  const fallbackShape: GeneratedUIShape = {
    id: "placeholder",
    type: "generatedui",
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    uiSpecData: null,
    sourceFrameId: "placeholder",
    stroke: "transparent",
    strokeWidth: 0,
  };

  const { sanitizeHtml } = useUpdateContainer(activeShape ?? fallbackShape, {
    syncHeight: false,
  });

  const safeHtml =
    activeShape?.uiSpecData != null
      ? stripScripts(sanitizeHtml(activeShape.uiSpecData))
      : "";

  useEffect(() => {
    if (!activeShape) {
      setCodeValue("");
      lastSyncedRef.current = null;
      return;
    }

    if (
      activeShape.uiSpecData != null &&
      activeShape.uiSpecData !== lastSyncedRef.current
    ) {
      setCodeValue(activeShape.uiSpecData);
      lastSyncedRef.current = activeShape.uiSpecData;
    }
  }, [activeShape?.id, activeShape?.uiSpecData]);

  useEffect(() => {
    if (!activeShape) return;
    if (codeValue === activeShape.uiSpecData) return;

    const timeoutId = setTimeout(() => {
      dispatch(
        updateShape({
          id: activeShape.id,
          patch: { uiSpecData: codeValue },
        })
      );
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [codeValue, activeShape, dispatch]);

  useEffect(() => {
    const viewportEl = previewViewportRef.current;
    const contentEl = previewContentRef.current;
    if (!viewportEl || !contentEl) return;

    let rafId = 0;
    const updateScale = () => {
      if (!previewViewportRef.current) return;
      const availableWidth = previewViewportRef.current.clientWidth;
      if (!availableWidth) return;
      const measuredWidth = previewContentRef.current?.scrollWidth ?? 0;
      const baseWidth = measuredWidth > 0 ? measuredWidth : viewportWidth;
      if (!baseWidth) return;
      const nextScale = Math.min(1.5, availableWidth / baseWidth);
      setContentScale(Number.isFinite(nextScale) ? nextScale : 1);
      if (previewContentRef.current) {
        setContentHeight(previewContentRef.current.scrollHeight);
        setContentWidth(previewContentRef.current.scrollWidth);
      }
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScale);
    };

    updateScale();
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(viewportEl);
    resizeObserver.observe(contentEl);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [viewportWidth, safeHtml]);

  const handleCopyCode = async () => {
    if (!selectedFileContent) return;
    try {
      await navigator.clipboard.writeText(selectedFileContent);
      toast.success("Code copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const handleDownloadProject = async () => {
    const htmlSource = codeValue || "<div data-generated-ui></div>";
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlSource, "text/html");
    const assets: Array<{ path: string; content: Uint8Array }> = [];
    const missingAssets: string[] = [];
    let assetIndex = 1;
    const assetMap = new Map<string, string>();

    const addAsset = async (url: string, prefix: string) => {
      if (assetMap.has(url)) {
        return assetMap.get(url) ?? "";
      }

      if (url.startsWith("data:")) {
        const result = dataUrlToBytes(url);
        if (!result) return "";
        const ext = mimeToExtension(result.mime);
        const path = `public/assets/${prefix}-${assetIndex}.${ext}`;
        assets.push({ path, content: result.bytes });
        const publicPath = `/assets/${prefix}-${assetIndex}.${ext}`;
        assetMap.set(url, publicPath);
        assetIndex += 1;
        return publicPath;
      }

      try {
        const response = await fetch(url, { mode: "cors" });
        if (!response.ok) throw new Error("fetch failed");
        const contentType = response.headers.get("content-type") ?? "";
        const buffer = await response.arrayBuffer();
        const ext = detectExtension(url) || mimeToExtension(contentType);
        const path = `public/assets/${prefix}-${assetIndex}.${ext}`;
        assets.push({ path, content: new Uint8Array(buffer) });
        const publicPath = `/assets/${prefix}-${assetIndex}.${ext}`;
        assetMap.set(url, publicPath);
        assetIndex += 1;
        return publicPath;
      } catch (err) {
        missingAssets.push(url);
        return "";
      }
    };

    const rewriteCss = async (cssText: string) => {
      let updated = cssText;
      const importUrls = extractCssImports(updated);
      for (const importUrl of importUrls) {
        try {
          const response = await fetch(importUrl, { mode: "cors" });
          if (response.ok) {
            const importedCss = await response.text();
            const rewrittenImport = await rewriteCss(importedCss);
            updated = updated.replace(importUrl, "");
            updated += `\n${rewrittenImport}`;
          }
        } catch (err) {
          missingAssets.push(importUrl);
        }
      }

      const urls = extractCssUrls(updated);
      for (const url of urls) {
        const localPath = await addAsset(url, "asset");
        if (localPath) {
          const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          updated = updated.replace(
            new RegExp(escaped, "g"),
            localPath
          );
        }
      }

      return updated;
    };

    const imageNodes = Array.from(doc.querySelectorAll("img"));
    for (const img of imageNodes) {
      const src = img.getAttribute("src") ?? "";
      if (!src || !isRemoteUrl(src)) continue;
      const localPath = await addAsset(src, "image");
      if (localPath) {
        img.setAttribute("src", localPath);
      }
    }

    const sourceNodes = Array.from(doc.querySelectorAll("source"));
    for (const source of sourceNodes) {
      const src = source.getAttribute("src") ?? "";
      if (src && isRemoteUrl(src)) {
        const localPath = await addAsset(src, "media");
        if (localPath) {
          source.setAttribute("src", localPath);
        }
      }
      const srcSet = source.getAttribute("srcset") ?? "";
      if (srcSet) {
        const entries = srcSet.split(",").map((entry) => entry.trim());
        const nextEntries: string[] = [];
        for (const entry of entries) {
          const [url, size] = entry.split(/\s+/);
          if (url && isRemoteUrl(url)) {
            const localPath = await addAsset(url, "media");
            if (localPath) {
              nextEntries.push([localPath, size].filter(Boolean).join(" "));
              continue;
            }
          }
          nextEntries.push(entry);
        }
        source.setAttribute("srcset", nextEntries.join(", "));
      }
    }

    const styleNodes = Array.from(doc.querySelectorAll("style"));
    for (const style of styleNodes) {
      const text = style.textContent ?? "";
      if (!text) continue;
      style.textContent = await rewriteCss(text);
    }

    const styledElements = Array.from(doc.querySelectorAll("[style]"));
    for (const element of styledElements) {
      const styleValue = element.getAttribute("style") ?? "";
      if (!styleValue) continue;
      element.setAttribute("style", await rewriteCss(styleValue));
    }

    const externalCss: string[] = [];
    const linkNodes = Array.from(
      doc.querySelectorAll('link[rel="stylesheet"]')
    );
    for (const link of linkNodes) {
      const href = link.getAttribute("href") ?? "";
      if (!href || !isRemoteUrl(href)) continue;
      try {
        const response = await fetch(href, { mode: "cors" });
        if (response.ok) {
          const cssText = await response.text();
          const rewrittenCss = await rewriteCss(cssText);
          externalCss.push(rewrittenCss);
          const cssPath = `styles/external-${externalCss.length}.css`;
          assets.push({
            path: cssPath,
            content: new TextEncoder().encode(rewrittenCss),
          });
          link.remove();
        }
      } catch (err) {
        missingAssets.push(href);
      }
    }

    if (externalCss.length > 0) {
      const styleEl = doc.createElement("style");
      styleEl.textContent = externalCss.join("\n");
      doc.body.prepend(styleEl);
    }

    const htmlOutput = doc.body.innerHTML || htmlSource;
    const projectFiles = buildProjectFiles(htmlOutput);

    const projectReadmeLines = [
      "This export contains the generated HTML inside app/page.html and index.html.",
      "Run `npm install` then `npm run dev` to start the Next.js app.",
      "Assets are copied into public/assets and URLs are rewritten when possible.",
    ];
    if (missingAssets.length > 0) {
      projectReadmeLines.push(
        "",
        "Some assets could not be downloaded due to CORS:",
        ...missingAssets.map((src) => `- ${src}`)
      );
    }

    projectFiles.files["README.md"] = projectReadmeLines.join("\n");

    const files: Array<{ path: string; content: string | Uint8Array }> = [
      {
        path: "app/page.html",
        content: htmlOutput,
      },
      {
        path: "index.html",
        content: htmlOutput,
      },
      ...Object.entries(projectFiles.files).map(([path, content]) => ({
        path,
        content,
      })),
    ];

    const blob = createZipBlob([...files, ...assets]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `generated-ui-${activeShape?.id.slice(0, 8) ?? "project"}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPreview = () => {
    if (!activeShape) return;
    exportDesign(activeShape.id, previewRef.current);
  };

  const renderTabLabel = (shape: GeneratedUIShape, index: number) => {
    if (shape.isWorkflowPage) {
      return `Workflow ${index + 1}`;
    }
    return `Design ${index + 1}`;
  };

  const handleDeleteDesign = (id: string) => {
    dispatch(removeShape(id));
    if (activeId === id) {
      const remaining = generatedShapes.filter((shape) => shape.id !== id);
      setActiveId(remaining.length ? remaining[remaining.length - 1].id : null);
    }
  };

  const panelWidth = panelOpen ? "min(58rem, 46vw)" : "0px";

  useEffect(() => {
    if (typeof document === "undefined") return;
    const value = panelOpen ? panelWidth : "0px";
    document.documentElement.style.setProperty("--generated-panel-width", value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("previewPanelOpen", String(panelOpen));
      window.dispatchEvent(
        new CustomEvent("preview:state", { detail: panelOpen })
      );
    }
  }, [panelOpen, panelWidth]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("previewPanelOpen");
    if (stored !== null) {
      setPanelOpen(stored === "true");
    }

    const handleToggle = () => {
      setPanelOpen((prev) => {
        const next = !prev;
        window.localStorage.setItem("previewPanelOpen", String(next));
        return next;
      });
    };

    const handleSet = (event: Event) => {
      const detail = (event as CustomEvent<boolean>).detail;
      if (typeof detail === "boolean") {
        setPanelOpen(detail);
        window.localStorage.setItem("previewPanelOpen", String(detail));
      }
    };

    window.addEventListener("preview:toggle", handleToggle);
    window.addEventListener("preview:set", handleSet as EventListener);
    return () => {
      window.removeEventListener("preview:toggle", handleToggle);
      window.removeEventListener("preview:set", handleSet as EventListener);
    };
  }, []);

  const projectFiles = useMemo(() => {
    return buildProjectFiles(codeValue || safeHtml);
  }, [codeValue, safeHtml]);

  const fileTree = useMemo(() => {
    const tree: Array<{
      name: string;
      files: string[];
      isRootFile?: boolean;
    }> = [];

    const folders: Record<string, string[]> = {};
    const rootFiles: string[] = [];

    const allPaths = Object.keys(projectFiles.files);
    allPaths.push(
      "app/page.html",
      "package.json",
      "next.config.js",
      "tsconfig.json",
      "postcss.config.js",
      "tailwind.config.js",
      "next-env.d.ts",
      ".gitignore",
      "README.md"
    );

    allPaths.forEach((path) => {
      if (path.includes("/")) {
        const [folder, ...rest] = path.split("/");
        const file = rest.join("/");
        if (!folders[folder]) folders[folder] = [];
        if (!folders[folder].includes(file)) {
          folders[folder].push(file);
        }
      } else {
        if (!rootFiles.includes(path)) rootFiles.push(path);
      }
    });

    Object.entries(folders).forEach(([folder, files]) => {
      tree.push({
        name: folder,
        files: files.sort(),
      });
    });

    rootFiles.sort().forEach((file) => {
      tree.push({
        name: file,
        files: [],
        isRootFile: true,
      });
    });

    return tree;
  }, [projectFiles]);

  const selectedFileContent =
    selectedFile === "app/page.html"
      ? codeValue
      : projectFiles.files[selectedFile] ?? "";

  const isSelectedEditable = selectedFile === "app/page.html";

  return (
    <>
      <aside
        className={cn(
          "relative h-full shrink-0 border-l border-neutral-200/70 dark:border-white/10 bg-neutral-50 dark:bg-neutral-950/40 transition-all duration-300",
          panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{ width: panelWidth }}
      >
        <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-neutral-200/70 dark:border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-neutral-500 dark:text-white/60" />
            <span className="text-sm font-medium text-neutral-700 dark:text-white/80">
              Generated UI
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center rounded-full border border-neutral-200 bg-white/80 p-1 text-xs text-neutral-500 shadow-sm dark:border-white/10 dark:bg-black/30 dark:text-white/60">
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 transition",
                  viewMode === "preview"
                    ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-black"
                    : "hover:text-neutral-800 dark:hover:text-white"
                )}
              >
                <Eye className="h-3 w-3" />
                Preview
              </button>
              <button
                type="button"
                onClick={() => setViewMode("code")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 transition",
                  viewMode === "code"
                    ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-black"
                    : "hover:text-neutral-800 dark:hover:text-white"
                )}
              >
                <Code2 className="h-3 w-3" />
                Code
              </button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-8 w-8 p-0",
                isChatOpen && activeChatId === activeId
                  ? "text-primary"
                  : "text-neutral-500 dark:text-white/60"
              )}
              onClick={() => activeId && toggleChat(activeId)}
              disabled={!activeId}
              title="Toggle chat"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-neutral-500 dark:text-white/60"
              onClick={() => setPanelOpen(false)}
              title="Hide preview"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto border-b border-neutral-200/70 dark:border-white/10 px-4 py-2">
          {generatedShapes.map((shape, index) => (
            <div
              key={shape.id}
              className={cn(
                "group flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 text-xs transition",
                shape.id === activeId
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-neutral-200 bg-white/80 text-neutral-600 hover:border-neutral-300 dark:border-white/10 dark:bg-black/20 dark:text-white/60 dark:hover:border-white/30"
              )}
            >
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setPendingDeleteId(shape.id);
                }}
                className="mr-1 hidden h-4 w-4 items-center justify-center rounded-full text-[10px] text-current transition group-hover:flex group-hover:bg-neutral-200/70 dark:group-hover:bg-white/15"
                title="Remove design"
              >
                ×
              </button>
              <button
                type="button"
                onClick={() => setActiveId(shape.id)}
                className="focus:outline-none"
              >
                {renderTabLabel(shape, index)}
              </button>
            </div>
          ))}
        </div>

        {activeShape ? (
          <div className="flex flex-1 min-h-0 flex-col">
            <div className="flex items-center gap-3 border-b border-neutral-200/70 dark:border-white/10 px-4 py-2 text-xs text-neutral-500 dark:text-white/60">
              <div className="flex items-center gap-2">
                <span>Viewport</span>
                <input
                  type="number"
                  min={320}
                  max={3840}
                  value={viewportWidth}
                  onChange={(e) =>
                    setViewportWidth(Math.max(320, Number(e.target.value) || 0))
                  }
                  className="w-20 rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 shadow-sm focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white/70"
                />
                <span>x</span>
                <input
                  type="number"
                  min={320}
                  max={2160}
                  value={viewportHeight}
                  onChange={(e) =>
                    setViewportHeight(
                      Math.max(320, Number(e.target.value) || 0)
                    )
                  }
                  className="w-20 rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 shadow-sm focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white/70"
                />
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={() => generateWorkflow(activeShape.id)}
                >
                  <Workflow className="mr-1 h-3 w-3" />
                  Workflow
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={handleExportPreview}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Export
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={handleCopyCode}
                  disabled={!selectedFileContent}
                >
                  <Copy className="mr-1 h-3 w-3" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={handleDownloadProject}
                  disabled={!activeShape}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Download Zip
                </Button>
              </div>
            </div>

            {viewMode === "preview" ? (
              <div className="flex-1 min-h-0 overflow-hidden p-4">
                <div
                  ref={previewRef}
                  className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-white/10 dark:bg-black/40"
                >
                  <div className="flex items-center gap-2 border-b border-neutral-200/70 px-4 py-2 text-xs text-neutral-500 dark:border-white/10 dark:text-white/60">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                    </div>
                    <div className="ml-2 flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] text-neutral-500 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                      https://preview.lumo.ai/{activeShape.id.slice(0, 6)}
                    </div>
                  </div>

                  <div
                    ref={previewViewportRef}
                    className="generated-ui-viewport flex-1 overflow-auto bg-neutral-100/60 p-6 dark:bg-black/30"
                    style={{ pointerEvents: "auto" }}
                  >
                    <div
                      className="mx-auto"
                      style={{
                        width: Math.max(1, contentWidth || viewportWidth) * contentScale,
                        height: Math.max(1, contentHeight * contentScale),
                      }}
                    >
                      <div
                        ref={previewContentRef}
                        className="origin-top-left bg-white shadow-md"
                        style={{
                          width: viewportWidth,
                          minHeight: viewportHeight,
                          transform: `scale(${contentScale})`,
                        }}
                        dangerouslySetInnerHTML={{ __html: safeHtml }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 min-h-0 overflow-hidden">
                <div className="w-60 flex-col border-r border-neutral-200/70 bg-neutral-50 px-3 py-4 text-xs text-neutral-500 dark:border-white/10 dark:bg-black/30 dark:text-white/50">
                  <div className="mb-3 font-semibold uppercase tracking-[0.2em]">
                    Explorer
                  </div>
                  <div className="mb-3 rounded-md border border-neutral-200/70 bg-white/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                    Lumo Project
                  </div>
                  <div className="space-y-2">
                    {fileTree.map((entry) => {
                      if (entry.isRootFile) {
                        return (
                          <button
                            key={entry.name}
                            type="button"
                            onClick={() => setSelectedFile(entry.name)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left transition",
                              selectedFile === entry.name
                                ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                                : "hover:bg-neutral-200/60 dark:hover:bg-white/10"
                            )}
                          >
                            <FileText className="h-3.5 w-3.5" />
                            {entry.name}
                          </button>
                        );
                      }

                      const isExpanded = expandedFolders[entry.name];
                      return (
                        <div key={entry.name} className="space-y-1">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedFolders((prev) => ({
                                ...prev,
                                [entry.name]: !isExpanded,
                              }))
                            }
                            className="flex w-full items-center gap-1 rounded-md px-2 py-1 text-left hover:bg-neutral-200/60 dark:hover:bg-white/10"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                            <Folder className="h-3.5 w-3.5" />
                            {entry.name}
                          </button>
                          {isExpanded && (
                            <div className="ml-4 space-y-1">
                              {entry.files.map((file) => {
                                const fullName = `${entry.name}/${file}`;
                                return (
                                  <button
                                    key={fullName}
                                    type="button"
                                    onClick={() => setSelectedFile(fullName)}
                                    className={cn(
                                      "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left transition",
                                      selectedFile === fullName
                                        ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                                        : "hover:bg-neutral-200/60 dark:hover:bg-white/10"
                                    )}
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                    {file}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex h-full flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-white/60">
                    <span>
                      Editing {selectedFile}
                      {!isSelectedEditable ? " (read-only)" : ""}
                    </span>
                    {!isSelectedEditable && (
                      <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] uppercase tracking-wide dark:border-white/10">
                        Preview
                      </span>
                    )}
                  </div>
                  <textarea
                    value={selectedFileContent}
                    onChange={(e) =>
                      isSelectedEditable && setCodeValue(e.target.value)
                    }
                    className="flex-1 resize-none rounded-xl border border-neutral-200 bg-white p-4 font-mono text-xs text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:border-white/10 dark:bg-black/40 dark:text-white/80 dark:focus:ring-white/20"
                    spellCheck={false}
                    readOnly={!isSelectedEditable}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-neutral-500 dark:text-white/60">
            Generate a design to open the preview window.
          </div>
        )}
        </div>
      </aside>

      <AlertDialog
        open={pendingDeleteId != null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete design?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the selected design from the panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDeleteId) handleDeleteDesign(pendingDeleteId);
                setPendingDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
