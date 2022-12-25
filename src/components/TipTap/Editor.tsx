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
        heading: { HTMLAttributes: { class: "text-xl" } },
        paragraph: { HTMLAttributes: { class: "mb-2" } },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-400 hover:underline" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
    ],
    content: `${initialValue ?? ""}`,
    editorProps: {
      attributes: {
        class: clsx(editable && "h-[400px]", "outline-none"),
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
            "space-x-2 rounded-t border-x border-t border-white bg-gray-800 p-2"
          }
        />
      )}
      <EditorContent
        editor={editor}
        className={clsx(
          editable ? "overflow-auto border border-white bg-gray-800 p-1" : ""
        )}
      />
      {/*
      <div className="mt-4 overflow-auto bg-primary p-2">
        <pre>{JSON.stringify(editor?.getJSON(), null, '\t')}</pre>
        </div> */}
    </div>
  );
};

export default Tiptap;
