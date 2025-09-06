import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReactEditorTool } from "@/hooks/useReactEditorTool";

export interface SimpleImageData {
  url?: string;
  caption?: string;
  withBorder?: boolean;
  stretched?: boolean;
  withBackground?: boolean;
}

export const imageData: SimpleImageData = {
  url: "sdfsdf",
  caption: "sdfsdf",
  withBorder: true,
  stretched: true,
  withBackground: true,
};

function ImageComponent({
  data,
  onChange,
}: {
  data: SimpleImageData;
  onChange: (data: SimpleImageData) => void;
}) {
  const {
    url = "",
    caption = "",
    withBorder = false,
    stretched = false,
    withBackground = false,
  } = data || {};

  return (
    <div className="flex flex-col gap-2 my-5">
      <div className="grid gap-2 md:grid-cols-2 grid-cols-1">
        <Label className="flex flex-col items-start text-sm">
          Image URL
          <Input
            type="text"
            value={url}
            onChange={(e) => onChange({ ...data, url: e.target.value })}
            placeholder="Enter image URL"
            autoFocus
            className="w-full bg-white focus-visible:ring-2 focus-visible:ring-green-300"
          />
        </Label>
        <Label className="flex flex-col text-sm items-start">
          Caption
          <Input
            type="text"
            value={caption}
            onChange={(e) => onChange({ ...data, caption: e.target.value })}
            placeholder="Enter image caption"
            className="w-full bg-white focus-visible:ring-2 focus-visible:ring-green-300"
          />
        </Label>
      </div>
      <Label className="flex gap-2 items-center">
        <Input
          type="checkbox"
          checked={withBorder}
          onChange={(e) => onChange({ withBorder: e.target.checked })}
          className="w-6 h-6"
        />
        With Border
      </Label>
      <Label className="flex gap-2 items-center">
        <Input
          type="checkbox"
          checked={stretched}
          onChange={(e) => onChange({ stretched: e.target.checked })}
          className="w-6 h-6"
        />
        Stretched
      </Label>
      <Label className="flex gap-2 items-center">
        <Input
          type="checkbox"
          checked={withBackground}
          onChange={(e) => onChange({ withBackground: e.target.checked })}
          className="w-6 h-6"
        />
        With Background
      </Label>
    </div>
  );
}

const SimpleImage = useReactEditorTool(ImageComponent, {
  name: "SimpleImage",
  inlineToolbar: true,
  toolbox: {
    title: "Image",
    icon: '<svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 1.5H15.5V13.5H1.5V1.5Z" stroke="#4C4C4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.83301 10.5L6.49967 7.83333L9.16634 10.5L13.1663 6.5L15.4997 8.83333" stroke="#4C4C4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  sanitize: {
    url: true,
    caption: true,
    withBorder: false,
    stretched: false,
    withBackground: false,
  },
});

function ImageParsedComponent({ data }: { data: SimpleImageData }) {
  return (
    <div>
      <img
        src={data.url}
        alt={data.caption}
        className={`${
          data.withBorder
            ? "border-4 border-red-400 rounded-xl overflow-hidden"
            : ""
        } ${data.stretched ? "w-full" : ""} ${
          data.withBackground ? "bg-green-400 p-20" : ""
        }`}
      />
      {data.caption && (
        <p className="text-sm text-gray-500 mt-2">{data.caption}</p>
      )}
    </div>
  );
}

class SimpleImageParser {
  static parse(data: SimpleImageData, key: string) {
    return <ImageParsedComponent key={key} data={data} />;
  }
}

export default SimpleImage;
export { SimpleImageParser };
