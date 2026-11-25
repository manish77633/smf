"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
export default function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "rich px-3 py-2 min-h-28 focus:outline-none",
        "aria-label": "Rich text content",
      },
    },
  });
  return (
    <div className="rounded-md border border-rule bg-white">
      <div className="flex flex-wrap gap-2 border-b border-rule p-2 text-xs">
        {[
          ["Bold", () => editor?.chain().focus().toggleBold().run()],
          ["Italic", () => editor?.chain().focus().toggleItalic().run()],
          ["Bullets", () => editor?.chain().focus().toggleBulletList().run()],
          [
            "Numbered list",
            () => editor?.chain().focus().toggleOrderedList().run(),
          ],
          ["Undo", () => editor?.chain().focus().undo().run()],
        ].map(([label, run]) => (
          <button
            key={String(label)}
            type="button"
            onClick={() => {
              if (typeof run === "function") run();
            }}
            className="rounded bg-tint px-2 py-1 font-bold"
          >
            {String(label)}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
