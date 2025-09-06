import EditorJS, {
  BlockToolConstructable,
  InlineToolConstructable,
  OutputData,
  LogLevels,
  SanitizerConfig,
} from "@editorjs/editorjs";
import { useEffect, useRef, useCallback } from "react";

// Configuration interface for the hook
interface UseEditorJSConfig {
  placeholder?: string;
  autofocus?: boolean;
  readOnly?: boolean;
  minHeight?: number;
  logLevel?: LogLevels;
  defaultBlock?: string;
  sanitizer?: SanitizerConfig;
  tools?: {
    [toolName: string]:
      | BlockToolConstructable
      | InlineToolConstructable
      | {
          class: BlockToolConstructable | InlineToolConstructable;
          config?: any;
          inlineToolbar?: boolean | string[];
          toolbox?: {
            title: string;
            icon: string;
          };
          shortcut?: string;
        };
  };
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

// Return type for the hook
interface UseEditorJSReturn {
  editor: EditorJS | null;
  holderRef: React.RefObject<HTMLDivElement | null>;
  save: () => Promise<OutputData | undefined>;
  clear: () => Promise<void>;
  render: (data: OutputData) => Promise<void>;
  destroy: () => void;
  isReady: boolean;
}

export const useEditorJS = (
  config: UseEditorJSConfig = {}
): UseEditorJSReturn => {
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const isReadyRef = useRef<boolean>(false);

  const {
    placeholder = "Type here to write your story...",
    autofocus = true,
    readOnly = false,
    minHeight = 300,
    defaultBlock = "paragraph",
    sanitizer,
    tools,
    data,
    onChange,
    onReady,
    onError,
  } = config;

  // Save function
  const save = useCallback(async (): Promise<OutputData | undefined> => {
    if (!editorRef.current || !isReadyRef.current) {
      console.warn("Editor is not ready");
      return undefined;
    }

    try {
      const outputData = await editorRef.current.save();
      return outputData;
    } catch (error) {
      console.error("Error saving editor content:", error);
      onError?.(error as Error);
      return undefined;
    }
  }, [onError]);

  // Clear function
  const clear = useCallback(async (): Promise<void> => {
    if (!editorRef.current || !isReadyRef.current) {
      console.warn("Editor is not ready");
      return;
    }

    try {
      editorRef.current.clear();
    } catch (error) {
      console.error("Error clearing editor content:", error);
      onError?.(error as Error);
    }
  }, [onError]);

  // Render function
  const render = useCallback(
    async (renderData: OutputData): Promise<void> => {
      if (!editorRef.current || !isReadyRef.current) {
        console.warn("Editor is not ready");
        return;
      }

      try {
        await editorRef.current.render(renderData);
      } catch (error) {
        console.error("Error rendering editor content:", error);
        onError?.(error as Error);
      }
    },
    [onError]
  );

  // Destroy function
  const destroy = useCallback((): void => {
    if (editorRef.current && isReadyRef.current) {
      try {
        editorRef.current.destroy();
        editorRef.current = null;
        isReadyRef.current = false;
      } catch (error) {
        console.error("Error destroying editor:", error);
        onError?.(error as Error);
      }
    }
  }, [onError]);

  useEffect(() => {
    // Prevent multiple initialization
    if (editorRef.current) {
      return;
    }

    const initializeEditor = async () => {
      // Clear any existing content in the holder
      if (holderRef.current) {
        holderRef.current.innerHTML = "";
      }

      try {
        const editor = new EditorJS({
          holder: holderRef.current!,
          autofocus,
          readOnly,
          placeholder,
          minHeight,
          defaultBlock,
          sanitizer,
          tools,
          data,
          onReady: () => {
            console.log("Editor.js is ready to work!");
            isReadyRef.current = true;
            onReady?.();
          },
          onChange: async (api) => {
            if (!onChange) return;

            try {
              const content = await api.saver.save();
              onChange(content);
            } catch (error) {
              console.error("Error in onChange callback:", error);
              onError?.(error as Error);
            }
          },
        });

        editorRef.current = editor;
      } catch (error) {
        console.error("Error initializing Editor.js:", error);
        onError?.(error as Error);
      }
    };

    initializeEditor();

    return () => {
      destroy();
    };
  }, [
    autofocus,
    readOnly,
    placeholder,
    minHeight,
    defaultBlock,
    sanitizer,
    tools,
    data,
    onChange,
    onReady,
    onError,
    destroy,
  ]);

  return {
    editor: editorRef.current,
    holderRef,
    save,
    clear,
    render,
    destroy,
    isReady: isReadyRef.current,
  };
};
