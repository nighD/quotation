import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Lock, Shield, Sparkles, RefreshCw } from "lucide-react";
import { apiClient } from "../../../../api/client";
import { useAuth } from "../../../../context/AuthContext";
import { UpgradeModal } from "../../../../components/UpgradeModal";

const ROLE_LEVELS: Record<string, number> = {
  free: 0,
  base: 1,
  standard: 2,
  premium: 3,
  admin: 4,
};

const ROLE_PLAN_NAMES: Record<string, string> = {
  free: "Free Member",
  base: "Monthly Basic",
  standard: "Quarterly Standard",
  premium: "Annual Premium",
  admin: "Administrator",
};

// Global in-memory cache for PDF binary documents to prevent re-downloading
const pdfDocMemoryCache = new Map<string, any>();

// Dynamically load PDF.js script from CDN
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
        reject(new Error("PDF.js global library (pdfjsLib) was not found."));
      }
    };
    script.onerror = () => reject(new Error("Failed to download PDF.js library."));
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

  // Lazy render when entering viewport (+-600px margin) to save GPU memory and prevent canvas context drop
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

      // Base width of 1000px ensures sharp text even on high-res displays
      const originalViewport = page.getViewport({ scale: 1 });
      const desiredWidth = 1000;
      const scale = desiredWidth / originalViewport.width;
      const viewport = page.getViewport({ scale });

      // Cap device pixel ratio at 2 to prevent GPU VRAM exhaustion on 3x/4x mobile screens
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

      // Draw watermarking overlay
      ctx.save();
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.fillStyle = "rgba(82, 60, 55, 0.09)";
      ctx.textAlign = "center";

      const dateString = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const watermarkText = `VIFC PASS • SECURE DASHBOARD • ${userEmail || "authorized-user"} • ${dateString}`;

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
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm border border-[#E4D6CA] bg-[#FAF6F1] mb-6 sm:mb-8 flex flex-col items-center min-h-[480px] aspect-[1/1.414] isolate [transform:translateZ(0)] [backface-visibility:hidden]"
      style={{ willChange: "transform" }}
    >
      {(!isVisible || loading) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF6F1] z-20 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#523C37]/60" />
          <span className="text-[12px] text-[#664E48] font-['Inter'] font-medium">
            {!isVisible ? `Chuẩn bị trang ${pageNumber}...` : `Đang tải trang ${pageNumber}...`}
          </span>
        </div>
      )}

      {renderError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF6F1] z-20 gap-3 p-6 text-center">
          <span className="text-[13px] text-[#9A4D3A] font-['Inter'] font-medium">Không thể hiển thị trang {pageNumber}</span>
          <button
            type="button"
            onClick={() => {
              isRenderedRef.current = false;
              renderPage();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#523C37] text-white rounded-lg text-xs font-medium cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Thử lại</span>
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

export default function DashboardReportPdf() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, setUser, loading: authLoading } = useAuth();

  const checkStarted = useRef(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [requiredPlanName, setRequiredPlanName] = useState("Standard Plan");
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [articleTitle, setArticleTitle] = useState<string>("Báo cáo phân tích");
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Security: block printing, saving, right clicks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p")) {
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
    if (!slug) return;

    const checkAuthAndAccess = async () => {
      if (authLoading) return;
      if (checkStarted.current) return;
      checkStarted.current = true;

      // 1. Check if cached PDF already exists in memory
      if (pdfDocMemoryCache.has(slug)) {
        const cached = pdfDocMemoryCache.get(slug);
        setPdfDoc(cached.doc);
        setNumPages(cached.numPages);
        setArticleTitle(cached.title || "Báo cáo phân tích");
        setCheckingAccess(false);
        return;
      }

      // 2. Refresh profile
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

      // 3. Fetch article for title & PDF role requirement
      let requiredRole = "standard";
      let fetchedTitle = "Báo cáo phân tích";
      try {
        const { data } = await apiClient.get(`/cms/articles/${slug}`);
        if (data.success && data.data) {
          if (data.data.title) {
            fetchedTitle = data.data.title;
            setArticleTitle(fetchedTitle);
            document.title = `${fetchedTitle} (PDF) — On-Chain Card`;
          }
          if (data.data.required_role) {
            requiredRole = data.data.required_role;
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
        console.error("Failed to fetch article metadata", err);
      }

      const planTitle = ROLE_PLAN_NAMES[requiredRole] || "Standard Plan";
      setRequiredPlanName(planTitle);

      // 4. Verify role access
      const userRoles = activeUser?.roles || [];
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

      // 5. Fetch PDF file as arraybuffer and render
      try {
        const pdfjs = await loadPdfJS();
        const response = await apiClient.get(`/cms/reports/${slug}/pdf`, {
          responseType: "arraybuffer",
        });

        const pdfData = new Uint8Array(response.data);
        const doc = await pdfjs.getDocument({ data: pdfData }).promise;

        setPdfDoc(doc);
        setNumPages(doc.numPages);

        // Store into memory cache
        pdfDocMemoryCache.set(slug, {
          doc,
          numPages: doc.numPages,
          title: fetchedTitle,
        });
      } catch (err) {
        console.error("Failed to load PDF document:", err);
        setPdfLoadError(true);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAuthAndAccess();
  }, [slug, authLoading]);

  // Loading state
  if (authLoading || (checkingAccess && !unauthorized)) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3 select-none">
        <Loader2 className="w-9 h-9 animate-spin text-[#523C37]" />
        <p className="font-['Inter'] text-[13px] font-medium text-[#664E48]">Đang xác thực bảo mật và nạp tài liệu...</p>
      </div>
    );
  }

  // Access Denied / Locked state
  if (unauthorized) {
    return (
      <div className="w-full pb-12">
        {/* Sticky Top Bar */}
        <div className="sticky -top-3 sm:-top-4 md:-top-6 lg:-top-6 xl:-top-8 z-10 -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-6 xl:-mx-8 px-4 sm:px-6 md:px-8 py-3 bg-[#F2E8E0]/95 backdrop-blur-md border-b border-[#DCD0C5] mb-6 sm:mb-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(`/report/${slug}`)}
            className="bg-[#523C37] hover:bg-[#382b24] text-[#F2E8E0] px-3.5 sm:px-4 py-2 rounded-lg font-['Inter']! text-[11px] sm:text-[12px] font-medium! tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
          >
            <ArrowLeft size={14} />
            <span>BACK TO REPORT</span>
          </button>
        </div>

        <div className="max-w-lg mx-auto bg-[#FDFBF7] border border-[#E4D6CA] p-8 sm:p-10 rounded-3xl text-center shadow-lg space-y-6 select-none my-8">
          <div className="w-16 h-16 rounded-full bg-[#9A4D3A]/10 border border-[#9A4D3A]/20 flex items-center justify-center text-[#9A4D3A] mx-auto shadow-sm">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#9A4D3A] font-['Inter']">Yêu cầu quyền thành viên</span>
            <h1 className="font-['Cormorant_Garamond'] text-[28px] sm:text-[32px] font-semibold text-[#1B1A16] leading-tight">
              Tài liệu được bảo vệ
            </h1>
            <p className="font-['Inter'] text-[#523C37] text-[14px] leading-relaxed">
              Báo cáo PDF này chỉ dành riêng cho tài khoản có hạng thành viên từ <strong className="text-[#1B1A16]">{requiredPlanName}</strong> trở lên.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="w-full py-3.5 bg-[#523C37] hover:bg-[#382b24] text-[#F2E8E0] rounded-xl font-['Inter'] text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles size={14} className="text-[#E8D7C9]" />
              <span>Nâng cấp hạng thẻ</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/report/${slug}`)}
              className="w-full py-3 bg-[#E8D7C9] hover:bg-[#ded0c2] text-[#523C37] rounded-xl font-['Inter'] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              Quay lại chi tiết
            </button>
          </div>
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={() => {
            setShowUpgradeModal(false);
            window.location.reload();
          }}
        />
      </div>
    );
  }

  // Load error state
  if (pdfLoadError) {
    return (
      <div className="w-full pb-12">
        <div className="max-w-md mx-auto bg-[#FDFBF7] border border-[#E4D6CA] p-8 rounded-3xl text-center shadow-lg space-y-5 my-12">
          <div className="w-12 h-12 rounded-full bg-[#9A4D3A]/10 text-[#9A4D3A] flex items-center justify-center mx-auto text-xl font-bold">!</div>
          <h2 className="font-['Cormorant_Garamond'] text-[24px] font-semibold text-[#1B1A16]">Không thể tải tài liệu PDF</h2>
          <p className="font-['Inter'] text-[#664E48] text-xs leading-relaxed">Đã xảy ra sự cố khi giải mã tài liệu. Vui lòng kiểm tra lại kết nối hoặc thử lại sau.</p>
          <button
            type="button"
            onClick={() => navigate(`/report/${slug}`)}
            className="w-full py-3 bg-[#523C37] text-white rounded-xl font-['Inter'] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Active Dashboard PDF viewer
  return (
    <div className="w-full pb-12 select-none" onContextMenu={(e) => e.preventDefault()}>
      {/* Sticky Top Header Bar */}
      <div className="sticky -top-3 sm:-top-4 md:-top-6 lg:-top-6 xl:-top-8 z-10 -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-6 xl:-mx-8 px-4 sm:px-6 md:px-8 py-3 bg-[#F2E8E0]/95 backdrop-blur-md border-b border-[#DCD0C5] mb-6 sm:mb-8 flex items-center justify-between gap-4 isolate">
        <button
          type="button"
          onClick={() => navigate(`/report/${slug}`)}
          className="bg-[#523C37] hover:bg-[#382b24] text-[#F2E8E0] px-3.5 sm:px-4 py-2 rounded-lg font-['Inter']! text-[11px] sm:text-[12px] font-medium! tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
        >
          <ArrowLeft size={14} />
          <span>BACK TO REPORT</span>
        </button>

        <div className="flex-1 text-center px-4 max-w-[50%] md:max-w-[60%] hidden sm:block">
          <h2 className="font-['Cormorant_Garamond'] text-[#1B1A16] text-[18px] md:text-[20px] font-semibold truncate">
            {articleTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-[#E8D7C9] text-[#523C37] px-3.5 py-1.5 rounded-full shadow-2xs border border-[#DFD3C7] shrink-0">
          <Shield className="w-3.5 h-3.5 text-[#523C37]" />
          <span className="font-['Inter'] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider select-none">Secure Preview</span>
        </div>
      </div>

      {/* Main Pages Viewport */}
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
        {Array.from({ length: numPages }).map((_, index) => (
          <PageRenderer key={index} pageNumber={index + 1} pdfDoc={pdfDoc} userEmail={user?.email} />
        ))}
      </div>
    </div>
  );
}
