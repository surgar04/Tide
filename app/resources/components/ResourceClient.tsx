"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { EndfieldLoading } from "@/components/ui/EndfieldLoading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, faDownload, faShareNodes, faPen, faSave, faRotate, 
  faExpand, 
  faPlay, faPause, faCamera, faFileExport,
  faMusic
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

// --- Types ---
interface ResourceMetadata {
    uploader: string;
    category: string;
    type: string;
    originalName: string;
    uploadTime?: string;
}

// --- Components ---

function ResourceContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const id = params.id as string;
    const path = searchParams.get("path");
    
    const [loading, setLoading] = useState(true);
    const [metadata, setMetadata] = useState<ResourceMetadata | null>(null);
    const [content, setContent] = useState<string | null>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string>("");

    // Media State
    const videoRef = useRef<HTMLVideoElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    
    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [imgFilters, setImgFilters] = useState({ brightness: 100, contrast: 100, saturate: 100, rotate: 0 });
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (!path) return;
        
        const load = async () => {
            setLoading(true);
            try {
                // Fetch Metadata
                const metaRes = await fetch(`/api/github/file/details?path=${encodeURIComponent(path)}`);
                if (metaRes.ok) {
                    const data = await metaRes.json();
                    setMetadata(data.metadata);
                }

                // Determine Type
                const ext = path.split('.').pop()?.toLowerCase() || "";
                let type = "unknown";
                if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) type = "image";
                else if (["mp4", "webm", "mov"].includes(ext)) type = "video";
                else if (["mp3", "wav", "ogg"].includes(ext)) type = "audio";
                else if (["md", "txt", "json", "js", "ts", "css", "html"].includes(ext)) type = "text";
                else if (["pdf"].includes(ext)) type = "pdf";
                setFileType(type);

                // Fetch Content
                const contentRes = await fetch(`/api/github/file?path=${encodeURIComponent(path)}`);
                if (contentRes.ok) {
                    const blob = await contentRes.blob();
                    const url = URL.createObjectURL(blob);
                    setBlobUrl(url);
                    
                    if (type === "text") {
                        const text = await blob.text();
                        setContent(text);
                    }
                }
            } catch (e) {
                console.error("Failed to load resource", e);
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path]);

    // Cleanup blobUrl when it changes or component unmounts
    useEffect(() => {
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [blobUrl]);

    // --- Media Handlers ---
    const handleVideoTimeUpdate = () => {
        if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
    };

    const handleVideoLoaded = () => {
        if (videoRef.current) setDuration(videoRef.current.duration);
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const takeScreenshot = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `screenshot-${id}-${Math.floor(currentTime)}.png`;
        a.click();
    };

    const handleImageSave = () => {
        if (!imgRef.current) return;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Apply rotation implies size change if 90/270
        const rot = imgFilters.rotate % 360;
        const rad = rot * Math.PI / 180;
        
        if (rot === 90 || rot === 270) {
             canvas.width = imgRef.current.naturalHeight;
             canvas.height = imgRef.current.naturalWidth;
        } else {
             canvas.width = imgRef.current.naturalWidth;
             canvas.height = imgRef.current.naturalHeight;
        }

        ctx.filter = `brightness(${imgFilters.brightness}%) contrast(${imgFilters.contrast}%) saturate(${imgFilters.saturate}%)`;
        
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(rad);
        ctx.drawImage(imgRef.current, -imgRef.current.naturalWidth/2, -imgRef.current.naturalHeight/2);
        
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `edited-${path?.split('/').pop()}`;
        a.click();
        setIsEditing(false);
    };

    const handleShare = () => {
        // Create share card or just copy link
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert("链接已复制到剪贴板！ | Link copied to clipboard!");
        });
    };

    const handleConvert = () => {
        if (fileType === "image" && imgRef.current) {
            const canvas = document.createElement("canvas");
            canvas.width = imgRef.current.naturalWidth;
            canvas.height = imgRef.current.naturalHeight;
            canvas.getContext("2d")?.drawImage(imgRef.current, 0, 0);
            const url = canvas.toDataURL("image/jpeg", 0.9);
            const a = document.createElement("a");
            a.href = url;
            a.download = `converted-${id}.jpg`;
            a.click();
        } else {
            alert("该文件类型的在线转换即将推出。 | Online conversion for this file type is coming soon.");
        }
    };

    if (loading) {
        return <EndfieldLoading />;
    }

    if (!path) return <div className="p-10">无效路径 | INVALID PATH</div>;

    return (
        <div className="min-h-screen pb-20 relative">
             {/* Header */}
             <div className="sticky top-0 z-50 bg-[var(--end-surface)]/95 backdrop-blur border-b border-[var(--end-border)] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <FontAwesomeIcon icon={faArrowLeft} className="text-[var(--end-text-main)]" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-[var(--end-text-main)] uppercase tracking-wide">
                            {path.split('/').pop()}
                        </h1>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--end-text-sub)]">
                            <span className="bg-[var(--end-yellow)] text-black px-1 font-bold">ID: {id}</span>
                            <span>{metadata?.category || "未知 | UNKNOWN"}</span>
                            <span>|</span>
                            <span>{metadata?.uploader || "系统 | SYSTEM"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {fileType === "image" && (
                        <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className={cn("p-2 border border-[var(--end-border)] transition-all", isEditing ? "bg-[var(--end-yellow)] text-black" : "text-[var(--end-text-main)] hover:bg-white/5")}
                            title="编辑图片 | Edit Image"
                        >
                            <FontAwesomeIcon icon={faPen} />
                        </button>
                    )}
                    <button onClick={handleConvert} className="p-2 border border-[var(--end-border)] text-[var(--end-text-main)] hover:bg-white/5" title="转换 | Convert">
                        <FontAwesomeIcon icon={faFileExport} />
                    </button>
                    <button onClick={handleShare} className="p-2 border border-[var(--end-border)] text-[var(--end-text-main)] hover:bg-white/5" title="分享 | Share">
                        <FontAwesomeIcon icon={faShareNodes} />
                    </button>
                    <a href={blobUrl || "#"} download={path.split('/').pop()} className="p-2 bg-[var(--end-yellow)] text-black font-bold hover:bg-[#e5b300]">
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        下载 | DOWNLOAD
                    </a>
                </div>
             </div>

             {/* Main Content */}
             <div className="max-w-6xl mx-auto p-6 space-y-6">
                
                {/* Image Viewer/Editor */}
                {fileType === "image" && blobUrl && (
                    <div className="bg-black/5 border border-[var(--end-border)] p-4 flex flex-col items-center">
                        <div className="relative overflow-hidden" style={{ maxHeight: "70vh" }}>
                            <img 
                                ref={imgRef}
                                src={blobUrl} 
                                alt="Resource" 
                                className="max-w-full object-contain transition-all duration-200"
                                style={{
                                    filter: `brightness(${imgFilters.brightness}%) contrast(${imgFilters.contrast}%) saturate(${imgFilters.saturate}%)`,
                                    transform: `rotate(${imgFilters.rotate}deg)`
                                }}
                            />
                        </div>
                        
                        {isEditing && (
                            <div className="w-full mt-6 p-4 bg-white border border-[var(--end-border)] grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-mono uppercase">亮度 | Brightness</label>
                                    <input 
                                        type="range" min="0" max="200" 
                                        value={imgFilters.brightness} 
                                        onChange={(e) => setImgFilters({...imgFilters, brightness: Number(e.target.value)})}
                                        className="w-full accent-[var(--end-yellow)]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-mono uppercase">对比度 | Contrast</label>
                                    <input 
                                        type="range" min="0" max="200" 
                                        value={imgFilters.contrast} 
                                        onChange={(e) => setImgFilters({...imgFilters, contrast: Number(e.target.value)})}
                                        className="w-full accent-[var(--end-yellow)]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-mono uppercase">饱和度 | Saturation</label>
                                    <input 
                                        type="range" min="0" max="200" 
                                        value={imgFilters.saturate} 
                                        onChange={(e) => setImgFilters({...imgFilters, saturate: Number(e.target.value)})}
                                        className="w-full accent-[var(--end-yellow)]"
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <button onClick={() => setImgFilters({...imgFilters, rotate: imgFilters.rotate + 90})} className="p-2 bg-gray-100 hover:bg-gray-200 flex-1">
                                        <FontAwesomeIcon icon={faRotate} /> 旋转 | Rotate
                                    </button>
                                    <button onClick={handleImageSave} className="p-2 bg-[var(--end-yellow)] text-black font-bold flex-1">
                                        <FontAwesomeIcon icon={faSave} /> 保存 | Save
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Video Player */}
                {fileType === "video" && blobUrl && (
                    <div className="bg-black border border-[var(--end-border)] relative group">
                        <video 
                            ref={videoRef}
                            src={blobUrl}
                            className="w-full max-h-[70vh]"
                            onTimeUpdate={handleVideoTimeUpdate}
                            onLoadedMetadata={handleVideoLoaded}
                            onClick={togglePlay}
                        />
                        
                        {/* Custom Controls Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                            {/* Progress Bar */}
                            <input 
                                type="range" 
                                min="0" max={duration} 
                                value={currentTime}
                                onChange={(e) => {
                                    if(videoRef.current) videoRef.current.currentTime = Number(e.target.value);
                                }}
                                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[var(--end-yellow)]"
                            />
                            
                            <div className="flex items-center justify-between text-white">
                                <div className="flex items-center gap-4">
                                    <button onClick={togglePlay} className="hover:text-[var(--end-yellow)]">
                                        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="w-5 h-5" />
                                    </button>
                                    <span className="font-mono text-xs">
                                        {new Date(currentTime * 1000).toISOString().substr(14, 5)} / {new Date(duration * 1000).toISOString().substr(14, 5)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={takeScreenshot} className="hover:text-[var(--end-yellow)]" title="截图 | Screenshot">
                                        <FontAwesomeIcon icon={faCamera} />
                                    </button>
                                    <button onClick={() => videoRef.current?.requestPictureInPicture()} className="hover:text-[var(--end-yellow)]" title="画中画 | PiP">
                                        <FontAwesomeIcon icon={faExpand} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Markdown / Text */}
                {fileType === "text" && content && (
                    <div className="bg-white border border-[var(--end-border)] p-8 min-h-[500px]">
                        <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]} 
                                rehypePlugins={[rehypeHighlight, rehypeKatex]}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
                
                {/* Audio Player */}
                {fileType === "audio" && blobUrl && (
                     <div className="bg-white border border-[var(--end-border)] p-10 flex flex-col items-center gap-6">
                        <div className="w-32 h-32 bg-[var(--end-surface)] rounded-full flex items-center justify-center border-4 border-[var(--end-yellow)] shadow-lg animate-pulse-slow">
                            <FontAwesomeIcon icon={faMusic} className="w-12 h-12 text-[var(--end-text-main)]" />
                        </div>
                        <audio src={blobUrl} controls className="w-full max-w-md" />
                     </div>
                )}

                {/* Metadata Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[var(--end-surface)] border border-[var(--end-border)] p-4">
                        <h3 className="text-[var(--end-yellow)] font-bold uppercase mb-4 border-b border-[var(--end-border)] pb-2">技术数据 | Technical Data</h3>
                        <div className="space-y-2 font-mono text-xs text-[var(--end-text-main)]">
                            <div className="flex justify-between">
                                <span className="text-[var(--end-text-sub)]">路径 | PATH</span>
                                <span className="text-right break-all">{path}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-[var(--end-text-sub)]">大小 | SIZE</span>
                                <span>{metadata?.originalName ? "未知 | UNKNOWN" : "计算中... | CALCULATING..."}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-[var(--end-text-sub)]">类型 | TYPE</span>
                                <span className="uppercase">{fileType}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--end-surface)] border border-[var(--end-border)] p-4">
                         <h3 className="text-[var(--end-yellow)] font-bold uppercase mb-4 border-b border-[var(--end-border)] pb-2">操作信息 | Operational Info</h3>
                         <div className="space-y-2 font-mono text-xs text-[var(--end-text-main)]">
                            <div className="flex justify-between">
                                <span className="text-[var(--end-text-sub)]">上传者 | UPLOADER</span>
                                <span>{metadata?.uploader || "N/A"}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-[var(--end-text-sub)]">上传时间 | UPLOAD_TIME</span>
                                <span>{metadata?.uploadTime ? new Date(metadata.uploadTime).toLocaleString() : "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>

             </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<EndfieldLoading />}>
            <ResourceContent />
        </Suspense>
    );
}
