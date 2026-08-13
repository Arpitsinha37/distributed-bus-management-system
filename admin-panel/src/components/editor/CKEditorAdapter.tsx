"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  AccessibilityHelp,
  Alignment,
  AutoImage,
  AutoLink,
  Autoformat,
  Autosave,
  BalloonToolbar,
  BlockQuote,
  Bold,
  Bookmark,
  ClassicEditor,
  Code,
  CodeBlock,
  Emoji,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Fullscreen,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlEmbed,
  Image,
  ImageCaption,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Mention,
  PageBreak,
  Paragraph,
  PasteFromOffice,
  PictureEditing,
  RemoveFormat,
  SelectAll,
  ShowBlocks,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Style,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableLayout,
  TableProperties,
  TableToolbar,
  TextPartLanguage,
  TextTransformation,
  TodoList,
  Underline,
  WordCount,
  Plugin,
  ButtonView,
  type EditorConfig,
  type Editor,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { useMemo, useRef } from "react";

// ──────────────────────────────────────────────────────
// Custom Plugin: Media Library button + Ctrl+Shift+M
// ──────────────────────────────────────────────────────
class MediaLibraryPlugin extends Plugin {
  static get pluginName() {
    return "MediaLibraryPlugin" as const;
  }

  init() {
    const editor = this.editor;

    // Register the toolbar button
    editor.ui.componentFactory.add("mediaLibrary", (locale) => {
      const button = new ButtonView(locale);

      button.set({
        label: "Media Library (Ctrl+Shift+M)",
        tooltip: true,
        withText: false,
        icon: `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6.91 10.54c.26-.23.64-.21.88.03l3.36 3.14 2.23-2.06a.64.64 0 0 1 .87 0l2.52 2.97V4.5H3.2v10.12l3.71-4.08zm10.27-7.51c.6 0 1.09.47 1.09 1.05v11.84c0 .59-.49 1.06-1.09 1.06H2.79c-.6 0-1.09-.47-1.09-1.06V4.08c0-.58.49-1.05 1.1-1.05h14.38zm-5.22 5.56a1.96 1.96 0 1 1 0-3.92 1.96 1.96 0 0 1 0 3.92z"/></svg>`,
        class: "ck-media-library-button",
      });

      button.on("execute", () => {
        // Fire custom event that the parent component listens to
        editor.fire("mediaLibrary:open");
      });

      return button;
    });

    // Register Ctrl+Shift+M keyboard shortcut
    editor.keystrokes.set("Ctrl+Shift+M", (keyEvtData: any, cancel: () => void) => {
      cancel();
      editor.fire("mediaLibrary:open");
    });
  }
}

interface CKEditorAdapterProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onReady?: (editor: Editor) => void;
  onMediaLibraryOpen?: () => void;
}

