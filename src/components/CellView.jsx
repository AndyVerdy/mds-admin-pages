import { useState } from "react";
import { Text14, CellText } from "./ui/typography";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { ExternalLink } from "lucide-react";
import { useCopyToClipboard } from "./ui/copy-button";

const CellView = ({
  variant,
  image,
  title,
  url,
  onClick = () => {},
  href,
}) => {
  const { copied, copy } = useCopyToClipboard();
  const [tooltipOpen, setTooltipOpen] = useState(false);

  switch (variant) {
    case "imageTitleUrl":
      return (
        <div className="flex items-center !gap-3">
          <div
            onClick={() => {
              image ? onClick() : null;
            }}
          >
            {image ? (
              <img
                src={image}
                alt={title}
                className="rounded-md aspect-video !min-w-27 !max-w-27 !h-15 object-fill"
              />
            ) : (
              <div className="!h-15 !w-27 bg-gray-200 rounded-md"></div>
            )}
          </div>
          <div className="flex self-start flex-col">
            <CellText className="hover:underline cursor-pointer">
              {title || "Untitled"}
            </CellText>
            {url?.length > 40 ? (
              <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                <TooltipTrigger asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <Text14
                      className="!text-sm !text-start whitespace-pre-wrap break-words break-all cursor-pointer"
                    >
                      {`${url.slice(0, 40)}...`}
                    </Text14>
                  </a>
                </TooltipTrigger>
                <TooltipContent className="!max-w-md !w-full text-center !text-sm !text-pretty">
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <Text14 className="!text-sm hover:underline text-white whitespace-pre-wrap break-words break-all cursor-pointer">
                      {url}
                    </Text14>
                  </a>
                </TooltipContent>
              </Tooltip>
            ) : (
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Text14
                  className="text-sm !text-start !text-pretty hover:underline whitespace-pre-wrap break-words break-all"
                >
                  {url !== "null" && url ? url : ""}
                </Text14>
              </a>
            )}
          </div>
        </div>
      );

    case "imageTitleUrlV2":
      return (
        <span className="flex items-center !gap-3 !min-w-60 !w-full">
          <div
            className="relative group !min-w-27 !max-w-27 !h-15"
            onClick={() => {
              image ? onClick() : null;
            }}
          >
            {image ? (
              <>
                <img
                  src={image}
                  alt={title}
                  className="rounded-md aspect-video w-full h-full object-fill"
                />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute !inset-0 !bg-black !rounded-md flex items-center !justify-center !opacity-0 group-hover:!opacity-80 !transition-opacity hover:cursor-pointer"
                >
                  <ExternalLink size={16} className="text-white" />
                </a>
              </>
            ) : (
              <>
                <div className="!h-15 !w-27 bg-gray-200 rounded-md"></div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute !inset-0 !bg-black !rounded-md flex items-center !justify-center !opacity-0 group-hover:!opacity-80 !transition-opacity hover:cursor-pointer"
                >
                  <ExternalLink size={16} className="text-white" />
                </a>
              </>
            )}
          </div>
          <div className="flex self-start flex-col">
            <CellText
              href={href}
              className="hover:cursor-pointer whitespace-pre-wrap break-words break-all hover:!underline line-clamp-1"
            >
              {title || "Untitled"}
            </CellText>
            <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
              <TooltipTrigger asChild>
                <div
                  className="text-sm !text-start !text-pretty whitespace-pre-wrap break-words break-all tracking-normal text-muted-foreground font-sans hover:cursor-pointer line-clamp-2"
                  onClick={(e) => {
                    e.preventDefault();
                    copy(url).then((ok) => {
                      if (ok) {
                        setTooltipOpen(true);
                        setTimeout(() => setTooltipOpen(false), 1500);
                      }
                    });
                  }}
                >
                  {url !== "null" && url ? url : ""}
                </div>
              </TooltipTrigger>
              <TooltipContent
                arrow={false}
                className="!max-w-md !w-full text-center !text-sm !text-pretty"
              >
                <Text14 className="!text-sm hover:cursor-pointer text-white whitespace-pre-wrap break-words break-all cursor-pointer">
                  {copied ? "Copied!" : "Copy to clipboard"}
                </Text14>
              </TooltipContent>
            </Tooltip>
          </div>
        </span>
      );

    case "imageTitle":
      return (
        <div className="flex items-center gap-3">
          {image ? (
            <img
              src={image}
              alt={title}
              className="rounded-md aspect-video !min-w-27 !max-w-27 !h-15 object-fill"
            />
          ) : (
            <div className="!h-15 !w-27 bg-gray-200 rounded-md"></div>
          )}
          <CellText className="hover:underline cursor-pointer">
            {title || "Untitled"}
          </CellText>
        </div>
      );

    default:
      return <div>Unknown variant</div>;
  }
};

export default CellView;
