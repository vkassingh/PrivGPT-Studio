"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  Settings,
  Info,
  MessageSquare,
  Zap,
  Home,
  Globe,
  Cpu,
  Clock,
  Activity,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Edit,
  Download,
  Eraser,
  Mic,
  Volume2,
  Copy,
  Plus,
  X,
  FileText,
  File,
  ImageIcon,
  PlusCircle,
  Square,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MentionsInput, Mention } from "react-mentions";
import SplashScreen from "../../splashScreen";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import Head from "next/head";
import Image from "next/image";
import { useTheme } from "@/components/theme-provider";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  file?: UploadedFile;
}

type ChatSession = {
  id: string;
  sessionName: string;
  lastMessage: string;
};

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

export default function ChatPage() {
  const { darkMode } = useTheme();

  // Loading dots animation component
  const LoadingDots = () => {
    const [dots, setDots] = useState(".");

    useEffect(() => {
      const interval = setInterval(() => {
        setDots((prev) => {
          if (prev === ".") return "..";
          if (prev === "..") return "...";
          return ".";
        });
      }, 500);

      return () => clearInterval(interval);
    }, []);

    return <span>{dots}</span>;
  };

  // Add this component inside your ChatPage component, before the return statement
  // Helper to wrap text nodes with highlighting spans
  const wrapTextWithHighlight = (text: string, charIndex: number) => {
    // If charIndex is -1, no highlighting (just return the text wrapped in spans)
    const shouldHighlight = charIndex >= 0;

    const segments: Array<{ text: string; start: number; end: number }> = [];
    let pos = 0;

    // Split into words and whitespace while preserving position
    text.split(/(\s+)/).forEach((segment) => {
      if (segment.length > 0) {
        const start = pos;
        const end = pos + segment.length;
        segments.push({ text: segment, start, end });
        pos = end;
      }
    });

    return (
      <>
        {segments.map((segment, index) => {
          const isCurrentWord = shouldHighlight && charIndex >= segment.start && charIndex < segment.end && /\S/.test(segment.text);
          return (
            <span
              key={index}
              className={`transition-colors duration-150 ${
                isCurrentWord
                  ? 'bg-sky-100/90 dark:bg-sky-300/40 rounded px-0.5'
                  : ''
              }`}
            >
              {segment.text}
            </span>
          );
        })}
      </>
    );
  };

  const MessageContent = ({
    content,
    isLoading,
    isUser = false,
    isSpeakingThis = false,
    currentCharIndex = 0,
    spokenText = "",
  }: {
    content: string;
    isLoading?: boolean;
    isUser?: boolean;
    isSpeakingThis?: boolean;
    currentCharIndex?: number;
    spokenText?: string;
  }) => {
    if (isLoading || content === "...") {
      return <LoadingDots />;
    }

    // If TTS is active, render the stripped text with word highlighting and preserved line breaks
    if (isSpeakingThis && spokenText) {
      const lines = spokenText.split('\n');
      let globalCharOffset = 0;

      return (
        <div className="markdown-content">
          {lines.map((line, lineIndex) => {
            const lineStart = globalCharOffset;
            const lineEnd = globalCharOffset + line.length;

            // Calculate relative position for highlighting within this line
            const relativeCharIndex = currentCharIndex >= lineStart && currentCharIndex < lineEnd
              ? currentCharIndex - lineStart
              : -1; // -1 means no highlighting in this line

            const lineElement = line.length > 0
              ? wrapTextWithHighlight(line, relativeCharIndex)
              : <span>&nbsp;</span>;

            globalCharOffset = lineEnd + 1; // +1 for the newline character

            return (
              <div key={lineIndex} className="mb-3 leading-relaxed text-gray-800 dark:text-gray-200">
                {lineElement}
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="markdown-content" data-speaking={isSpeakingThis ? "true" : "false"}>
        <Head>
          <title>
            AI Chat | PrivGPT Studio - Chat with Local & Cloud AI Models
          </title>
          <meta
            name="description"
            content="Experience seamless, private conversations with AI. Chat in real-time using powerful local models or cloud-powered Gemini. Export your history and manage your chats effortlessly."
          />
          <meta
            name="keywords"
            content="AI chat, real-time AI conversation, local AI models, Gemini AI chat, private AI chat, chat with AI, export chat history, PrivGPT Studio chat"
          />

          {/* Open Graph */}
          <meta
            property="og:title"
            content="AI Chat | PrivGPT Studio - Chat with Local & Cloud AI Models"
          />
          <meta
            property="og:description"
            content="Experience seamless, private conversations with AI. Chat in real-time using powerful local models or cloud-powered Gemini."
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:url"
            content="https://privgpt-studio.vercel.app/chat"
          />
          <meta
            property="og:image"
            content="https://privgpt-studio.vercel.app/logo.png"
          />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta
            property="og:image:alt"
            content="PrivGPT Studio AI Chat Interface Preview"
          />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="AI Chat | PrivGPT Studio" />
          <meta
            name="twitter:description"
            content="Chat in real-time with AI using local or cloud models. A seamless and private conversation experience."
          />
          <meta
            name="twitter:image"
            content="https://privgpt-studio.vercel.app/logo.png"
          />

          {/* Canonical */}
          <link rel="canonical" href="https://privgpt-studio.vercel.app/chat" />
        </Head>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            // Code blocks with syntax highlighting
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              const language = match ? match[1] : "";

              // Better inline detection - check multiple conditions
              const isInline =
                inline ||
                !className ||
                !String(children).includes("\n") ||
                (String(children).trim().split("\n").length === 1 &&
                  String(children).length < 100);

              // Debug log to see what's happening (remove after testing)
              console.log("Code rendering:", {
                inline,
                isInline,
                className,
                content: String(children),
                hasNewlines: String(children).includes("\n"),
              });

              return isInline ? (
                // Inline code
                <code
                  className={`px-1.5 py-0.5 rounded text-sm font-mono ${
                    isUser
                      ? "bg-primary-foreground/10 text-primary-foreground"
                      : "bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400"
                  }`}
                  {...props}
                >
                  {children}
                </code>
              ) : (
                // Block code
                <div className="relative my-4">
                  <div className="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-2 text-sm font-mono rounded-t-md">
                    <span>{language || "code"}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          String(children).replace(/\n$/, "")
                        );
                        toast.success("Code copied to clipboard!");
                      }}
                      className="text-gray-400 hover:text-white text-xs"
                    >
                      Copy
                    </button>
                  </div>
                  <SyntaxHighlighter
                    style={oneDark as any}
                    language={language}
                    PreTag="div"
                    className="!mt-0 !rounded-t-none"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              );
            },
            // Headers
            h1: ({ children }) => (
              <h1
                className={`text-2xl font-bold mt-6 mb-4 ${
                  isUser
                    ? "text-primary-foreground"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                className={`text-xl font-semibold mt-5 mb-3 ${
                  isUser
                    ? "text-primary-foreground"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3
                className={`text-lg font-semibold mt-4 mb-2 ${
                  isUser
                    ? "text-primary-foreground"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {children}
              </h3>
            ),
            // Lists
            ul: ({ children }) => (
              <ul className="list-disc list-inside my-3 space-y-1 ml-4">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside my-3 space-y-1 ml-4">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li
                className={
                  isUser
                    ? "text-primary-foreground"
                    : "text-gray-800 dark:text-gray-200"
                }
              >
                {children}
              </li>
            ),
            // Paragraphs
            p: ({ children }) => (
              <p
                className={`mb-3 leading-relaxed ${
                  isUser
                    ? "text-primary-foreground"
                    : "text-gray-800 dark:text-gray-200"
                }`}
              >
                {children}
              </p>
            ),
            // Blockquotes
            blockquote: ({ children }) => (
              <blockquote
                className={`border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic ${
                  isUser
                    ? "text-primary-foreground/80"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {children}
              </blockquote>
            ),
            // Links
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  isUser
                    ? "text-primary-foreground underline hover:text-primary-foreground/80"
                    : "text-blue-600 dark:text-blue-400 hover:underline"
                }
              >
                {children}
              </a>
            ),
            // Tables
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-gray-300 dark:border-gray-600">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-100 dark:bg-gray-700">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                {children}
              </td>
            ),
            // Horizontal rule
            hr: () => (
              <hr className="my-6 border-gray-300 dark:border-gray-600" />
            ),
            // Strong/Bold
            strong: ({ children }) => (
              <strong
                className={`font-bold ${
                  isUser
                    ? "text-primary-foreground"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {children}
              </strong>
            ),
            // Emphasis/Italic
            em: ({ children }) => (
              <em
                className={`italic ${
                  isUser
                    ? "text-primary-foreground"
                    : "text-gray-800 dark:text-gray-200"
                }`}
              >
                {children}
              </em>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const welcomeMessage: Message = {
    id: "1",
    content: "Hello! I'm your AI assistant. How can I help you today?",
    role: "assistant",
    timestamp: new Date(),
  };
  const welcomeSession = {
    id: "1", // or any unique ID
    sessionName: "How can I help You?",
    lastMessage: "Hello! I'm your AI assistant. How can I help you today?",
  };
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [localModels, setLocalModels] = useState<string[]>([]);
  const [cloudModels, setCloudModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedModelType, setSelectedModelType] = useState<"local" | "cloud">(
    "local"
  );
  const [isChatSessionsCollapsed, setIsChatSessionsCollapsed] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [chatSessionSuggestions, setChatSessionSuggestions] = useState<
    { id: string; display: string }[]
  >([]);
  const [sessionId, setSessionId] = useState<string>("1");
  const [status, setStatus] = useState("Online");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [latency, setLatency] = useState<string | null>("0");
  const [clearChatSessionModal, setClearChatSessionModal] = useState(false);
  const [exportChatSessionModal, setExportChatSessionModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ignoreOnEndRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newChatSessionBtnRef = useRef<HTMLButtonElement | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [deleteChatSessionModal, setDeleteChatSessionModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Text-to-Speech (Web Speech API)
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null
  );
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);
  const [spokenText, setSpokenText] = useState<string>("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const canceledByUserRef = useRef<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize Web Speech API (TTS)
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      "SpeechSynthesisUtterance" in window
    ) {
      setSpeechSupported(true);
      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        setVoices(v);
        if (!selectedVoice && v.length > 0) {
          const preferred =
            v.find(
              (voice) =>
                voice.lang.toLowerCase().startsWith("en") &&
                /google.*english|microsoft.*english/i.test(voice.name)
            ) ||
            v.find((voice) => voice.lang.toLowerCase().startsWith("en")) ||
            v[0];
          setSelectedVoice(preferred || null);
        }
      };

      // Some browsers populate voices async
      loadVoices();
      const onChange = () => loadVoices();
      (window.speechSynthesis as any).onvoiceschanged = onChange;

      return () => {
        (window.speechSynthesis as any).onvoiceschanged = null;
      };
    } else {
      setSpeechSupported(false);
    }
  }, [selectedVoice]);

  // Utility: strip markdown and code for clearer TTS
  const stripMarkdown = (md: string) => {
    if (!md) return "";
    let text = md;

    // Remove code blocks first
    text = text.replace(/```[\s\S]*?```/g, ""); // remove fenced code blocks
    text = text.replace(/`[^`]*?`/g, ""); // remove inline code

    // Remove images
    text = text.replace(/!\[[^\]]*\]\([^\)]*\)/g, "");

    // Convert links to text (keep the link text, discard URL)
    text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, "$1");

    // Remove specific markdown formatting patterns (most specific first)
    text = text.replace(/\*\*\*(.+?)\*\*\*/gs, "$1"); // ***bold italic***
    text = text.replace(/___(.+?)___/gs, "$1"); // ___bold italic___
    text = text.replace(/\*\*(.+?)\*\*/gs, "$1"); // **bold**
    text = text.replace(/__(.+?)__/gs, "$1"); // __bold__
    text = text.replace(/\*(.+?)\*/gs, "$1"); // *italic*
    text = text.replace(/_(.+?)_/gs, "$1"); // _italic_
    text = text.replace(/~~(.+?)~~/gs, "$1"); // ~~strikethrough~~

    // Remove headers (# symbols at start of line)
    text = text.replace(/^#{1,6}\s+/gm, "");

    // Remove blockquote markers
    text = text.replace(/^>\s+/gm, "");

    // Remove horizontal rules
    text = text.replace(/^(\*{3,}|-{3,}|_{3,})$/gm, "");

    // Preserve line breaks but collapse other consecutive whitespace
    text = text.replace(/[^\S\n]+/g, " "); // collapse spaces/tabs but not newlines
    text = text.replace(/ *\n */g, "\n"); // clean up spaces around newlines

    return text.trim();
  };

  const stopSpeech = () => {
    try {
      canceledByUserRef.current = true;
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }
    } finally {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      setCurrentCharIndex(0);
      setSpokenText("");
      utteranceRef.current = null;
    }
  };

  const speakText = (text: string, messageId: string) => {
    if (!speechSupported) {
      toast.error("Text-to-Speech not supported in this browser.");
      return;
    }
    // Cancel any ongoing speech and start fresh
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    canceledByUserRef.current = false;
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 1.05; // slightly faster for responsiveness
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMessageId(messageId);
      setSpokenText(text);
      setCurrentCharIndex(0);
    };

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (event.name === 'word') {
        setCurrentCharIndex(event.charIndex);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      setCurrentCharIndex(0);
      setSpokenText("");
      utteranceRef.current = null;
      canceledByUserRef.current = false;
    };
    utterance.onerror = (e: any) => {
      const code = e?.error || e?.name || "";
      const wasCanceled = canceledByUserRef.current || code === "canceled" || code === "interrupted";
      if (!wasCanceled) {
        console.error("TTS error:", e);
        toast.error("Failed to speak the message.");
      }
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      setCurrentCharIndex(0);
      setSpokenText("");
      utteranceRef.current = null;
      canceledByUserRef.current = false;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeakClick = (message: Message) => {
    if (message.role !== "assistant") return;
    if (message.content === "...") return; // don't read loading placeholder

    if (isSpeaking && speakingMessageId === message.id) {
      // toggle stop if already speaking this message
      stopSpeech();
      return;
    }

    const plain = stripMarkdown(message.content);
    if (!plain) {
      toast.error("Nothing to read aloud.");
      return;
    }
    speakText(plain, message.id);
  };

  // Cleanup on unmount: stop any ongoing speech
  useEffect(() => {
    return () => {
      try {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      } catch {}
    };
  }, []);

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsStreaming(false);
      // Reset typing indicator if it was set
      setIsTyping(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/models`
        );
        const data = await response.json();
        const local: string[] = data.local_models || [];
        const cloud: string[] = data.cloud_models || [];
        setLocalModels(local);
        setCloudModels(cloud);

        // Attempt restore from localStorage
        const storedModel =
          typeof window !== "undefined"
            ? localStorage.getItem("selected_model_name")
            : null;
        const storedType =
          (typeof window !== "undefined"
            ? (localStorage.getItem("selected_model_type") as
                | "local"
                | "cloud"
                | null)
            : null);

        // Always select the first available model as default
        let modelToSelect = "";
        let typeToSelect: "local" | "cloud" = "local";

        // First priority: stored model if still available
        if (
          storedModel &&
          ((storedType === "local" && local.includes(storedModel)) ||
            (storedType === "cloud" && cloud.includes(storedModel)))
        ) {
          modelToSelect = storedModel;
          typeToSelect = storedType as "local" | "cloud";
        } else if (local.length > 0) {
          modelToSelect = local[0];
          typeToSelect = "local";
        } else if (cloud.length > 0) {
          modelToSelect = cloud[0];
          typeToSelect = "cloud";
        }

        // Set the selected model
        if (modelToSelect) {
          setSelectedModel(modelToSelect);
          setSelectedModelType(typeToSelect);
          if (typeof window !== "undefined") {
            localStorage.setItem("selected_model_name", modelToSelect);
            localStorage.setItem("selected_model_type", typeToSelect);
          }
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
      }
    };
    fetchModels();
  }, []);

  const fallbackToGemini = (errorText: string) => {
    const geminiAvailable = cloudModels.includes("gemini");
    if (geminiAvailable) {
      toast.error(
        `Local model unavailable. Switched to Gemini. Error: ${errorText}`
      );
      setSelectedModel("gemini");
      setSelectedModelType("cloud");
      try {
        localStorage.setItem("selected_model_name", "gemini");
        localStorage.setItem("selected_model_type", "cloud");
      } catch (e) {
        /* ignore */
      }
    } else {
      toast.error(
        `Local model unavailable and Gemini not configured. Error: ${errorText}`
      );
    }
  };

  useEffect(() => {
    const fetchChatSessionHistory = async () => {
      const storedSessions = JSON.parse(
        localStorage.getItem("chat_sessions") || "[]"
      );

      // ✅ If no previous sessions, just show welcome
      if (storedSessions.length === 0) {
        setSessionId(welcomeSession.id); // "1"
        setMessages([welcomeMessage]);
        setChatSessions([welcomeSession]);
        if (newChatSessionBtnRef.current) {
          newChatSessionBtnRef.current.disabled = true;
        }
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/history`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_ids: storedSessions }),
          }
        );

        if (!response.ok) throw new Error("Failed to fetch session history");

        const sessions = await response.json();

        if (sessions.length > 0) {
          const transformedSessions: ChatSession[] = sessions.map(
            (session: any) => {
              const lastMsg =
                session.messages?.[session.messages.length - 1]?.content ||
                welcomeSession.lastMessage;
              return {
                id: session._id,
                created_at: session.created_at,
                lastMessage: lastMsg,
                sessionName: session.session_name || lastMsg,
              };
            }
          );

          // ✅ Always keep welcomeSession first in the list
          setChatSessions([...transformedSessions]);

          // ✅ Only reset to welcomeSession if you are currently on it
          if (sessionId === welcomeSession.id || !sessionId) {
            setSessionId(welcomeSession.id); // stays as "1"
            if (newChatSessionBtnRef.current)
              newChatSessionBtnRef.current.disabled = true;

            // show only welcome message if welcome is selected
            setMessages([welcomeMessage]);
            return;
          }

          // ✅ Otherwise, load messages for currently active sessionId
          const activeSession =
            sessions.find((s: any) => s._id === sessionId) || sessions[0];
          const formattedMessages: Message[] = activeSession.messages?.map(
            (msg: any, index: number) => {
              const normalizedRole: "user" | "assistant" =
                msg.role === "user"
                  ? "user"
                  : msg.role === "assistant" || msg.role === "bot"
                  ? "assistant"
                  : "assistant";

              return {
                id: msg.id || (index + 2).toString(),
                content: msg.content,
                role: normalizedRole,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                ...(msg.uploaded_file
                  ? {
                      file: {
                        name: msg.uploaded_file.name,
                        size: msg.uploaded_file.size,
                        type: msg.uploaded_file.type,
                        file: msg.uploaded_file.file,
                      } as UploadedFile,
                    }
                  : {}),
              };
            }
          );

          // ✅ Put welcomeMessage on top of history
          setMessages([welcomeMessage, ...(formattedMessages || [])]);
        }
      } catch (error) {
        console.error("Failed to fetch session history:", error);
      }
    };

    fetchChatSessionHistory();
  }, [sessionId, editedName]);
  useEffect(() => {
    if (newChatSessionBtnRef.current && !showSplash) {
      newChatSessionBtnRef.current.disabled = true;
    }
  }, [showSplash]);
  useEffect(() => {
    if (chatSessions.some((session) => session.id === "1")) {
      // welcomeSession exists, disable new chat button
      if (newChatSessionBtnRef.current) {
        newChatSessionBtnRef.current.disabled = true;
      }
    } else {
      // no welcome session, allow new chat
      if (newChatSessionBtnRef.current && sessionId != "1") {
        newChatSessionBtnRef.current.disabled = false;
      }
    }
  }, [chatSessions]);

  useEffect(() => {
    let wasOffline = false; // track previous state

    function checkStatus() {
      const isNowOnline = navigator.onLine;
      setStatus(isNowOnline ? "Online" : "Offline");

      if (!isNowOnline && !wasOffline) {
        wasOffline = true;

        if (selectedModelType === "cloud" && localModels.length > 0) {
          setSelectedModel(localModels[0]);
          setSelectedModelType("local");
          toast.warning("You are offline. Switched to local model.");
        } else {
          toast.error("You are offline and no local models are available.");
        }
      }

      if (isNowOnline) {
        wasOffline = false;
      }
    }

    checkStatus(); // Run once immediately
    const interval = setInterval(checkStatus, 5000); // Poll every 30s

    return () => clearInterval(interval);
  }, [localModels, selectedModelType]); // Add selectedModelType to dependencies

  const handleSend = async () => {
    if (!input.trim()) return;

    // Check if a model is selected
    if (!selectedModel || selectedModel.trim() === "") {
      toast.error("Please select a model before sending a message.");
      return;
    }

    // Check if models are loaded
    if (localModels.length === 0 && cloudModels.length === 0) {
      toast.error("Loading models... Please wait a moment and try again.");
      return;
    }

    // remove backslashes added by react-mentions markup
    const unescapedInput = input.replace(/\\([\[\]\(\)])/g, "$1");

    const mentionMatches = [...unescapedInput.matchAll(/@\[(.*?)\]\((.*?)\)/g)];
    const mentionIds = mentionMatches.map((m) => m[2]);

    const messageWithDisplayOnly = unescapedInput
      .replace(/@\[(.*?)\]\((.*?)\)/g, (_match, display, _id) => `@${display}`)
      .trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageWithDisplayOnly,
      role: "user",
      timestamp: new Date(),
      ...(uploadedFile ? { file: uploadedFile } : {}),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Use streaming endpoint for text-only messages (if streaming is enabled), regular endpoint for file uploads or when streaming is disabled
    const endpoint =
      uploadedFile || !streamingEnabled
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/stream`;

    // Only set typing indicator for file uploads (non-streaming cases) or when streaming is disabled
    if (uploadedFile || !streamingEnabled) {
      setIsTyping(true);
    }

    const formData = new FormData();
    formData.append("message", userMessage.content);
    formData.append("model_type", selectedModelType);
    formData.append("model_name", selectedModel);
    formData.append("timestamp", userMessage.timestamp.toISOString());
    if (sessionId) formData.append("session_id", sessionId);

    // append mention ids
    mentionIds.forEach((id) => formData.append("mention_session_ids[]", id));

    // append file if uploaded
    if (uploadedFile) {
      formData.append("uploaded_file", uploadedFile.file);
      // Remove file after adding to form data
      removeFile();
    }

    // Handle file uploads with regular endpoint
    if (uploadedFile || !streamingEnabled) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch AI response");
        }

        const data = await response.json();
        const bot_response = data.response || "No Reply";

        if (sessionId === "1" && data.session_id) {
          setSessionId(data.session_id);
          localStorage.setItem(
            "chat_sessions",
            JSON.stringify([
              ...JSON.parse(localStorage.getItem("chat_sessions") || "[]"),
              data.session_id,
            ])
          );
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: bot_response,
          role: "assistant",
          timestamp: new Date(data.timestamp),
        };

        // Fallback detection for local model failures
        if (data.fallback_used) {
          fallbackToGemini(bot_response);
        } else if (
          bot_response.toLowerCase().includes("local model error") ||
          bot_response.toLowerCase().includes("connection refused") ||
          bot_response.toLowerCase().includes("failed to establish")
        ) {
          // If server didn't auto fallback (e.g., streaming disabled), try client side
          fallbackToGemini(bot_response);
        }

        if (
          newChatSessionBtnRef.current &&
          newChatSessionBtnRef.current.disabled
        ) {
          newChatSessionBtnRef.current.disabled = false;
        }

        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
        setLatency(data.latency.toString());
      } catch (error) {
        console.error("Failed to receive response from AI", error);
        setIsTyping(false);
      }
      return;
    }

    // Handle streaming for text-only messages
    const tempAssistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "...",
      role: "assistant",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, tempAssistantMessage]);
    setIsStreaming(true);

    // Create abort controller for stopping generation
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";
      let finalSessionId = sessionId;
      let latencyValue = "0";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                switch (data.type) {
                  case "session_info":
                    if (data.session_id && data.session_id !== sessionId) {
                      finalSessionId = data.session_id;
                    }
                    break;

                  case "chunk":
                    // If this is the first chunk and we still have "..." as content, clear it first
                    if (streamedContent === "" && data.text) {
                      streamedContent = data.text;
                    } else {
                      streamedContent += data.text;
                    }
                    // Detect server-sent fallback marker
                    if (data.text && data.text.includes("[Local model failed, switching to gemini")) {
                      fallbackToGemini("Local model failed during streaming");
                    }
                    // Update the temporary message with streamed content
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === tempAssistantMessage.id
                          ? { ...msg, content: streamedContent }
                          : msg
                      )
                    );
                    break;

                  case "complete":
                    if (data.session_id && sessionId === "1") {
                      setSessionId(data.session_id);
                      localStorage.setItem(
                        "chat_sessions",
                        JSON.stringify([
                          ...JSON.parse(
                            localStorage.getItem("chat_sessions") || "[]"
                          ),
                          data.session_id,
                        ])
                      );
                    }

                    // Update final message with timestamp
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === tempAssistantMessage.id
                          ? {
                              ...msg,
                              content: streamedContent,
                              timestamp: new Date(data.timestamp),
                            }
                          : msg
                      )
                    );

                    latencyValue = data.latency?.toString() || "0";
                    break;

                  case "error":
                    streamedContent = data.message;
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === tempAssistantMessage.id
                          ? { ...msg, content: streamedContent }
                          : msg
                      )
                    );
                    break;
                }
              } catch (e) {
                // Ignore JSON parse errors for malformed lines
                console.warn("Failed to parse SSE data:", e);
              }
            }
          }
        }
      }

      if (
        newChatSessionBtnRef.current &&
        newChatSessionBtnRef.current.disabled
      ) {
        newChatSessionBtnRef.current.disabled = false;
      }

      // Fallback detection after streaming
      if (
        streamedContent &&
        (streamedContent.toLowerCase().includes("local model error") ||
          streamedContent.toLowerCase().includes("connection refused") ||
          streamedContent.toLowerCase().includes("failed to establish"))
      ) {
        fallbackToGemini(streamedContent);
      }

      setIsStreaming(false);
      setAbortController(null);
      setLatency(latencyValue);
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Generation was stopped by user");
        // Update the temp message to show it was stopped
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAssistantMessage.id
              ? {
                  ...msg,
                  content:
                    (msg.content || "") + "\n\n[Generation stopped by user]",
                }
              : msg
          )
        );
      } else {
        console.error("Failed to receive response from AI", error);

        // Update the temp message with error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAssistantMessage.id
              ? {
                  ...msg,
                  content: "Failed to get response from AI. Please try again.",
                }
              : msg
          )
        );
      }

      setIsStreaming(false);
      setAbortController(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      });
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearChatSession = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/clear`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session_id: sessionId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to clear chat session");
      }

      toast.success("Chat cleared successfully!");

      // Reset messages with welcome message
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error("Error clearing session:", error);
      toast.error("Failed to clear chat.");
    } finally {
      setClearChatSessionModal(false);
    }
  };

  const handleExportChatSession = () => {
    if (!sessionId) {
      toast.error("No session to export.");
      return;
    }

    // Find the current session's name from chatSessions array
    const currentSession = chatSessions.find((s) => s.id === sessionId);
    const sessionName = currentSession
      ? currentSession.sessionName
      : "Unnamed Session";

    // Build the export content
    let exportText = `CHATBOT CONVERSATION\n====================================\n\n`;
    exportText += `Session ID: ${sessionId}\n`;
    exportText += `Session Name: ${sessionName}\n`;
    exportText += `Exported At: ${new Date().toLocaleString()}\n\n`;
    exportText += `------------------------------------\n\n`;

    // Add messages
    messages.forEach((msg) => {
      const who = msg.role === "user" ? "You" : "Bot";
      const time = msg.timestamp
        ? new Date(msg.timestamp).toLocaleTimeString()
        : "Unknown Time";
      exportText += `[${time}] ${who}: ${msg.content}\n\n`;
    });

    // Create a blob and download
    const blob = new Blob([exportText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Create a filename that includes session name (safe fallback)
    const safeName = sessionName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    a.download = `chat_${safeName}_${sessionId}.txt`;

    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Chat exported successfully!");
    setExportChatSessionModal(false);
  };

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    // Configure for maximum accuracy
    recognition.lang = "en-US"; // Change to your preferred language/dialect (en-GB, en-AU, en-IN, etc.)
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5; // Reduced from 10 for better performance

    // Request the best possible audio quality and processing
    // These are advanced settings that improve accuracy
    if ('serviceURI' in recognition) {
      // Use premium speech recognition endpoint if available
      console.log("Using premium speech recognition service");
    }

    // Additional settings for improved recognition
    if ('grammars' in recognition) {
      // Grammar support (limited browser support but helps when available)
      const SpeechGrammarList = (window as any).SpeechGrammarList || (window as any).webkitSpeechGrammarList;
      if (SpeechGrammarList) {
        const grammarList = new SpeechGrammarList();
        recognition.grammars = grammarList;
      }
    }

    console.log("Speech recognition configured with maxAlternatives:", recognition.maxAlternatives);

    // Handle recognition results with real-time interim and final transcripts
    recognition.onresult = (event: any) => {
      console.log("Speech recognition onresult triggered", event);
      let interim = "";
      let newFinalText = "";

      // Process all results to build the full transcript
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];

        // Use the highest confidence alternative (first one is usually best)
        // Simplified approach - browser already ranks by confidence
        let bestTranscript = result[0].transcript;
        let bestConfidence = result[0].confidence || 1;

        // Only check alternatives if confidence is low
        if (bestConfidence < 0.8 && result.length > 1) {
          for (let j = 1; j < Math.min(result.length, 3); j++) {
            const alternative = result[j];
            const confidence = alternative.confidence || 0;

            if (confidence > bestConfidence) {
              bestConfidence = confidence;
              bestTranscript = alternative.transcript;
            }
          }
        }

        console.log(`Result ${i}: "${bestTranscript}" (confidence: ${bestConfidence.toFixed(3)}, isFinal: ${result.isFinal})`);

        if (result.isFinal) {
          // Apply cleanup only to final results
          const processedTranscript = bestTranscript
            // Fix common spacing issues
            .replace(/\s+/g, ' ')
            .trim();

          newFinalText += processedTranscript + " ";
        } else {
          interim += bestTranscript;
        }
      }

      // Update states in batch
      if (newFinalText) {
        setFinalTranscript((prev) => {
          const updated = prev + newFinalText;
          console.log("Updated final transcript:", updated);
          // Update input field with final + interim
          setInput(updated + interim);
          setInterimTranscript(interim);
          return updated;
        });
      } else {
        // Only interim results, update input field
        setInterimTranscript(interim);
        setFinalTranscript((currentFinal) => {
          setInput(currentFinal + interim);
          return currentFinal;
        });
      }
    };

    // Handle recognition start
    recognition.onstart = () => {
      ignoreOnEndRef.current = false;
      console.log("✅ Speech recognition STARTED - microphone is active");
    };

    // Handle recognition end - only stop when user manually stops
    recognition.onend = () => {
      console.log("Recognition ended. isRecordingRef:", isRecordingRef.current, "ignoreOnEnd:", ignoreOnEndRef.current);

      if (ignoreOnEndRef.current) {
        ignoreOnEndRef.current = false;
        return;
      }

      // If recognition ends unexpectedly while user wants to keep recording, restart it
      // This handles browser-imposed limits but keeps it seamless
      if (isRecordingRef.current) {
        console.log("Recognition ended unexpectedly, restarting...");
        // Small delay to prevent rapid restart loops
        setTimeout(() => {
          if (isRecordingRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
              console.log("Recognition restarted successfully");
            } catch (error) {
              console.error("Error restarting:", error);
              // Only stop if restart fails
              setIsRecording(false);
              isRecordingRef.current = false;
              toast.error("Voice recognition stopped unexpectedly");
            }
          }
        }, 100);
      }
    };

    // Enhanced error handling
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);

      // Clear any pending restart timeout
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      switch (event.error) {
        case "no-speech":
          // Don't stop on no-speech, just log it - let onend handle continuation
          console.log("No speech detected, continuing...");
          break;
        case "audio-capture":
          toast.error("No microphone found. Please check your device.");
          ignoreOnEndRef.current = true;
          setIsRecording(false);
          isRecordingRef.current = false;
          break;
        case "not-allowed":
          toast.error("Microphone access denied. Please allow microphone access.");
          ignoreOnEndRef.current = true;
          setIsRecording(false);
          isRecordingRef.current = false;
          break;
        case "aborted":
          // Only log if user didn't manually stop
          if (isRecordingRef.current) {
            console.log("Recognition aborted unexpectedly");
          }
          break;
        case "network":
          toast.error("Network error. Check your internet connection.");
          ignoreOnEndRef.current = true;
          setIsRecording(false);
          isRecordingRef.current = false;
          break;
        default:
          // Don't show error toast for every error type - some are recoverable
          console.error("Speech recognition error:", event.error);
      }
    };

    recognitionRef.current = recognition;

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Removed dependencies to prevent recreation

  const handleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      isRecordingRef.current = false;

      // Use ignoreOnEnd to prevent restart
      ignoreOnEndRef.current = true;
      recognitionRef.current.stop();
      console.log("Recording stopped by user");
      toast.info("Voice input stopped");
    } else {
      // Start recording
      setIsRecording(true);
      isRecordingRef.current = true;
      setFinalTranscript("");
      setInterimTranscript("");
      setInput("");

      try {
        recognitionRef.current.start();
        console.log("Recording started by user");
        toast.success("Microphone activated - start speaking!");
      } catch (error) {
        console.error("Error starting recognition:", error);
        setIsRecording(false);
        isRecordingRef.current = false;
        toast.error("Could not start voice recognition");
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    if (type.includes("text") || type.includes("document"))
      return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const handleCurrentChatSession = async (id: string) => {
    try {
      if (id === "1") {
        setMessages([welcomeMessage]);
        setSessionId("1");
        return;
      }

      if (sessionId === "1" && id !== "1") {
        // Filter out dummy session
        setChatSessions((prev) =>
          prev.filter((chatSession) => chatSession.id !== "1")
        );
        if (newChatSessionBtnRef.current && id != "1") {
          newChatSessionBtnRef.current.disabled = false;
        }
      }

      setSessionId(id);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/${id}`
      );
      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();

      const formattedMessages: Message[] = data.messages.map(
        (msg: any, index: number) => {
          const normalizedRole: "user" | "assistant" =
            msg.role === "user"
              ? "user"
              : msg.role === "assistant" || msg.role === "bot"
              ? "assistant"
              : "assistant"; // default unknown roles to assistant

          return {
            id: msg.id || `${Date.now()}-${index}`,
            content: msg.content,
            role: normalizedRole,
            timestamp: new Date(msg.timestamp),
            ...(msg.uploaded_file
              ? {
                  file: {
                    name: msg.uploaded_file.name,
                    size: msg.uploaded_file.size,
                    type: msg.uploaded_file.type,
                    file: msg.uploaded_file.file,
                  } as UploadedFile,
                }
              : {}),
          };
        }
      );

      const newWelcomeMessage: Message = {
        id: "1",
        content: "Hello! I'm your AI assistant. How can I help you today?",
        role: "assistant",
        timestamp:
          formattedMessages.length > 0
            ? formattedMessages[0].timestamp
            : new Date(),
      };

      setMessages([newWelcomeMessage, ...formattedMessages]);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleNewChatSession = () => {
    const isAlreadyPresent = chatSessions.some(
      (session) => session.id === welcomeSession.id
    );

    if (!isAlreadyPresent) {
      setChatSessions((prev) => [welcomeSession, ...prev]);
      setSessionId(welcomeSession.id);
      welcomeMessage.timestamp = new Date();
      setMessages([welcomeMessage]);
      if (!isChatSessionsCollapsed)
        setIsChatSessionsCollapsed(!isChatSessionsCollapsed);
    }

    if (newChatSessionBtnRef.current) {
      newChatSessionBtnRef.current.disabled = true;
    }
  };

  const handleRenameSession = (id: string) => {
    const session = chatSessions.find((s) => s.id === id);
    if (!session) return;

    setEditingSessionId(id);
    setEditedName(session.sessionName);
  };

  const handleDeleteChatSession = async (id: string) => {
    try {
      // Call backend DELETE
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/delete/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        toast.error(errData.error || "Failed to delete chat session");
        return;
      }

      const data = await response.json();
      toast.success(data.message || "Chat deleted successfully");

      // Remove from local state
      const updatedSessions = chatSessions.filter(
        (chatSession) => chatSession.id !== id
      );
      setChatSessions(updatedSessions);

      // Remove from localStorage
      const storedSessions: string[] = JSON.parse(
        localStorage.getItem("chat_sessions") || "[]"
      );
      const filteredStoredSessions = storedSessions.filter(
        (sessionId) => sessionId !== id
      );
      localStorage.setItem(
        "chat_sessions",
        JSON.stringify(filteredStoredSessions)
      );

      // Decide what to show next
      if (updatedSessions.length > 0) {
        // Switch to first session in queue
        const firstSession = updatedSessions[0];
        handleCurrentChatSession(firstSession.id);
      } else {
        // If no sessions left, fallback to welcome session
        setChatSessions([welcomeSession]);
        setSessionId("1");
        setMessages([welcomeMessage]);
        if (newChatSessionBtnRef.current) {
          newChatSessionBtnRef.current.disabled = true;
        }
      }

      // Close modal
      setDeleteChatSessionModal(false);
    } catch (error) {
      console.error("Error deleting chat session:", error);
      toast.error("Something went wrong while deleting the chat.");
      setDeleteChatSessionModal(false);
    }
  };

  const saveEditedName = async (id: string) => {
    if (!editedName.trim()) {
      toast.error("Session name cannot be empty.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/rename`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: id, new_name: editedName }),
        }
      );

      if (res.ok) {
        setChatSessions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, name: editedName } : s))
        );
      } else {
        const errorText = await res.text();
        throw errorText;
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while renaming the session.");
    } finally {
      setEditingSessionId(null);
      setEditedName("");
    }
  };

  const cancelEdit = () => {
    setEditingSessionId(null);
    setEditedName("");
  };

  useEffect(() => {
    if (Array.isArray(chatSessions)) {
      const suggestions = chatSessions
        .filter((session: any) => session.id !== "1") // exclude id==="1"
        .map((session: any) => ({
          id: session.id,
          display:
            session.sessionName || session.session_name || "Unnamed Session",
        }));
      setChatSessionSuggestions(suggestions);
    }
  }, [chatSessions]);

  if (showSplash) return <SplashScreen />;

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed overflow-auto 
  [&::-webkit-scrollbar]:w-1.5 
  [&::-webkit-scrollbar-track]:bg-transparent 
  [&::-webkit-scrollbar-thumb]:bg-gray-300 
  [&::-webkit-scrollbar-thumb]:rounded-sm
  [&::-webkit-scrollbar-thumb:hover]:bg-gray-400
  dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 
  dark:[&::-webkit-scrollbar-thumb:hover]:bg-gray-500
  lg:static inset-y-0 left-0 z-50 bg-background border-r transform transition-all duration-300 ease-in-out ${
    isSidebarOpen
      ? "translate-x-0 w-80 lg:w-80"
      : "-translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0"
  }`}
      >
        {/* Sidebar Header */}
        <div
          className={`sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b px-4 py-4 ${
            !isSidebarOpen ? "lg:hidden" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image
                src={darkMode ? "/logos/logo-dark.svg" : "/logos/logo-light.svg"}
                alt="PrivGPT Studio Logo"
                width={290}
                height={53}
                priority
                className="w-[220px] h-auto"
              />
              </Link>

            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {/* Desktop close button */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex"
                onClick={() => setIsSidebarOpen(false)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="block lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 mt-5 px-2">
          {/* Navigation */}
          <nav className={`space-y-2 ${!isSidebarOpen ? "lg:hidden" : ""}`}>
            <Collapsible
              open={isChatSessionsCollapsed}
              onOpenChange={setIsChatSessionsCollapsed}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="default"
                  className="w-full justify-between"
                  aria-expanded={!isChatSessionsCollapsed}
                >
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chats
                  </div>
                  {isChatSessionsCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-1 mt-2">
                {chatSessions.map((session, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between px-2 py-1 rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      handleCurrentChatSession(session.id);
                      // Close sidebar on mobile after selecting a chat
                      if (window.innerWidth < 1024) {
                        setIsSidebarOpen(false);
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      {editingSessionId === session.id ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          onBlur={(e) => {
                            setTimeout(() => {
                              if (document.activeElement !== inputRef.current) {
                                saveEditedName(session.id);
                              }
                            }, 100);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveEditedName(session.id);
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              cancelEdit();
                            }
                          }}
                          autoFocus
                          className="text-sm font-medium bg-transparent border-b border-black outline-none"
                        />
                      ) : (
                        <p className="text-sm font-medium truncate cursor-pointer">
                          {session.sessionName}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground truncate">
                        {session.lastMessage}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        className={`${session.id == "1" && ""}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleRenameSession(session.id)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteChatSessionModal(true)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
            <Button
              ref={newChatSessionBtnRef}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                handleNewChatSession();
                // Close sidebar on mobile after creating new chat
                if (window.innerWidth < 1024) {
                  setIsSidebarOpen(false);
                }
              }}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Info className="w-4 h-4 mr-2" />
              Model Info
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
          </nav>

          {/* Model Selection */}
          <div className={`p-4 border-b ${!isSidebarOpen ? "lg:hidden" : ""}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">AI Model</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">Stream</span>
                <Switch
                  checked={streamingEnabled}
                  onCheckedChange={setStreamingEnabled}
                />
              </div>
            </div>
            <Select
              value={selectedModel}
              onValueChange={(model: string) => {
                setSelectedModel(model);
                setSelectedModelType(
                  localModels.includes(model) ? "local" : "cloud"
                );
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model..." />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  Local Models
                </div>
                {localModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    <div className="flex items-center">
                      <Cpu className="w-4 h-4 mr-2" />
                      {model}
                    </div>
                  </SelectItem>
                ))}

                <div className="px-2 py-1 text-xs text-muted-foreground mt-2">
                  Cloud Models
                </div>
                {cloudModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      {model}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Usage Stats */}
          <div className={`p-4 flex-1 ${!isSidebarOpen ? "lg:hidden" : ""}`}>
            <h3 className="font-semibold mb-3">Usage Stats</h3>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 mr-2 text-green-500" />
                      <span className="text-sm">Internet Status</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        status === "Online" ? "text-green-600" : "text-red-600"
                      }
                    >
                      {status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-sm">Messages</span>
                    </div>
                    <span className="text-sm font-medium">
                      {messages.length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-orange-500" />
                      <span className="text-sm">Latency</span>
                    </div>
                    <span className="text-sm font-medium">{latency}ms</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Panel */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "lg:ml-0" : "lg:ml-0"
        }`}
      >
        {/* Chat Header with Hamburger */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className={`${isSidebarOpen ? "lg:hidden" : ""}`}
                onClick={() => setIsSidebarOpen(true)}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Chat Interface</h1>
                <p className="text-sm text-muted-foreground">
                  Currently using: {selectedModel}
                </p>
              </div>
            </div>
            <Badge
              variant={selectedModelType === "cloud" ? "default" : "secondary"}
            >
              {selectedModelType === "cloud" ? "Cloud" : "Local"}
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 
  [&::-webkit-scrollbar-track]:bg-transparent 
  [&::-webkit-scrollbar-thumb]:bg-gray-300 
  [&::-webkit-scrollbar-thumb]:rounded-sm
  [&::-webkit-scrollbar-thumb:hover]:bg-gray-400
  dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 
  dark:[&::-webkit-scrollbar-thumb:hover]:bg-gray-500 p-4 space-y-4"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start space-x-2 max-w-2xl ${
                  message.role === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {message.role === "user" ? "U" : "AI"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.file && (
                      <div className="mt-2 flex items-center space-x-2 bg-muted/50 rounded-lg p-2 max-w-xs mb-3">
                        {getFileIcon(message.file.type)}
                        <div>
                          <p className="text-sm font-medium max-w-[100px] truncate">
                            {message.file.name}
                          </p>
                          <p className="text-[0.6em]">
                            {formatFileSize(message.file.size)}
                          </p>
                        </div>
                      </div>
                    )}
                    <div>
                      <MessageContent
                        content={message.content}
                        isLoading={message.content === "..."}
                        isUser={message.role === "user"}
                        isSpeakingThis={speakingMessageId === message.id}
                        currentCharIndex={currentCharIndex}
                        spokenText={spokenText}
                      />
                    </div>
                    <p
                      suppressHydrationWarning
                      className="text-xs opacity-70 mt-1"
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {/* Controls under the message bubble (bottom-left) */}
                  <div className="mt-1 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Copy message"
                      aria-label="Copy message"
                      disabled={!message.content || message.content === "..."}
                      onClick={() => {
                        navigator.clipboard
                          .writeText(message.content)
                          .then(() => toast.success("Message copied"))
                          .catch(() => toast.error("Copy failed"));
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {message.role === "assistant" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title={
                          speakingMessageId === message.id
                            ? "Stop reading"
                            : "Read aloud"
                        }
                        aria-label={
                          speakingMessageId === message.id
                            ? "Stop reading"
                            : "Read aloud"
                        }
                        disabled={!speechSupported || message.content === "..."}
                        onClick={() => handleSpeakClick(message)}
                        className={
                          speakingMessageId === message.id
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : ""
                        }
                      >
                        {speakingMessageId === message.id ? (
                          <Square className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-2xl">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          {/* File Preview */}
          {uploadedFile && (
            <div className="mb-3 flex items-center justify-between bg-muted/50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                {getFileIcon(uploadedFile.type)}
                <div>
                  <p className="text-sm font-medium">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadedFile.size)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Voice Input Button */}
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceInput}
              className={`${
                isRecording
                  ? "text-red-500 animate-pulse bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40"
                  : "hover:text-primary"
              } transition-all duration-200`}
              title={isRecording ? "Stop recording" : "Start voice input"}
            >
              <Mic className={`w-4 h-4 ${isRecording ? "animate-pulse" : ""}`} />
              {isRecording && (
                <span className="ml-1 text-xs font-medium">Listening...</span>
              )}
            </Button>
          </div>

          {/* Input Row */}
          <div className="flex space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={selectedModelType == "local"}
            >
              <Plus className="w-4 h-4" />
            </Button>

            <div className="relative flex-1">
              {/* Styled overlay with color-coded transcription text */}
              {isRecording && (finalTranscript || interimTranscript) && (
                <div className="absolute inset-0 p-2 px-3 pointer-events-none overflow-auto z-10 flex items-start">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap break-words w-full pt-[2px]">
                    <span className="text-foreground">{finalTranscript}</span>
                    <span className="text-muted-foreground italic">{interimTranscript}</span>
                  </div>
                </div>
              )}

              {chatSessionSuggestions.length > 0 ? (
                <MentionsInput
                  value={input}
                  onChange={(_event, newValue) => setInput(newValue)}
                  placeholder="Type your message and use @ to mention chats..."
                  style={{
                    control: {
                      backgroundColor: "transparent",
                      fontSize: 14,
                    },
                    highlighter: {
                      padding: "0.5rem 0.75rem",
                      border: "none",
                    },
                    input: {
                      padding: "0.5rem 0.75rem",
                      border: "none",
                      outline: "none",
                      backgroundColor: "transparent",
                      color: isRecording ? "transparent" : undefined,
                    },
                    suggestions: {
                      list: {
                        backgroundColor: "white",
                        border: "1px solid rgba(0,0,0,0.15)",
                        fontSize: 14,
                      },
                      item: {
                        padding: "5px 15px",
                        "&focused": {
                          backgroundColor: "#f5f5f5",
                        },
                      },
                    },
                  }}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:border-input disabled:cursor-not-allowed disabled:opacity-50"
                  onKeyDown={handleKeyPress}
                >
                  <Mention
                    trigger="@"
                    markup="@\[__display__\]\(__id__\)"
                    data={chatSessionSuggestions}
                    displayTransform={(id: string, display: string) =>
                      `@${display}`
                    }
                    style={{ backgroundColor: "#e0e2e4" }}
                    appendSpaceOnAdd
                  />
                </MentionsInput>
              ) : (
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message in markdown..."
                  className={`flex-1 resize-none min-h-[80px] ${
                    isRecording ? "text-transparent caret-foreground" : ""
                  }`}
                />
              )}
            </div>
            {isStreaming ? (
              <Button
                onClick={stopGeneration}
                variant="destructive"
                className="bg-red-500 hover:bg-red-600"
              >
                Stop
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={isTyping || (!uploadedFile && input.trim() === "")}
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClearChatSessionModal(true)}
                className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <Eraser className="w-4 h-4 mr-1" />
                Clear Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExportChatSessionModal(true)}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Download className="w-4 h-4 mr-1" />
                Export Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Chat Session Confirmation Modal */}
      <Dialog
        open={clearChatSessionModal}
        onOpenChange={setClearChatSessionModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Chat History</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all messages in this chat? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClearChatSessionModal(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearChatSession}>
              Clear Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Chat Session Confirmation Modal */}
      <Dialog
        open={exportChatSessionModal}
        onOpenChange={setExportChatSessionModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Chat History</DialogTitle>
            <DialogDescription>
              This will download your chat history as a text file. Do you want
              to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExportChatSessionModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleExportChatSession}>Export Chat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Chat Session Confirmation Modal */}
      <Dialog
        open={deleteChatSessionModal}
        onOpenChange={setDeleteChatSessionModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat permanently? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExportChatSessionModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteChatSession(sessionId)}
            >
              Delete Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
