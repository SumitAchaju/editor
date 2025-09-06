import React from "react";

type Props = {
  children: React.ReactNode;
};

function layout({ children }: Props) {
  return <div className="bg-gray-200 w-full">{children}</div>;
}

export default layout;
