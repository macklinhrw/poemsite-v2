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

const iconClassName = "h-5 w-5";

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
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          icon={editorIcons.bold}
        />
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          icon={editorIcons.italic}
        />
        <Button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          icon={editorIcons.underline}
        />
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          icon={editorIcons.H1}
        />
        <Button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          icon={editorIcons.alignLeft}
          active={editor.isActive({ textAlign: "left" })}
        />
        <Button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          icon={editorIcons.alignCenter}
          active={editor.isActive({ textAlign: "center" })}
        />
        <Button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          icon={editorIcons.alignRight}
          active={editor.isActive({ textAlign: "right" })}
        />
        <Button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          icon={editorIcons.alignJustify}
          active={editor.isActive({ textAlign: "justify" })}
        />
        <Button
          onClick={() => {
            editor.chain().focus().run();
            setAddLinkOpen(true);
          }}
          icon={editorIcons.link}
        />
        <Button
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
          icon={editorIcons.linkBreak}
        />
        <Button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          icon={editorIcons.undo}
        />
        <Button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          icon={editorIcons.redo}
        />
      </div>
    </>
  );
};

export default MenuBar;
