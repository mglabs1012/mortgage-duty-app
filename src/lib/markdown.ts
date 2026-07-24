export type MarkdownSection = { title: string; content: string };

/**
 * Splits a markdown document into one chunk per top-level ("## ") heading,
 * so each section of a long article can be rendered as its own card. H3+
 * subheadings stay nested inside their parent section's content.
 */
export function splitMarkdownSections(markdown: string): MarkdownSection[] {
  const lines = markdown.split("\n");
  const sections: MarkdownSection[] = [];
  let title: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (title !== null) {
      sections.push({ title, content: buffer.join("\n").trim() });
    }
    buffer = [];
  };

  for (const line of lines) {
    const match = /^##\s+(.*)$/.exec(line);
    if (match) {
      flush();
      title = match[1].trim();
    } else {
      buffer.push(line);
    }
  }
  flush();

  return sections;
}