export function CKEditorAdapter({ value, onChange, placeholder, onReady, onMediaLibraryOpen }: CKEditorAdapterProps) {
  // We use a ref to prevent onChange triggering a re-render cycle loop if the value hasn't actually changed.
  const isInternalChangeRef = useRef(false);

  const editorConfig = useMemo<EditorConfig>(
    () => ({
      licenseKey: process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY || "GPL",
      plugins: [
        AccessibilityHelp,
        Alignment,
        Autoformat,
        AutoImage,
        AutoLink,
        Autosave,
        BalloonToolbar,
        BlockQuote,
        Bold,
        Bookmark,
        Code,
        CodeBlock,
        Emoji,
        Essentials,
        FindAndReplace,
        FontBackgroundColor,
        FontColor,
        FontFamily,
        FontSize,
        Fullscreen,
        GeneralHtmlSupport,
        Heading,
        Highlight,
        HorizontalLine,
        HtmlEmbed,
        Image,
        ImageCaption,
        ImageInsert,
        ImageInsertViaUrl,
        ImageResize,
        ImageStyle,
        ImageTextAlternative,
        ImageToolbar,
        Indent,
        IndentBlock,
        Italic,
        Link,
        LinkImage,
        List,
        ListProperties,
        MediaEmbed,
        Mention,
        PageBreak,
        Paragraph,
        PasteFromOffice,
        PictureEditing,
        RemoveFormat,
        SelectAll,
        ShowBlocks,
        SourceEditing,
        SpecialCharacters,
        SpecialCharactersArrows,
        SpecialCharactersCurrency,
        SpecialCharactersEssentials,
        SpecialCharactersLatin,
        SpecialCharactersMathematical,
        SpecialCharactersText,
        Strikethrough,
        Style,
        Subscript,
        Superscript,
        Table,
        TableCaption,
        TableCellProperties,
        TableColumnResize,
        TableLayout,
        TableProperties,
        TableToolbar,
        TextPartLanguage,
        TextTransformation,
        TodoList,
        Underline,
        WordCount,
        MediaLibraryPlugin,
      ],
      toolbar: {
        items: [
          "undo",
          "redo",
          "|",
          "findAndReplace",
          "selectAll",
          "sourceEditing",
          "showBlocks",
          "fullscreen",
          "|",
          "heading",
          "style",
          "|",
          "fontFamily",
          "fontSize",
          "fontColor",
          "fontBackgroundColor",
          "highlight",
          "|",
          "bold",
          "italic",
          "underline",
          "strikethrough",
          "subscript",
          "superscript",
          "code",
          "removeFormat",
          "|",
          "alignment",
          "bulletedList",
          "numberedList",
          "todoList",
          "outdent",
          "indent",
          "|",
          "link",
          "bookmark",
          "mediaLibrary",
          "insertImageViaUrl",
          "mediaEmbed",
          "insertTable",
          "|",
          "blockQuote",
          "codeBlock",
          "htmlEmbed",
          "horizontalLine",
          "pageBreak",
          "specialCharacters",
          "emoji",
          "textPartLanguage",
          "accessibilityHelp",
        ],
        shouldNotGroupWhenFull: true,
      },
      balloonToolbar: [
        "bold",
        "italic",
        "link",
        "|",
        "bulletedList",
        "numberedList",
        "|",
        "blockQuote",
      ],
      fontFamily: {
        supportAllValues: true,
        options: [
          "default",
          "Arial, Helvetica, sans-serif",
          "Calibri, Arial, sans-serif",
          "Georgia, serif",
          "Times New Roman, Times, serif",
          "Verdana, Geneva, sans-serif",
          "Courier New, Courier, monospace",
        ],
      },
      fontSize: {
        options: [10, 12, 14, "default", 18, 20, 24, 28, 36, 48],
        supportAllValues: true,
      },
      heading: {
        options: [
          { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
          { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
          { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
          { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
          { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
          { model: "heading5", view: "h5", title: "Heading 5", class: "ck-heading_heading5" },
          { model: "heading6", view: "h6", title: "Heading 6", class: "ck-heading_heading6" },
        ],
      },
      htmlEmbed: {
        showPreviews: true,
      },
      htmlSupport: {
        allow: [
          {
            name: /^.*$/,
            styles: true,
            attributes: true,
            classes: true,
          },
        ],
      },
      image: {
        insert: {
          integrations: ["url"],
        },
        resizeOptions: [
          { name: "resizeImage:original", value: null, label: "Original" },
          { name: "resizeImage:50", value: "50", label: "50%" },
          { name: "resizeImage:75", value: "75", label: "75%" },
        ],
        toolbar: [
          "toggleImageCaption",
          "imageTextAlternative",
          "|",
          "imageStyle:inline",
          "imageStyle:wrapText",
          "imageStyle:breakText",
          "|",
          "resizeImage",
          "|",
          "linkImage",
        ],
      },
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: "https://",
        decorators: {
          toggleDownloadable: {
            mode: "manual",
            label: "Downloadable",
            attributes: {
              download: "file",
            },
          },
        },
      },
      list: {
        properties: {
          styles: true,
          startIndex: true,
          reversed: true,
        },
      },
      mention: {
        feeds: [
          {
            marker: "@",
            feed: ["@admin", "@editor", "@author", "@reviewer"],
            minimumCharacters: 1,
          },
        ],
      },
      menuBar: {
        isVisible: true,
      },
      placeholder: placeholder || "Write or paste content here...",
      style: {
        definitions: [
          {
            name: "Lead paragraph",
            element: "p",
            classes: ["lead"],
          },
          {
            name: "Info callout",
            element: "p",
            classes: ["callout", "callout-info"],
          },
          {
            name: "Warning callout",
            element: "p",
            classes: ["callout", "callout-warning"],
          },
          {
            name: "Muted text",
            element: "span",
            classes: ["text-muted"],
          },
          {
            name: "Badge",
            element: "span",
            classes: ["content-badge"],
          },
        ],
      },
      table: {
        contentToolbar: [
          "tableColumn",
          "tableRow",
          "mergeTableCells",
          "tableProperties",
          "tableCellProperties",
          "toggleTableCaption",
        ],
      },
      textPartLanguage: [
        { title: "English", languageCode: "en" },
        { title: "Nepali", languageCode: "ne" },
        { title: "Hindi", languageCode: "hi" },
      ],
    }),
    [placeholder]
  );

  return (
    <div className="ckeditor-adapter-wrapper">
      <CKEditor
        editor={ClassicEditor}
        config={editorConfig}
        data={value || ""}
        onReady={(editor) => {
          // Listen for the custom media library event
          if (onMediaLibraryOpen) {
            editor.on("mediaLibrary:open", () => {
              onMediaLibraryOpen();
            });
          }

          // Expose the editor instance to the parent
          if (onReady) {
            onReady(editor);
          }
        }}
        onChange={(event, editor) => {
          isInternalChangeRef.current = true;
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
}

/**
 * Insert an image into the CKEditor at the current cursor position.
 * Uses CKEditor's built-in insertImage command for proper model integration.
 */
export function insertMediaImage(editor: Editor, url: string, alt: string) {
  // Use CKEditor's built-in insertImage command if available
  if (editor.commands.get("insertImage")) {
    editor.execute("insertImage", { source: url });
    // Try to set alt text on the just-inserted image
    const selection = editor.model.document.selection;
    const selectedElement = selection.getSelectedElement();
    if (selectedElement && selectedElement.is("element", "imageBlock")) {
      editor.model.change((writer) => {
        writer.setAttribute("alt", alt, selectedElement);
      });
    }
  } else {
    // Fallback: insert via model directly
    editor.model.change((writer) => {
      const imageElement = writer.createElement("imageBlock", {
        src: url,
        alt: alt,
      });
      editor.model.insertContent(imageElement);
    });
  }

  // Focus back to editor
  editor.editing.view.focus();
}
