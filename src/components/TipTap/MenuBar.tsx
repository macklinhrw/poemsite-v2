/* eslint-disable react-hooks/rules-of-hooks */
import {
  Link as LinkIcon,
  LinkBreak,
  TextAlignJustify,
  TextBolder,
  TextHOne,
  TextItalic,
  TextUnderline,
  ArrowCounterClockwise,
  ArrowClockwise,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
} from "phosphor-react";
import { Editor } from "@tiptap/react";
import Button from "./MenuBarButton";
import { useState } from "react";
import MenuBarAddLinkModal from "./MenuBarAddLinkModal";

interface MenuBarProps extends React.ComponentPropsWithoutRef<"div"> {
  editor: Editor | null;
}

const iconClassName = "h-8 w-8";

const editorIcons = {
  bold: <TextBolder className={iconClassName} />,
  italic: <TextItalic className={iconClassName} />,
  underline: <TextUnderline className={iconClassName} />,
  H1: <TextHOne className={iconClassName} />,
  alignLeft: <TextAlignLeft className={iconClassName} />,
  alignCenter: <TextAlignCenter className={iconClassName} />,
  alignRight: <TextAlignRight className={iconClassName} />,
  alignJustify: <TextAlignJustify className={iconClassName} />,
  link: <LinkIcon className={iconClassName} />,
  linkBreak: <LinkBreak className={iconClassName} />,
  undo: <ArrowCounterClockwise className={iconClassName} />,
  redo: <ArrowClockwise className={iconClassName} />,
};

const MenuBar: React.FC<MenuBarProps> = ({ editor, className }) => {
  if (!editor) {
    return null;
  }

  const [addLinkOpen, setAddLinkOpen] = useState(false);

  return (
    <>
      {/* Virtual Elements */}
      <MenuBarAddLinkModal
        editor={editor}
        open={addLinkOpen}
        setOpen={setAddLinkOpen}
      />

      {/* Tool Bar */}
      <div className={className}>
        {/* Text Formatting */}
        <div className="flex items-center gap-2">
          <span className="mr-2 text-lg font-bold text-gray-800">
            Text Style:
          </span>
          <Button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            icon={editorIcons.bold}
            title="Make text bold"
          />
          <Button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            icon={editorIcons.italic}
            title="Make text italic"
          />
          <Button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            icon={editorIcons.underline}
            title="Underline text"
          />
          <Button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive("heading", { level: 1 })}
            icon={editorIcons.H1}
            title="Make text bigger (heading)"
          />
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-2">
          <span className="mr-2 text-lg font-bold text-gray-800">
            Alignment:
          </span>
          <Button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            icon={editorIcons.alignLeft}
            active={editor.isActive({ textAlign: "left" })}
            title="Align text to the left"
          />
          <Button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            icon={editorIcons.alignCenter}
            active={editor.isActive({ textAlign: "center" })}
            title="Center text"
          />
          <Button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            icon={editorIcons.alignRight}
            active={editor.isActive({ textAlign: "right" })}
            title="Align text to the right"
          />
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-2">
          <span className="mr-2 text-lg font-bold text-gray-800">Undo:</span>
          <Button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            icon={editorIcons.undo}
            title="Undo last change"
          />
          <Button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            icon={editorIcons.redo}
            title="Redo last change"
          />
        </div>
      </div>
    </>
  );
};

export default MenuBar;
