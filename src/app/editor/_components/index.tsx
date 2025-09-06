"use client";
import dynamic from "next/dynamic";
import React from "react";

const Editor = dynamic(() => import("./EditorJs"), { ssr: false });

type Props = {};

function EditorPage({}: Props) {
  return (
    <div>
      <Editor />
    </div>
  );
}

export default EditorPage;
