import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../api/client";
import { Loader2, Lock, ArrowLeft, Shield, RefreshCw } from "lucide-react";

const ROLE_LEVELS: Record<string, number> = {
  free: 0,
  base: 1,
  standard: 2,
  premium: 3,
  admin: 4,
};

const ROLE_PLAN_NAMES: Record<string, string> = {
  free: "Free",
  base: "Monthly Basic",
  standard: "Quarterly Pro",
  premium: "Annual Premium",
};

// Global in-memory cache for public PDF binaries
const publicPdfCache = new Map<string, any>();

// Dynamically load PDF.js script from cdnjs and configure worker
const loadPdfJS = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    script.async = true;
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
        resolve(pdfjsLib);
      } else {
        reject(new Error("PDF.js global library (pdfjsLib) was not found on the window object."));
      }
    };
    script.onerror = () => reject(new Error("Failed to download PDF.js library from CDN."));
    document.head.appendChild(script);
  });
};

interface PageRendererProps {
  pageNumber: number;
  pdfDoc: any;
  userEmail?: string;
}

function PageRenderer({ pageNumber, pdfDoc, userEmail }: PageRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [renderError, setRenderError] = useState(false);
  const renderTaskRef = useRef<any>(null);
  const isRenderedRef = useRef(false);

  // Lazy render when entering viewport (+-600px margin) to save GPU memory and prevent context loss
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        root: null,
        rootMargin: "600px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const renderPage = useCallback(async () => {
    if (!isVisible || !pdfDoc || isRenderedRef.current) return;

    try {
      setLoading(true);
      setRenderError(false);

      const page = await pdfDoc.getPage(pageNumber);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: false });
      if (!ctx) return;

      // Base width of 1000px ensures sharp text even when scaled up
      const originalViewport = page.getViewport({ scale: 1 });
      const desiredWidth = 1000;
      const scale = desiredWidth / originalViewport.width;
      const viewport = page.getViewport({ scale });

      // Cap DPR to 2 to avoid memory bloat
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;

      ctx.scale(dpr, dpr);

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      isRenderedRef.current = true;

      // Draw dynamic watermarking overlays on the canvas
      ctx.save();
      ctx.font = "bold 13px Poppins, sans-serif";
      ctx.fillStyle = "rgba(128, 128, 128, 0.15)";
      ctx.textAlign = "center";

      const dateString = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const watermarkText = `ON-CHAINPASS • SECURE PREVIEW • ${userEmail || "authorized-user"} • ${dateString}`;

      ctx.translate(viewport.width / 2, viewport.height / 2);
      ctx.rotate((-35 * Math.PI) / 180);

      const stepY = 140;
      const startY = -viewport.height;
      const endY = viewport.height;

      for (let y = startY; y < endY; y += stepY) {
        ctx.fillText(watermarkText, -viewport.width / 3, y);
        ctx.fillText(watermarkText, 0, y + 70);
        ctx.fillText(watermarkText, viewport.width / 3, y);
      }

      ctx.restore();
      setLoading(false);
    } catch (err: any) {
      if (err.name !== "RenderingCancelledException") {
        console.error(`Page ${pageNumber} render failed:`, err);
        setRenderError(true);
      }
      setLoading(false);
    }
  }, [isVisible, pdfDoc, pageNumber, userEmail]);

  useEffect(() => {
    if (isVisible) {
      renderPage();
    }
    return () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [isVisible, renderPage]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-[#161618] mb-8 flex flex-col items-center min-h-[500px] aspect-[1/1.414] isolate [transform:translateZ(0)] [backface-visibility:hidden]"
      style={{ willChange: "transform" }}
    >
      {(!isVisible || loading) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#161618] z-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-white/40" />
          <span className="text-[12px] text-gray-500 font-medium">
            {!isVisible ? `Preparing page ${pageNumber}...` : `Decrypting and rendering page ${pageNumber}...`}
          </span>
        </div>
      )}

      {renderError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#161618] z-20 gap-3 p-6 text-center">
          <span className="text-[13px] text-red-400 font-medium">Failed to display page {pageNumber}</span>
          <button
            type="button"
            onClick={() => {
              isRenderedRef.current = false;
              renderPage();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "auto" }}
        className="block select-none pointer-events-none [transform:translateZ(0)]"
      />

      <div
        className="absolute inset-0 z-10 bg-transparent select-none cursor-default"
        onContextMenu={(e) => e.preventDefault()}
        style={{ userSelect: "none", WebkitUserSelect: "none", pointerEvents: "auto" }}
      />
    </div>
  );
}

export function ReportPdf() {
  const { id } = useParams<{ id: string }>(); // id is the slug
  const navigate = useNavigate();
  const { user, setUser, loading: authLoading } = useAuth();

  const checkStarted = useRef(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [requiredPlanName, setRequiredPlanName] = useState("Annual Premium");
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [articleTitle, setArticleTitle] = useState<string>("Secure Document View");
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfLoadError, setPdfLoadError] = useState(false);

  // Security listeners (Block Ctrl+S, Cmd+S, Ctrl+P, Cmd+P, Right-Click, Print Media)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body { display: none !important; }
        html { display: none !important; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (!id) return;

    const checkAuthAndAccess = async () => {
      if (authLoading) return;
      if (checkStarted.current) return;
      checkStarted.current = true;

      // 1. Check if user is logged in
      if (!user) {
        navigate("/login");
        return;
      }

      // 2. Check memory cache
      if (publicPdfCache.has(id)) {
        const cached = publicPdfCache.get(id);
        setPdfDoc(cached.doc);
        setNumPages(cached.numPages);
        setArticleTitle(cached.title || "Secure Document View");
        setCheckingAccess(false);
        return;
      }

      // 3. Validate token and refresh profile
      let activeUser = user;
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const { data } = await apiClient.get("/auth/profile");
          if (data && data.data) {
            activeUser = data.data;
            setUser(data.data);
          }
        } catch (error) {
          console.error("Session refresh failed", error);
        }
      }

      // 4. Fetch article to get required PDF role
      let requiredRole = "premium";
      let fetchedTitle = "Secure Document View";
      try {
        const { data } = await apiClient.get(`/cms/articles/${id}`);
        if (data.success && data.data) {
          if (data.data.title) {
            fetchedTitle = data.data.title;
            setArticleTitle(fetchedTitle);
          }
          const blocks = typeof data.data.blocks === "string" ? JSON.parse(data.data.blocks) : data.data.blocks;
          if (Array.isArray(blocks)) {
            const pdfBlock = blocks.find((b: any) => b.type === "pdf");
            if (pdfBlock && pdfBlock.activeRole) {
              requiredRole = pdfBlock.activeRole;
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch article for PDF role check", err);
      }

      const planToShow = ROLE_PLAN_NAMES[requiredRole] || "Annual Premium";
      setRequiredPlanName(planToShow);

      // 5. Verify access
      const userRoles = activeUser.roles || [];
      let userMaxLevel = 0;
      userRoles.forEach((r: string) => {
        const lvl = ROLE_LEVELS[r] || 0;
        if (lvl > userMaxLevel) userMaxLevel = lvl;
      });

      const requiredLevel = ROLE_LEVELS[requiredRole] || 0;
      const hasAccess = userMaxLevel >= requiredLevel;

      if (!hasAccess) {
        setUnauthorized(true);
        setCheckingAccess(false);
        return;
      }

      // 6. Fetch PDF as array buffer and load it
      try {
        const pdfjs = await loadPdfJS();
        const response = await apiClient.get(`/cms/reports/${id}/pdf`, {
          responseType: "arraybuffer",
        });

        const pdfData = new Uint8Array(response.data);
        const doc = await pdfjs.getDocument({ data: pdfData }).promise;

        setPdfDoc(doc);
        setNumPages(doc.numPages);

        publicPdfCache.set(id, {
          doc,
          numPages: doc.numPages,
          title: fetchedTitle,
        });
      } catch (err) {
        console.error("Failed to load secure PDF:", err);
        setPdfLoadError(true);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAuthAndAccess();
  }, [id, user, authLoading, navigate, setUser]);

  // Loading state
  if (authLoading || (checkingAccess && !unauthorized)) {
    return (
      <div className="min-h-screen bg-[#0f0f10] flex flex-col items-center justify-center text-white font-poppins">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-white/50" />
          <p className="text-sm font-medium tracking-wide text-gray-400">Verifying credentials & decrypting document...</p>
        </div>
      </div>
    );
  }

  // Access Denied state
  if (unauthorized) {
    return (
      <div
        className="min-h-screen bg-[#0f0f10] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-6 text-white font-poppins relative"
        style={{ backgroundImage: "url('/bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none"></div>
        <div className="absolute w-[350px] h-[350px] rounded-full bg-red-500/5 blur-[80px] -top-10 -left-10 pointer-events-none"></div>
        <div className="absolute w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[100px] -bottom-20 -right-20 pointer-events-none"></div>

        <div className="relative z-10 max-w-[420px] w-full bg-[#161618]/85 border border-white/10 p-8 md:p-10 rounded-4xl text-center shadow-2xl backdrop-blur-xl flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500/90 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-pulse">
            <Lock className="w-7 h-7" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-red-500/90">Error 403 • Access Denied</span>
            <h1 className="text-[26px] font-semibold tracking-tight text-white leading-tight">Access Restricted</h1>
            <p className="text-gray-400 text-[14px] leading-relaxed font-medium mt-1 px-2">
              The PDF report you are trying to view is either unavailable or requires an active <strong className="text-white">{requiredPlanName}</strong>{" "}
              subscription.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full mt-2">
            <button
              onClick={() => navigate("/subscriptions")}
              className="w-full py-3.5 bg-white text-black hover:bg-gray-100 rounded-full font-semibold transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              Upgrade Membership
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3.5 bg-[#252528] text-white hover:bg-[#323236] border border-white/5 rounded-full font-semibold transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Load error state
  if (pdfLoadError) {
    return (
      <div className="min-h-screen bg-[#0f0f10] flex flex-col items-center justify-center p-6 text-white font-poppins">
        <div className="max-w-[420px] w-full bg-[#161618] border border-white/10 p-8 rounded-4xl text-center shadow-xl flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">!</div>
          <h2 className="text-xl font-semibold">Failed to Load Document</h2>
          <p className="text-gray-400 text-sm">An error occurred while loading this document. Please try again or contact support if the issue persists.</p>
          <button
            onClick={() => navigate(`/reports/detail/${id}`)}
            className="w-full py-3 bg-[#252528] hover:bg-[#323236] rounded-full font-semibold transition-all active:scale-[0.99] cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Standard secure canvas viewer layout
  return (
    <div className="min-h-screen bg-[#0f0f10] flex flex-col font-poppins select-none" onContextMenu={(e) => e.preventDefault()}>
      {/* Sticky Premium Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0f0f10]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 flex justify-between items-center isolate">
        <button
          onClick={() => navigate(`/reports/detail/${id}`)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Close Viewer</span>
        </button>

        <div className="flex-1 text-center px-4 max-w-[50%] md:max-w-[60%]">
          <h2 className="text-white text-sm md:text-base font-semibold truncate">{articleTitle}</h2>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full shadow-sm text-emerald-400">
          <Shield className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold uppercase tracking-wider select-none">Secure Preview</span>
        </div>
      </header>

      {/* Main viewport rendering pages */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-10 bg-[#0c0c0d]">
        <div className="max-w-[840px] mx-auto w-full flex flex-col items-center">
          {Array.from({ length: numPages }).map((_, index) => (
            <PageRenderer key={index} pageNumber={index + 1} pdfDoc={pdfDoc} userEmail={user?.email} />
          ))}
        </div>
      </main>
    </div>
  );
}
