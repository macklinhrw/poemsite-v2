/* eslint-disable react-hooks/rules-of-hooks */
import { offset, shift, flip, autoUpdate, arrow } from "@floating-ui/react-dom";
import {
  useInteractions,
  useClick,
  useRole,
  useDismiss,
  FloatingPortal,
  FloatingFocusManager,
  useFloating,
} from "@floating-ui/react-dom-interactions";
import { Editor } from "@tiptap/react";
import clsx from "clsx";
import { useRef, useCallback, useState, useEffect } from "react";

interface MenuBarAddLinkModalProps
  extends React.ComponentPropsWithoutRef<"div"> {
  editor: Editor | null;
  open: boolean;
  setOpen: (open: boolean) => any;
}

const MenuBarAddLinkModal: React.FC<MenuBarAddLinkModalProps> = ({
  editor,
  open,
  setOpen,
}) => {
  if (!editor) return null;

  const linkAddRef = useRef(null);
  const arrowRef = useRef(null);

  const {
    x,
    y,
    reference,
    floating,
    strategy,
    context,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
    placement,
  } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "top",
    middleware: [shift(), arrow({ element: arrowRef })],
    whileElementsMounted: autoUpdate,
  });

  const { getFloatingProps } = useInteractions([
    useClick(context),
    useRole(context),
    useDismiss(context),
  ]);

  useEffect(() => {
    const pos = editor.state.selection.$anchor.pos;
    const coords = editor.view.coordsAtPos(pos);

    reference({
      getBoundingClientRect() {
        return {
          width: 0,
          height: 0,
          x: coords.left,
          y: coords.top,
          left: coords.left,
          right: coords.left,
          top: coords.top,
          bottom: coords.top,
        };
      },
    });
  }, [reference, open]);

  const addLink = useCallback(
    (url: string, text: string | null) => {
      const previousUrl = editor.getAttributes("link").href;
      const selection = editor.state.selection;
      const noSelection = selection.$head.pos === selection.$anchor.pos;
      if (previousUrl) {
        // remove link from previous
        if (url === "") {
          editor.chain().focus().unsetMark("link").run();
          return;
        }
        // update link
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .deleteSelection()
          .insertContent({
            type: "text",
            marks: [{ type: "link", attrs: { href: url, target: "_blank" } }],
            text: text ?? url,
          })
          //.setLink({href: url})
          .selectNodeForward()
          .unsetMark("link")
          .run();
      } else if (noSelection) {
        // update link
        editor
          .chain()
          .focus()
          .insertContent({
            type: "text",
            marks: [{ type: "link", attrs: { href: url, target: "_blank" } }],
            text: text ?? url,
          })
          .unsetMark("link")
          .run();
      } else {
        // remove link mark
        if (url === "") {
          editor.chain().focus().unsetLink().run();
          return;
        }

        // update link
        editor
          .chain()
          .focus()
          .setLink({ href: url })
          .setTextSelection(editor.state.selection.$anchor.pos)
          .unsetMark("link")
          .run();
      }
    },
    [editor]
  );

  // clear linkValue on open/close, set state of form
  useEffect(() => {
    if (open) {
      const previousUrl = editor.getAttributes("link").href;
      if (!previousUrl) return;
      const pos = editor.state.selection.$anchor.pos;
      const previousNode = editor.state.doc.nodeAt(pos - 1);
      if (previousNode?.type.name !== "text") return;
      const previousText = previousNode.text;
      setLinkValue(previousUrl ?? "");
      setLinkText(previousText ?? "");
      if (previousText !== previousUrl) setUseText(true);
    } else {
      setLinkValue("");
      setLinkText("");
      setUseText(false);
    }
  }, [open]);

  const [linkValue, setLinkValue] = useState("");
  const [linkText, setLinkText] = useState("");
  const [useText, setUseText] = useState(false);

  return (
    <FloatingPortal>
      {open && (
        <FloatingFocusManager
          context={context}
          initialFocus={linkAddRef}
          returnFocus={false}
        >
          <div
            ref={floating}
            className={clsx(
              "border-border/50 absolute z-20 rounded-lg border bg-slate-900 p-2"
            )}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
            }}
            {...getFloatingProps()}
          >
            <div className="my-auto mx-auto flex flex-col space-y-2 align-middle">
              <div className="space-x-2">
                <span>URL:</span>
                <input
                  className="rounded p-1 outline-none"
                  ref={linkAddRef}
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                />
              </div>
              <div className="space-x-2">
                <span>Text:</span>
                <input
                  className="rounded p-1 outline-none"
                  value={useText ? linkText : linkValue}
                  disabled={!useText}
                  onChange={(e) =>
                    useText
                      ? setLinkText(e.target.value)
                      : setLinkValue(e.target.value)
                  }
                />
              </div>
              <div className="flex flex-row items-center space-x-2 align-middle">
                <div className="flex space-x-2">
                  <span>useText?</span>
                  <input
                    type="checkbox"
                    checked={useText}
                    onChange={(e) => setUseText(e.target.checked)}
                  />
                </div>
                <div className="ml-auto w-full">
                  <button
                    className="border-border/50 w-full rounded-lg border py-1 hover:bg-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpen(false);
                      addLink(linkValue, useText ? linkText : null);
                      editor.chain().focus().run();
                    }}
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>
            {/* TODO: make change based on flip, move due to border of screen */}
            <div
              style={{ top: arrowY, left: arrowX }}
              ref={arrowRef}
              className="absolute -z-10 h-[12px] w-[12px] rotate-45 bg-slate-900"
            />
          </div>
        </FloatingFocusManager>
      )}
    </FloatingPortal>
  );
};

export default MenuBarAddLinkModal;
