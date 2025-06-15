import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import Underline from "@tiptap/extension-underline";
import clsx from "clsx";
import MenuBar from "./MenuBar";
import { twMerge } from "tailwind-merge";

// const Button = tw.button`bg-secondary p-2 border border-border/60`

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  active?: boolean;
  icon: React.ReactElement;
}

const Button: React.FC<ButtonProps> = ({
  className,
  active = false,
  onClick,
  disabled,
  icon,
  ...props
}) => {
  return (
    <button
      className={twMerge(
        "bg-foreground hover:bg-body p-2",
        className,
        active && "bg-body",
        disabled && "bg-foreground hover:bg-foreground hover:cursor-default"
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) onClick(e);
      }}
      {...props}
    >
      {icon}
    </button>
  );
};

interface TipTapProps {
  editable?: boolean;
  commitState?: (state: string) => any;
  initialValue?: string;
}
const Tiptap: React.FC<
  TipTapProps & Pick<React.ComponentPropsWithoutRef<"div">, "className">
> = ({ editable = true, className, commitState, initialValue }) => {
  const editor = useEditor({
    editable,
    extensions: [
      StarterKit.configure({
        heading: { HTMLAttributes: { class: "text-3xl font-bold mb-4" } },
        paragraph: {
          HTMLAttributes: { class: "text-xl mb-4 leading-relaxed" },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-400 hover:underline underline" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
    ],
    content: `${initialValue ?? ""}`,
    editorProps: {
      attributes: {
        class: clsx(
          editable && "min-h-[500px] text-xl leading-relaxed",
          "outline-none p-4"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (commitState) commitState(html);
    },
  });

  return (
    <div className={className}>
      {editable && (
        <MenuBar
          editor={editor}
          className={
            "flex flex-wrap gap-2 rounded-t-lg border-x-2 border-t-2 border-gray-300 bg-gray-100 p-4"
          }
        />
      )}
      <EditorContent
        editor={editor}
        className={clsx(
          editable
            ? "min-h-[500px] overflow-auto border-2 border-gray-300 bg-white p-4 text-xl leading-relaxed focus-within:border-blue-500"
            : "text-xl leading-relaxed"
        )}
      />
      {editable && (
        <div className="rounded-b-lg border-x-2 border-b-2 border-gray-300 bg-gray-100 p-3">
          <p className="text-lg font-medium text-gray-600">
            💡 Tip: Use the buttons above to make text <strong>bold</strong>,{" "}
            <em>italic</em>, or change alignment
          </p>
        </div>
      )}
    </div>
  );
};

export default Tiptap;
