import { Button } from "@/components/ui/button";
import { useEditorJS } from "@/hooks/useEditorJS";
import React from "react";
import SimpleImage, { SimpleImageParser } from "./plugins/SimpleImage";
import Header from "@editorjs/header";
import { BlockToolConstructable, OutputData } from "@editorjs/editorjs";
import ListTool from "./plugins/ListPlugin";

type Props = {};

function EditorJs({}: Props) {
  const [savedData, setSavedData] = React.useState<OutputData>();
  const { holderRef, save, clear } = useEditorJS({
    placeholder: "Edit here to write your story...",
    autofocus: true,
    readOnly: false,
    minHeight: 300,
    tools: {
      image: {
        class: SimpleImage,
        inlineToolbar: true,
      },
      header: {
        class: Header as unknown as BlockToolConstructable,
        inlineToolbar: true,
        config: {
          placeholder: "Enter a header",
        },
      },
      list: {
        class: ListTool as any,
        inlineToolbar: true,
      },
    },
  });
  return (
    <>
      <div
        className="editor-style w-full h-[300px] py-10 overflow-y-auto"
        ref={holderRef}
      />

      <div className="w-fit mx-auto py-5">
        <Button
          variant={"outline"}
          className="m-2"
          onClick={async () => {
            const savedData = await save();
            setSavedData(savedData);
            console.log("Saved data: ", savedData);
          }}
        >
          Save
        </Button>
        <Button className="m-2" onClick={clear}>
          Clear
        </Button>
      </div>

      <div className="max-w-[800px] mx-auto my-10 p-5 border">
        {savedData?.blocks.map((block, index) =>
          block.type === "image"
            ? SimpleImageParser.parse(block.data, block.id || index.toString())
            : ""
        )}
      </div>
    </>
  );
}

export default EditorJs;
