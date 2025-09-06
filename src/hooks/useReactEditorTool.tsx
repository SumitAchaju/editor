import React, { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

export const useReactEditorTool = (
  Component: React.ComponentType<any>,
  toolConfig: any & {
    validate?: (data: any) => boolean;
    defaultData?: any;
  }
) => {
  return class EnhancedReactTool {
    private wrapper: HTMLElement;
    private root: any;
    protected data: any;
    private updateTrigger: ((data: any) => void) | null = null;

    static get toolbox() {
      return toolConfig.toolbox;
    }

    constructor({ data }: { data?: any }) {
      this.wrapper = document.createElement("div");
      this.data = { ...toolConfig.defaultData, ...data };
      this.root = createRoot(this.wrapper);
    }

    render() {
      const EnhancedWrapper = () => {
        const [currentData, setCurrentData] = useState(this.data);
        const [error, setError] = useState<string | null>(null);

        useEffect(() => {
          this.updateTrigger = (newData: any) => {
            setCurrentData(newData);
            setError(null);
          };

          return () => {
            this.updateTrigger = null;
          };
        }, []);

        const handleChange = useCallback(
          (newData: any) => {
            try {
              const updatedData = { ...currentData, ...newData };

              // Validate data if validator is provided
              if (toolConfig.validate && !toolConfig.validate(updatedData)) {
                setError("Invalid data provided");
                return;
              }

              this.data = updatedData;
              setCurrentData(updatedData);
              setError(null);
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "An error occurred"
              );
            }
          },
          [currentData]
        );

        if (error) {
          return React.createElement(
            "div",
            {
              style: {
                color: "red",
                padding: "10px",
                border: "1px solid red",
                borderRadius: "4px",
              },
            },
            `Error: ${error}`
          );
        }

        return React.createElement(Component, {
          data: currentData,
          onChange: handleChange,
        });
      };

      this.root.render(React.createElement(EnhancedWrapper));
      return this.wrapper;
    }

    updateData(newData: any) {
      this.data = { ...this.data, ...newData };
      if (this.updateTrigger) {
        this.updateTrigger(this.data);
      }
    }

    save() {
      return this.data;
    }

    destroy() {
      if (this.root) {
        this.updateTrigger = null;
        this.root.unmount();
      }
    }

    static get sanitize() {
      return toolConfig.sanitize || {};
    }

    static get isReadOnlySupported() {
      return true;
    }
  };
};

export default useReactEditorTool;
