import useReactEditorTool from "@/hooks/useReactEditorTool";
import { useEffect, useRef } from "react";

interface HeadingToolData {
  text: string;
  level: number;
}

function Heading({
  data,
  onChange,
}: {
  data: HeadingToolData;
  onChange: (data: Partial<HeadingToolData>) => void;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== data.text) {
      ref.current.innerText = data.text;
    }
  }, [data.text]);

  const getHeadingClass = (level: number) => {
    const classes = {
      1: "text-3xl font-bold my-4",
      2: "text-2xl font-semibold my-3",
      3: "text-xl font-medium my-3",
      4: "text-lg font-medium my-2",
      5: "text-base font-medium my-2",
      6: "text-sm font-medium my-2",
    };
    return classes[level as keyof typeof classes] || classes[1];
  };

  const level = Math.min(Math.max(data.level, 1), 6);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== data.text) {
      ref.current.innerText = data.text;
    }
  }, [data]);

  const headingProps = {
    ref,
    className: `${getHeadingClass(data.level)} outline-none h-full`,
    contentEditable: true,
    suppressContentEditableWarning: true,
    onInput: (e: React.FormEvent) =>
      onChange({ text: (e.target as HTMLElement).innerText }),
  };

  switch (level) {
    case 1:
      return <h1 {...headingProps} />;
    case 2:
      return <h2 {...headingProps} />;
    case 3:
      return <h3 {...headingProps} />;
    case 4:
      return <h4 {...headingProps} />;
    case 5:
      return <h5 {...headingProps} />;
    case 6:
      return <h6 {...headingProps} />;
    default:
      return <h1 {...headingProps} />;
  }
}

const HeadingTool = useReactEditorTool(Heading, {
  toolbox: {
    title: "Heading",
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 12V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>',
  },
  validate: (data: HeadingToolData) =>
    typeof data.text === "string" &&
    data.text.trim().length > 0 &&
    typeof data.level === "number" &&
    data.level >= 1 &&
    data.level <= 6,
  defaultData: { text: "", level: 1 },
});

class HeadingToolWithSettings extends HeadingTool {
  renderSettings() {
    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col h-full";

    // Create buttons for each heading level
    for (let level = 1; level <= 6; level++) {
      const button = document.createElement("button");
      button.innerText = `Heading ${level}`;
      button.className = `px-2 py-3 text-sm rounded w-full ${
        this.data.level === level
          ? "bg-blue-500 text-white border-blue-500"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`;
      button.onclick = () => {
        this.updateData({ level });
        console.log(this.data, " level set to ", level);
        // Update button styles after level change
        setTimeout(() => {
          const buttons = wrapper.querySelectorAll("button");
          buttons.forEach((btn, index) => {
            const btnLevel = index + 1;
            btn.className = `px-2 py-3 text-sm rounded ${
              this.data.level === btnLevel
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`;
          });
        }, 0);
      };
      wrapper.appendChild(button);
    }

    return wrapper;
  }
}

export default HeadingTool;
export { HeadingToolWithSettings };
export type { HeadingToolData };
