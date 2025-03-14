/*
* jupyter.ts
*
* Copyright (C) 2020 by RStudio, PBC
*
*/

// deno-lint-ignore-file camelcase

import { ensureDirSync } from "fs/ensure_dir.ts";
import { dirname, extname, join, relative } from "path/mod.ts";
import { walkSync } from "fs/walk.ts";
import { decode as base64decode } from "encoding/base64.ts";
import { stringify, StringifyOptions } from "encoding/yaml.ts";
import { partitionCellOptions } from "../partition-cell-options.ts";
import { ld } from "lodash/mod.ts";

import { shortUuid } from "../uuid.ts";

import {
  extensionForMimeImageType,
  kApplicationJavascript,
  kApplicationRtf,
  kImagePng,
  kImageSvg,
  kRestructuredText,
  kTextHtml,
  kTextLatex,
  kTextPlain,
} from "../mime.ts";

import PngImage from "../png.ts";

import {
  echoFenced,
  hideCell,
  hideCode,
  hideOutput,
  hideWarnings,
  includeCell,
  includeCode,
  includeOutput,
  includeWarnings,
} from "./tags.ts";
import {
  cellLabel,
  cellLabelValidator,
  resolveCaptions,
  shouldLabelCellContainer,
  shouldLabelOutputContainer,
} from "./labels.ts";
import {
  displayDataIsHtml,
  displayDataIsImage,
  displayDataIsJavascript,
  displayDataIsJson,
  displayDataIsLatex,
  displayDataIsMarkdown,
  displayDataIsTextPlain,
  displayDataMimeType,
  isCaptionableData,
  isDisplayData,
} from "./display-data.ts";
import {
  extractJupyterWidgetDependencies,
  JupyterWidgetDependencies,
} from "./widgets.ts";
import { removeAndPreserveHtml } from "./preserve.ts";
import { FormatExecute } from "../../config/types.ts";
import { pandocAsciify, pandocAutoIdentifier } from "../pandoc/pandoc-id.ts";
import { Metadata } from "../../config/types.ts";
import {
  kCellAutoscroll,
  kCellCapLoc,
  kCellClasses,
  kCellColab,
  kCellColabType,
  kCellColbOutputId,
  kCellCollapsed,
  kCellColumn,
  kCellDeletable,
  kCellFigAlign,
  kCellFigAlt,
  kCellFigCap,
  kCellFigCapLoc,
  kCellFigColumn,
  kCellFigEnv,
  kCellFigLink,
  kCellFigPos,
  kCellFigScap,
  kCellFigSubCap,
  kCellFormat,
  kCellId,
  kCellLabel,
  kCellLinesToNext,
  kCellLstCap,
  kCellLstLabel,
  kCellMdIndent,
  kCellName,
  kCellOutHeight,
  kCellOutWidth,
  kCellPanel,
  kCellRawMimeType,
  kCellSlideshow,
  kCellSlideshowSlideType,
  kCellTags,
  kCellTblCapLoc,
  kCellTblColumn,
  kCodeFold,
  kCodeLineNumbers,
  kCodeOverflow,
  kCodeSummary,
  kEcho,
  kError,
  kEval,
  kInclude,
  kLayout,
  kLayoutAlign,
  kLayoutNcol,
  kLayoutNrow,
  kLayoutVAlign,
  kOutput,
  kSlideLevel,
  kWarning,
} from "../../config/constants.ts";
import {
  isJupyterKernelspec,
  jupyterKernelspec,
  jupyterKernelspecs,
} from "./kernels.ts";
import { JupyterKernelspec } from "./types.ts";
import { figuresDir, inputFilesDir } from "../render.ts";
import { lines } from "../text.ts";
import { readYamlFromMarkdown, readYamlFromMarkdownFile } from "../yaml.ts";

export const kJupyterNotebookExtensions = [
  ".ipynb",
];
export function isJupyterNotebook(file: string) {
  return kJupyterNotebookExtensions.includes(extname(file).toLowerCase());
}

export interface JupyterNotebook {
  metadata: {
    kernelspec: JupyterKernelspec;
    widgets?: Record<string, unknown>;
    [key: string]: unknown;
  };
  cells: JupyterCell[];
  nbformat: number;
  nbformat_minor: number;
}

export interface JupyterCell {
  id?: string;
  cell_type: "markdown" | "code" | "raw";
  execution_count?: null | number;
  metadata: JupyterCellMetadata;
  source: string[];
  outputs?: JupyterOutput[];
}

export interface JupyterCellMetadata {
  // nbformat v4 spec
  [kCellCollapsed]?: boolean;
  [kCellAutoscroll]?: boolean | "auto";
  [kCellDeletable]?: boolean;
  [kCellFormat]?: string; // for "raw"
  [kCellName]?: string; // optional alias for 'label'
  [kCellTags]?: string[];
  [kCellRawMimeType]?: string;

  // used to preserve line spacing
  [kCellLinesToNext]?: number;

  // slideshow
  [kCellSlideshow]?: JupyterCellSlideshow;

  // anything else
  [key: string]: unknown;
}

export interface JupyterCellSlideshow {
  [kCellSlideshowSlideType]: string;
}

export interface JupyterCellWithOptions extends JupyterCell {
  options: JupyterCellOptions;
  optionsSource: string[];
}

export interface JupyterOutput {
  output_type: "stream" | "display_data" | "execute_result" | "error";
  execution_count?: null | number;
  isolated?: boolean;
}

export interface JupyterOutputStream extends JupyterOutput {
  name: "stdout" | "stderr";
  text: string[];
}

export interface JupyterOutputDisplayData extends JupyterOutput {
  data: { [mimeType: string]: unknown };
  metadata: { [mimeType: string]: Record<string, unknown> };
  noCaption?: boolean;
}

export interface JupyterCellOptions extends JupyterOutputFigureOptions {
  [kCellLabel]?: string;
  [kCellFigCap]?: string | string[];
  [kCellFigSubCap]?: string[];
  [kCellFigCapLoc]?: string;
  [kCellTblCapLoc]?: string;
  [kCellCapLoc]?: string;
  [kCellFigColumn]?: string;
  [kCellTblColumn]?: string;
  [kCellLstLabel]?: string;
  [kCellLstCap]?: string;
  [kCellClasses]?: string;
  [kCellPanel]?: string;
  [kCellColumn]?: string;
  [kCodeFold]?: string;
  [kCodeLineNumbers]?: boolean | string;
  [kCodeSummary]?: string;
  [kCodeOverflow]?: string;
  [kCellMdIndent]?: string;
  [kEval]?: true | false | null;
  [kEcho]?: boolean | "fenced";
  [kWarning]?: boolean;
  [kError]?: boolean;
  [kOutput]?: boolean | "all" | "asis";
  [kInclude]?: boolean;
  [key: string]: unknown;
}

export interface JupyterOutputFigureOptions {
  [kCellFigScap]?: string;
  [kCellFigLink]?: string;
  [kCellFigAlign]?: string;
  [kCellFigEnv]?: string;
  [kCellFigPos]?: string;
  [kCellFigAlt]?: string;
}

// option keys we handle internally so should not forward into generated markdown
export const kJupyterCellInternalOptionKeys = [
  kEval,
  kEcho,
  kWarning,
  kOutput,
  kInclude,
  kCellLabel,
  kCellClasses,
  kCellPanel,
  kCellColumn,
  kCellFigCap,
  kCellFigSubCap,
  kCellFigScap,
  kCellFigCapLoc,
  kCellTblCapLoc,
  kCellCapLoc,
  kCellFigColumn,
  kCellTblColumn,
  kCellFigLink,
  kCellFigAlign,
  kCellFigAlt,
  kCellFigEnv,
  kCellFigPos,
  kCellLstLabel,
  kCellLstCap,
  kCellOutWidth,
  kCellOutHeight,
  kCellMdIndent,
  kCodeFold,
  kCodeLineNumbers,
  kCodeSummary,
  kCodeOverflow,
];

export const kJupyterCellOptionKeys = kJupyterCellInternalOptionKeys.concat([
  kLayoutAlign,
  kLayoutVAlign,
  kLayoutNcol,
  kLayoutNrow,
  kLayout,
]);

export const kJupyterCellStandardMetadataKeys = [
  kCellCollapsed,
  kCellAutoscroll,
  kCellDeletable,
  kCellFormat,
  kCellName,
];

export const kJupyterCellThirdPartyMetadataKeys = [
  // colab
  kCellId,
  kCellColab,
  kCellColabType,
  kCellColbOutputId,

  // jupytext
  kCellLinesToNext,
];

export interface JupyterOutputExecuteResult extends JupyterOutputDisplayData {
  execution_count: number;
}

export interface JupyterOutputError extends JupyterOutput {
  ename: string;
  evalue: string;
  traceback: string[];
}

export async function quartoMdToJupyter(
  input: string,
  includeIds: boolean,
): Promise<JupyterNotebook> {
  const [kernelspec, metadata] = await jupyterKernelspecFromFile(input);

  // notebook to return
  const nb: JupyterNotebook = {
    cells: [],
    metadata: {
      kernelspec,
      ...metadata,
    },
    nbformat: 4,
    nbformat_minor: includeIds ? 5 : 4,
  };

  // regexes
  const yamlRegEx = /^---\s*$/;
  /^\s*```+\s*\{([a-zA-Z0-9_]+)( *[ ,].*)?\}\s*$/;
  const startCodeCellRegEx = new RegExp(
    "^(\\s*)```+\\s*\\{" + kernelspec.language.toLowerCase() +
      "( *[ ,].*)?\\}\\s*$",
  );
  const startCodeRegEx = /^(\s*)```/;
  const endCodeRegEx = (indent = "") => {
    return new RegExp("^" + indent + "```\\s*$");
  };

  // read the file into lines
  const inputContent = Deno.readTextFileSync(input);

  // line buffer & code indent
  let codeIndent = "";
  const lineBuffer: string[] = [];
  const flushLineBuffer = (
    cell_type: "markdown" | "code" | "raw",
    frontMatter?: boolean,
  ) => {
    if (lineBuffer.length) {
      if (lineBuffer[0] === "") {
        lineBuffer.splice(0, 1);
      }
      if (lineBuffer[lineBuffer.length - 1] === "") {
        lineBuffer.splice(lineBuffer.length - 1, 1);
      }
      const cell: JupyterCell = {
        cell_type,
        metadata: codeIndent.length > 0 ? { [kCellMdIndent]: codeIndent } : {},
        source: lineBuffer.map((line, index) => {
          if (codeIndent.length > 0) {
            line = line.replace(codeIndent, "");
          }
          return line + (index < (lineBuffer.length - 1) ? "\n" : "");
        }),
      };
      if (includeIds) {
        cell.id = shortUuid();
      }
      if (cell_type === "raw" && frontMatter) {
        // delete 'jupyter' metadata since we've already transferred it
        const yaml = readYamlFromMarkdown(cell.source.join(""));
        if (yaml.jupyter) {
          delete yaml.jupyter;
          // write the cell only if there is metadata to write
          if (Object.keys(yaml).length > 0) {
            const yamlFrontMatter = mdTrimEmptyLines(lines(stringify(yaml, {
              indent: 2,
              sortKeys: false,
              skipInvalid: true,
            })));
            cell.source = [
              "---\n",
              ...(yamlFrontMatter.map((line) => line + "\n")),
              "---",
            ];
          } else {
            cell.source = [];
          }
        }
      } else if (cell_type === "code") {
        // see if there is embedded metadata we should forward into the cell metadata
        const { yaml, source } = partitionCellOptions(
          kernelspec.language.toLowerCase(),
          cell.source,
        );
        if (yaml) {
          // use label as id if necessary
          if (includeIds && yaml[kCellLabel] && !yaml[kCellId]) {
            yaml[kCellId] = jupyterAutoIdentifier(String(yaml[kCellLabel]));
          }

          const yamlKeys = Object.keys(yaml);
          yamlKeys.forEach((key) => {
            if (key === kCellId) {
              if (includeIds) {
                cell.id = String(yaml[key]);
              }
              delete yaml[key];
            } else {
              if (!kJupyterCellOptionKeys.includes(key)) {
                cell.metadata[key] = yaml[key];
                delete yaml[key];
              }
            }
          });

          // if we hit at least one we need to re-write the source
          if (Object.keys(yaml).length < yamlKeys.length) {
            const yamlOutput = jupyterCellOptionsAsComment(
              kernelspec.language.toLowerCase(),
              yaml,
            );
            cell.source = yamlOutput.concat(source);
          }
        }

        // reset outputs and execution_count
        cell.execution_count = null;
        cell.outputs = [];
      }

      // if the source is empty then don't add it
      cell.source = mdTrimEmptyLines(cell.source);
      if (cell.source.length > 0) {
        nb.cells.push(cell);
      }

      lineBuffer.splice(0, lineBuffer.length);
    }
  };

  // loop through lines and create cells based on state transitions
  let parsedFrontMatter = false,
    inYaml = false,
    inCodeCell = false,
    inCode = false;
  for (const line of lines(inputContent)) {
    // yaml front matter
    if (yamlRegEx.test(line) && !inCodeCell && !inCode) {
      if (inYaml) {
        lineBuffer.push(line);
        flushLineBuffer("raw", !parsedFrontMatter);
        parsedFrontMatter = true;
        inYaml = false;
      } else {
        flushLineBuffer("markdown");
        lineBuffer.push(line);
        inYaml = true;
      }
    } // begin code cell: ^```python
    else if (startCodeCellRegEx.test(line)) {
      flushLineBuffer("markdown");
      inCodeCell = true;
      codeIndent = line.match(startCodeCellRegEx)![1];

      // end code block: ^``` (tolerate trailing ws)
    } else if (endCodeRegEx(codeIndent).test(line)) {
      // in a code cell, flush it
      if (inCodeCell) {
        inCodeCell = false;
        flushLineBuffer("code");
        codeIndent = "";

        // otherwise this flips the state of in-code
      } else {
        inCode = !inCode;
        lineBuffer.push(line);
      }

      // begin code block: ^```
    } else if (startCodeRegEx.test(line)) {
      codeIndent = line.match(startCodeRegEx)![1];
      inCode = true;
      lineBuffer.push(line);
    } else {
      lineBuffer.push(line);
    }
  }

  // if there is still a line buffer then make it a markdown cell
  flushLineBuffer("markdown");

  return nb;
}

export async function jupyterKernelspecFromFile(
  file: string,
): Promise<[JupyterKernelspec, Metadata]> {
  const yaml = readYamlFromMarkdownFile(file);
  const yamlJupyter = yaml.jupyter;

  // if there is no yaml.jupyter then detect the file's language(s) and
  // find a kernelspec that supports this language
  if (!yamlJupyter) {
    const languages = languagesInMarkdownFile(file);
    languages.add("python"); // python as a default/failsafe
    const kernelspecs = await jupyterKernelspecs();
    for (const language of languages) {
      for (const kernelspec of kernelspecs.values()) {
        if (kernelspec.language.toLowerCase() === language) {
          return [kernelspec, {}];
        }
      }
    }
  }

  if (typeof (yamlJupyter) === "string") {
    const kernel = yamlJupyter;
    const kernelspec = await jupyterKernelspec(kernel);
    if (kernelspec) {
      return [kernelspec, {}];
    } else {
      return Promise.reject(
        new Error("Jupyter kernel '" + kernel + "' not found."),
      );
    }
  } else if (typeof (yamlJupyter) === "object") {
    const jupyter = { ...yamlJupyter } as Record<string, unknown>;
    if (isJupyterKernelspec(jupyter.kernelspec)) {
      const kernelspec = jupyter.kernelspec;
      delete jupyter.kernelspec;
      return [kernelspec, jupyter];
    } else if (typeof (jupyter.kernel) === "string") {
      const kernelspec = await jupyterKernelspec(jupyter.kernel);
      if (kernelspec) {
        delete jupyter.kernel;
        return [kernelspec, jupyter];
      } else {
        return Promise.reject(
          new Error("Jupyter kernel '" + jupyter.kernel + "' not found."),
        );
      }
    } else {
      return Promise.reject(
        new Error(
          "Invalid Jupyter kernelspec (must include name, language, & display_name)",
        ),
      );
    }
  } else {
    return Promise.reject(
      new Error(
        "Invalid jupyter YAML metadata found in file (must be string or object)",
      ),
    );
  }
}

export function jupyterFromFile(input: string): JupyterNotebook {
  // parse the notebook
  const nbContents = Deno.readTextFileSync(input);
  const nbJSON = JSON.parse(nbContents);
  const nb = nbJSON as JupyterNotebook;

  // vscode doesn't write a language to the kernelspec so also try language_info
  if (!nb.metadata.kernelspec.language) {
    nb.metadata.kernelspec.language = nbJSON.metadata.language_info?.name;
  }

  // validate that we have a language
  if (!nb.metadata.kernelspec.language) {
    throw new Error("No langage set for Jupyter notebook " + input);
  }

  // validate that we have cells
  if (!nb.cells) {
    throw new Error("No cells available in Jupyter notebook " + input);
  }

  return nb;
}

export function languagesInMarkdownFile(file: string) {
  return languagesInMarkdown(Deno.readTextFileSync(file));
}

export function languagesInMarkdown(markdown: string) {
  // see if there are any code chunks in the file
  const languages = new Set<string>();
  const kChunkRegex = /^[\t >]*```+\s*\{([a-zA-Z0-9_]+)( *[ ,].*)?\}\s*$/gm;
  kChunkRegex.lastIndex = 0;
  let match = kChunkRegex.exec(markdown);
  while (match) {
    const language = match[1].toLowerCase();
    if (!languages.has(language)) {
      languages.add(language);
    }
    match = kChunkRegex.exec(markdown);
  }
  kChunkRegex.lastIndex = 0;
  return languages;
}

export function jupyterAutoIdentifier(label: string) {
  label = pandocAsciify(label);

  label = label
    // Replace all spaces with hyphens
    .replace(/\s/g, "-")
    // Remove invalid chars
    .replace(/[^a-zA-Z0-9-_]/g, "")
    // Remove everything up to the first letter
    .replace(/^[^A-Za-z]+/, "");

  // if it's empty then create a random id
  if (label.length > 0) {
    return label.slice(0, 64);
  } else {
    return shortUuid();
  }
}

export interface JupyterAssets {
  base_dir: string;
  files_dir: string;
  figures_dir: string;
  supporting_dir: string;
}

export function jupyterAssets(input: string, to?: string) {
  // calculate and create directories
  input = Deno.realPathSync(input);
  const files_dir = join(dirname(input), inputFilesDir(input));
  const figures_dir = join(files_dir, figuresDir(to));
  ensureDirSync(figures_dir);

  // determine supporting_dir (if there are no other figures dirs then it's
  // the files dir, otherwise it's just the figures dir). note that
  // supporting_dir is the directory that gets removed after a self-contained
  // or non-keeping render is complete
  let supporting_dir = files_dir;
  for (
    const walk of walkSync(join(files_dir), { maxDepth: 1 })
  ) {
    if (walk.path !== files_dir && walk.path !== figures_dir) {
      supporting_dir = figures_dir;
      break;
    }
  }

  const base_dir = dirname(input);
  return {
    base_dir,
    files_dir: relative(base_dir, files_dir),
    figures_dir: relative(base_dir, figures_dir),
    supporting_dir: relative(base_dir, supporting_dir),
  };
}

export interface JupyterToMarkdownOptions {
  language: string;
  assets: JupyterAssets;
  execute: FormatExecute;
  keepHidden?: boolean;
  toHtml?: boolean;
  toLatex?: boolean;
  toMarkdown?: boolean;
  toIpynb?: boolean;
  toPresentation?: boolean;
  figFormat?: string;
  figDpi?: number;
}

export interface JupyterToMarkdownResult {
  markdown: string;
  metadata?: Metadata;
  dependencies?: JupyterWidgetDependencies;
  htmlPreserve?: Record<string, string>;
}

export function jupyterToMarkdown(
  nb: JupyterNotebook,
  options: JupyterToMarkdownOptions,
): JupyterToMarkdownResult {
  // optional content injection / html preservation for html output
  // that isn't an ipynb
  const isHtml = options.toHtml && !options.toIpynb;
  const dependencies = isHtml
    ? extractJupyterWidgetDependencies(nb)
    : undefined;
  const htmlPreserve = isHtml ? removeAndPreserveHtml(nb) : undefined;

  // extra metadata
  const metadata: Metadata = {};

  // generate markdown
  const md: string[] = [];

  // validate unique cell labels as we go
  const validateCellLabel = cellLabelValidator();

  // track current code cell index (for progress)
  let codeCellIndex = 0;

  for (let i = 0; i < nb.cells.length; i++) {
    // convert cell yaml to cell metadata
    const cell = jupyterCellWithOptions(
      nb.metadata.kernelspec.language.toLowerCase(),
      nb.cells[i],
    );

    // validate unique cell labels
    validateCellLabel(cell);

    // interpret cell slide_type for presentation output
    const slideType = options.toPresentation
      ? cell.metadata[kCellSlideshow]?.[kCellSlideshowSlideType]
      : undefined;
    if (slideType) {
      // this automatically puts us into slide-level 0 mode
      // (i.e. manual mode, slide delimeters are "---")
      metadata[kSlideLevel] = 0;

      // write any implied delimeter (or skip entirely)
      if (slideType === "skip") {
        continue;
      } else if (slideType == "slide" || slideType === "subslide") {
        md.push("\n---\n\n");
      } else if (slideType == "fragment") {
        md.push("\n. . .\n\n");
      } else if (slideType == "notes") {
        md.push("\n:::::::::: notes\n\n");
      }
    }

    // markdown from cell
    switch (cell.cell_type) {
      case "markdown":
        md.push(...mdFromContentCell(cell));
        break;
      case "raw":
        md.push(...mdFromRawCell(cell));
        break;
      case "code":
        md.push(...mdFromCodeCell(cell, ++codeCellIndex, options));
        break;
      default:
        throw new Error("Unexpected cell type " + cell.cell_type);
    }

    // terminate slide notes
    if (slideType === "notes") {
      md.push("\n::::::::::\n");
    }

    // newline
    md.push("\n");
  }

  // include jupyter metadata if we are targeting ipynb
  if (options.toIpynb) {
    md.push("---\n");
    const jupyterMetadata = {
      jupyter: {
        ...nb.metadata,
      },
    };
    const yamlText = stringify(jupyterMetadata, {
      indent: 2,
      sortKeys: false,
      skipInvalid: true,
    });
    md.push(yamlText);
    md.push("---\n");
  }

  // return markdown and any widget requirements
  return {
    markdown: md.join(""),
    metadata,
    dependencies,
    htmlPreserve,
  };
}

export function jupyterCellWithOptions(
  language: string,
  cell: JupyterCell,
): JupyterCellWithOptions {
  const { yaml, optionsSource, source } = partitionCellOptions(
    language,
    cell.source,
  );

  // read any options defined in cell metadata
  const metadataOptions: Record<string, unknown> = kJupyterCellOptionKeys
    .reduce((options, key) => {
      if (cell.metadata[key]) {
        options[key] = cell.metadata[key];
      }
      return options;
    }, {} as Record<string, unknown>);

  // combine metadata options with yaml options (giving yaml options priority)
  const options = {
    ...metadataOptions,
    ...yaml,
  };

  // if we have 'layout' and it's not a character then json encode it
  if (options[kLayout] && typeof (options[kLayout]) !== "string") {
    options[kLayout] = JSON.stringify(options[kLayout]);
  }

  return {
    ...cell,
    source,
    optionsSource,
    options,
  };
}

export function jupyterCellOptionsAsComment(
  language: string,
  options: Record<string, unknown>,
  stringifyOptions?: StringifyOptions,
) {
  if (Object.keys(options).length > 0) {
    const cellYaml = stringify(options, {
      indent: 2,
      sortKeys: false,
      skipInvalid: true,
      ...stringifyOptions,
    });
    const commentChars = langCommentChars(language);
    const yamlOutput = mdTrimEmptyLines(lines(cellYaml)).map((line) => {
      line = optionCommentPrefix(commentChars[0]) + line +
        optionCommentSuffix(commentChars[1]);
      return line + "\n";
    });
    return yamlOutput;
  } else {
    return [];
  }
}

export function mdFromContentCell(cell: JupyterCell) {
  return mdEnsureTrailingNewline(cell.source);
}

export function mdFromRawCell(cell: JupyterCell) {
  const mimeType = cell.metadata?.[kCellRawMimeType];
  if (mimeType) {
    switch (mimeType) {
      case kTextHtml:
        return mdHtmlOutput(cell.source);
      case kTextLatex:
        return mdLatexOutput(cell.source);
      case kRestructuredText:
        return mdFormatOutput("rst", cell.source);
      case kApplicationRtf:
        return mdFormatOutput("rtf", cell.source);
      case kApplicationJavascript:
        return mdScriptOutput(mimeType, cell.source);
    }
  }

  return mdFromContentCell(cell);
}

export function mdEnsureTrailingNewline(source: string[]) {
  if (source.length > 0 && !source[source.length - 1].endsWith("\n")) {
    return source.slice(0, source.length - 1).concat(
      [source[source.length - 1] + "\n"],
    );
  } else {
    return source;
  }
}

function optionCommentPrefix(comment: string) {
  return comment + "| ";
}
function optionCommentSuffix(comment?: string) {
  if (comment) {
    return " " + comment;
  } else {
    return "";
  }
}

function langCommentChars(lang: string): string[] {
  const chars = kLangCommentChars[lang] || "#";
  if (!Array.isArray(chars)) {
    return [chars];
  } else {
    return chars;
  }
}

const kLangCommentChars: Record<string, string | string[]> = {
  r: "#",
  python: "#",
  julia: "#",
  scala: "//",
  matlab: "%",
  csharp: "//",
  fsharp: "//",
  c: ["/*", "*/"],
  css: ["/*", "*/"],
  sas: ["*", ";"],
  powershell: "#",
  bash: "#",
  sql: "--",
  mysql: "--",
  psql: "--",
  lua: "--",
  cpp: "//",
  cc: "//",
  stan: "#",
  octave: "#",
  fortran: "!",
  fortran95: "!",
  awk: "#",
  gawk: "#",
  stata: "*",
  java: "//",
  groovy: "//",
  sed: "#",
  perl: "#",
  ruby: "#",
  tikz: "%",
  js: "//",
  d3: "//",
  node: "//",
  sass: "//",
  coffee: "#",
  go: "//",
  asy: "//",
  haskell: "--",
  dot: "//",
};

function mdFromCodeCell(
  cell: JupyterCellWithOptions,
  cellIndex: number,
  options: JupyterToMarkdownOptions,
) {
  // bail if we aren't including this cell
  if (!includeCell(cell, options)) {
    return [];
  }

  // filter outputs as needed
  const outputs = (cell.outputs || []).filter((output) => {
    // filter warnings if requested
    if (
      output.output_type === "stream" &&
      (output as JupyterOutputStream).name === "stderr" &&
      !includeWarnings(cell, options)
    ) {
      return false;
    }

    // filter matplotlib intermediate vars
    if (output.output_type === "execute_result") {
      const textPlain = (output as JupyterOutputDisplayData).data
        ?.[kTextPlain] as string[] | undefined;
      if (textPlain && textPlain[0].startsWith("[<matplotlib")) {
        return false;
      }
    }
    return true;
  });

  // redact if the cell has no source and no output
  if (!cell.source.length && !outputs.length) {
    return [];
  }

  // ouptut: asis should just include raw markup w/ no enclosures
  const asis =
    // specified as an explicit option for this cell
    cell.options[kOutput] === "asis" ||
    // specified globally with no output override for this cell
    (options.execute[kOutput] === "asis" &&
      cell.options[kOutput] === undefined) ||
    // all outputs are raw markdown
    outputs.every((output) => isMarkdown(output, options));

  // markdown to return
  const md: string[] = [];

  // write div enclosure
  const divMd: string[] = [`::: {`];

  // metadata to exclude from cell div attributes
  const kCellOptionsFilter = kJupyterCellInternalOptionKeys.concat(
    kJupyterCellStandardMetadataKeys,
    kJupyterCellThirdPartyMetadataKeys,
  );

  // determine label -- this will be forwarded to the output (e.g. a figure)
  // if there is a single output. otherwise it will included on the enclosing
  // div and used as a prefix for the individual outputs
  const label = cellLabel(cell);
  const labelCellContainer = shouldLabelCellContainer(cell, outputs, options);
  if (label && labelCellContainer) {
    divMd.push(`${label} `);
  }

  // resolve caption (main vs. sub)
  const { cellCaption, outputCaptions } = resolveCaptions(cell);

  // cell_type classes
  divMd.push(`.cell `);

  // add hidden if requested
  if (hideCell(cell, options)) {
    divMd.push(`.hidden `);
  }

  // css classes
  if (cell.options[kCellClasses] || cell.options[kCellPanel]) {
    const cellClasses = cell.options[kCellClasses]! || new Array<string>();
    const classes = Array.isArray(cellClasses) ? cellClasses : [cellClasses];
    if (typeof cell.options[kCellPanel] === "string") {
      classes.push(`panel-${cell.options[kCellPanel]}`);
    }
    if (typeof cell.options[kCellColumn] === "string") {
      classes.push(`column-${cell.options[kCellColumn]}`);
    }
    if (typeof cell.options[kCellFigColumn] === "string") {
      classes.push(`fig-column-${cell.options[kCellFigColumn]}`);
    }
    if (typeof cell.options[kCellTblColumn] === "string") {
      classes.push(`tbl-column-${cell.options[kCellTblColumn]}`);
    }
    if (typeof cell.options[kCellCapLoc] === "string") {
      classes.push(`caption-${cell.options[kCellFigCapLoc]}`);
    }
    if (typeof cell.options[kCellFigCapLoc] === "string") {
      classes.push(`fig-caption-${cell.options[kCellFigCapLoc]}`);
    }
    if (typeof cell.options[kCellTblCapLoc] === "string") {
      classes.push(`tbl-caption-${cell.options[kCellTblCapLoc]}`);
    }

    const classText = classes
      .map((clz: string) => {
        clz = ld.toString(clz) as string;
        return clz.startsWith(".") ? clz : ("." + clz);
      })
      .join(" ");
    divMd.push(classText + " ");
  }

  // forward other attributes we don't know about (combine attributes
  // from options yaml and cell metadata)
  const cellOptions = {
    ...cell.metadata,
    ...cell.options,
  };

  for (const key of Object.keys(cellOptions)) {
    if (!kCellOptionsFilter.includes(key.toLowerCase())) {
      // deno-lint-ignore no-explicit-any
      const value = (cellOptions as any)[key];
      if (value && !ld.isObject(value) && !ld.isArray(value)) {
        divMd.push(`${key}="${value}" `);
      }
    }
  }

  // add execution_count if we have one
  if (typeof (cell.execution_count) === "number") {
    divMd.push(`execution_count="${cell.execution_count}" `);
  }

  // create string for div enclosure (we'll use it later but
  // only if there is actually content in the div)
  const divBeginMd = divMd.join("").replace(/ $/, "").concat("}\n");

  // write code if appropriate
  if (includeCode(cell, options)) {
    const fenced = echoFenced(cell, options);
    const ticks = fenced ? "````" : "```";

    md.push(ticks + " {");
    if (typeof cell.options[kCellLstLabel] === "string") {
      let label = cell.options[kCellLstLabel]!;
      if (!label.startsWith("#")) {
        label = "#" + label;
      }
      md.push(label + " ");
    }
    if (!fenced) {
      md.push("." + options.language);
    }
    md.push(" .cell-code");
    if (hideCode(cell, options)) {
      md.push(" .hidden");
    }

    if (cell.options[kCodeOverflow] === "wrap") {
      md.push(" .code-overflow-wrap");
    } else if (cell.options[kCodeOverflow] === "scroll") {
      md.push(" .code-overflow-scroll");
    }

    if (typeof cell.options[kCellLstCap] === "string") {
      md.push(` caption=\"${cell.options[kCellLstCap]}\"`);
    }
    if (typeof cell.options[kCodeFold] !== "undefined") {
      md.push(` code-fold=\"${cell.options[kCodeFold]}\"`);
    }
    if (typeof cell.options[kCodeSummary] !== "undefined") {
      md.push(` code-summary=\"${cell.options[kCodeSummary]}\"`);
    }
    if (typeof cell.options[kCodeLineNumbers] !== "undefined") {
      md.push(` code-line-numbers=\"${cell.options[kCodeLineNumbers]}\"`);
    }
    md.push("}\n");
    let source = ld.cloneDeep(cell.source);
    if (fenced) {
      const optionsSource = cell.optionsSource.filter((line) =>
        line.search(/echo:\s+fenced/) === -1
      );
      if (optionsSource.length > 0) {
        source = mdTrimEmptyLines(source, "trailing");
      } else {
        source = mdTrimEmptyLines(source, "all");
      }
      source.unshift(...optionsSource);
      source.unshift("```{{" + options.language + "}}\n");
      source.push("\n```\n");
    } else if (cell.optionsSource.length > 0) {
      source = mdTrimEmptyLines(source, "leading");
    }
    md.push(...source, "\n");
    md.push(ticks + "\n");
  }

  // write output if approproate (output: asis gets special handling)
  if (includeOutput(cell, options)) {
    // compute label prefix for output (in case we need it for files, etc.)
    const labelName = label
      ? label.replace(/^#/, "").replaceAll(":", "-")
      : ("cell-" + (cellIndex + 1));

    // strip spaces, special characters, etc. for latex friendly paths
    const outputName = pandocAutoIdentifier(labelName, true) + "-output";

    let nextOutputSuffix = 1;
    for (
      const { index, output } of outputs.map((value, index) => ({
        index,
        output: value,
      }))
    ) {
      // compute output label
      const outputLabel = label && labelCellContainer && isDisplayData(output)
        ? (label + "-" + nextOutputSuffix++)
        : label;

      // leading newline and beginning of div
      if (!asis) {
        md.push("\n::: {");

        // include label/id if appropriate
        if (outputLabel && shouldLabelOutputContainer(output, options)) {
          md.push(outputLabel + " ");
        }

        // add output class name
        if (output.output_type === "stream") {
          const stream = output as JupyterOutputStream;
          md.push(`.cell-output-${stream.name}`);
        } else {
          md.push(`.${outputTypeCssClass(output.output_type)}`);
        }

        // add hidden if necessary
        if (
          hideOutput(cell, options) ||
          (isWarningOutput(output) && hideWarnings(cell, options))
        ) {
          md.push(` .hidden`);
        }

        // add execution count if we have one
        if (typeof (output.execution_count) === "number") {
          md.push(` execution_count=${output.execution_count}`);
        }

        md.push("}\n");
      }

      // broadcast figure options
      const figureOptions: JupyterOutputFigureOptions = {};
      const broadcastFigureOption = (
        name:
          | "fig-align"
          | "fig-link"
          | "fig-env"
          | "fig-pos"
          | "fig-scap"
          | "fig-alt",
      ) => {
        const value = cell.options[name];
        if (value) {
          if (Array.isArray(value)) {
            return value[index];
          } else {
            return value;
          }
        } else {
          return null;
        }
      };
      figureOptions[kCellFigAlign] = broadcastFigureOption(kCellFigAlign);
      figureOptions[kCellFigScap] = broadcastFigureOption(kCellFigScap);
      figureOptions[kCellFigLink] = broadcastFigureOption(kCellFigLink);
      figureOptions[kCellFigEnv] = broadcastFigureOption(kCellFigEnv);
      figureOptions[kCellFigPos] = broadcastFigureOption(kCellFigPos);
      figureOptions[kCellFigAlt] = broadcastFigureOption(kCellFigAlt);

      // produce output
      if (output.output_type === "stream") {
        const stream = output as JupyterOutputStream;
        if (asis && stream.name === "stdout") {
          md.push(stream.text.join(""));
        } else {
          md.push(mdOutputStream(stream));
        }
      } else if (output.output_type === "error") {
        md.push(mdOutputError(output as JupyterOutputError));
      } else if (isDisplayData(output)) {
        const caption = isCaptionableData(output)
          ? (outputCaptions.shift() || null)
          : null;
        md.push(mdOutputDisplayData(
          outputLabel,
          caption,
          outputName + "-" + (index + 1),
          output as JupyterOutputDisplayData,
          options,
          figureOptions,
        ));
        // if this isn't an image and we have a caption, place it at the bottom of the div
        if (caption && !isImage(output, options)) {
          md.push(`\n${caption}\n`);
        }
      } else {
        throw new Error("Unexpected output type " + output.output_type);
      }

      // terminate div
      if (!asis) {
        md.push(`:::\n`);
      }
    }
    // not including output...still check if there are ojs_define outputs to write
    // (ojs_define should evade output: false)
  } else if (cell.outputs) {
    cell.outputs
      .filter(isDisplayData)
      .filter((output) =>
        (output as JupyterOutputDisplayData).metadata.ojs_define
      )
      .forEach((ojs_define) => {
        const ojs_html = (ojs_define as JupyterOutputDisplayData)
          .data[kTextHtml] as string[];
        md.push("\n" + mdHtmlOutput(ojs_html));
      });
  }

  // write md w/ div enclosure (if there is any md to write)
  if (md.length > 0 && !asis) {
    // begin
    md.unshift(divBeginMd);

    // see if there is a cell caption
    if (cellCaption) {
      md.push("\n" + cellCaption + "\n");
    }

    // end div
    md.push(":::\n");
  }

  // lines to next cell
  md.push("\n".repeat((cell.metadata.lines_to_next_cell || 1)));

  // if we have kCellMdIndent then join, split on \n, apply indent, then re-join
  if (cell.options[kCellMdIndent]) {
    const indent = String(cell.options[kCellMdIndent]);
    const mdWithIndent = md
      .join("")
      .split("\n")
      .map((line) => indent + line)
      .join("\n");
    md.splice(0, md.length - 1);
    md.push(...mdWithIndent);
  }

  return md;
}

function isDisplayDataType(
  output: JupyterOutput,
  options: JupyterToMarkdownOptions,
  checkFn: (mimeType: string) => boolean,
) {
  if (isDisplayData(output)) {
    const mimeType = displayDataMimeType(
      output as JupyterOutputDisplayData,
      options,
    );
    if (mimeType) {
      if (checkFn(mimeType)) {
        return true;
      }
    }
  }
  return false;
}

function isImage(output: JupyterOutput, options: JupyterToMarkdownOptions) {
  return isDisplayDataType(output, options, displayDataIsImage);
}

function isMarkdown(output: JupyterOutput, options: JupyterToMarkdownOptions) {
  return isDisplayDataType(output, options, displayDataIsMarkdown);
}

function mdOutputStream(output: JupyterOutputStream) {
  // trim off warning source line for notebook
  if (output.name === "stderr") {
    if (output.text[0]) {
      const firstLine = output.text[0].replace(
        /<ipython-input.*?>:\d+:\s+/,
        "",
      );
      return mdCodeOutput([firstLine, ...output.text.slice(1)]);
    }
  }

  // normal default handling
  return mdCodeOutput(output.text);
}

function mdOutputError(output: JupyterOutputError) {
  return mdCodeOutput([output.ename + ": " + output.evalue]);
}

function mdOutputDisplayData(
  label: string | null,
  caption: string | null,
  filename: string,
  output: JupyterOutputDisplayData,
  options: JupyterToMarkdownOptions,
  figureOptions: JupyterOutputFigureOptions,
) {
  const mimeType = displayDataMimeType(output, options);
  if (mimeType) {
    if (displayDataIsImage(mimeType)) {
      return mdImageOutput(
        label,
        caption,
        filename,
        mimeType,
        output,
        options,
        figureOptions,
      );
    } else if (displayDataIsMarkdown(mimeType)) {
      return mdMarkdownOutput(output.data[mimeType] as string[]);
    } else if (displayDataIsLatex(mimeType)) {
      return mdLatexOutput(output.data[mimeType] as string[]);
    } else if (displayDataIsHtml(mimeType)) {
      return mdHtmlOutput(output.data[mimeType] as string[]);
    } else if (displayDataIsJson(mimeType)) {
      return mdJsonOutput(
        mimeType,
        output.data[mimeType] as Record<string, unknown>,
        options,
      );
    } else if (displayDataIsJavascript(mimeType)) {
      return mdScriptOutput(mimeType, output.data[mimeType] as string[]);
    } else if (displayDataIsTextPlain(mimeType)) {
      const lines = output.data[mimeType] as string[];
      // pandas inexplicably outputs html tables as text/plain with an enclosing single-quote
      if (
        lines.length === 1 &&
        lines[0].startsWith("'<table") &&
        lines[0].endsWith("</table>'")
      ) {
        lines[0] = lines[0].slice(1, -1);
        return mdMarkdownOutput(lines);
      } else {
        return mdCodeOutput(lines);
      }
    }
  }

  // no type match found
  return mdWarningOutput(
    "Unable to display output for mime type(s): " +
      Object.keys(output.data).join(", "),
  );
}

function mdImageOutput(
  label: string | null,
  caption: string | null,
  filename: string,
  mimeType: string,
  output: JupyterOutputDisplayData,
  options: JupyterToMarkdownOptions,
  figureOptions: JupyterOutputFigureOptions,
) {
  // alias output properties
  const data = output.data[mimeType] as string[];
  const metadata = output.metadata[mimeType];

  // attributes (e.g. width/height/alt)
  function metadataValue<T>(key: string, defaultValue: T) {
    return metadata && metadata[key] ? metadata["key"] as T : defaultValue;
  }
  let width = metadataValue(kCellOutWidth, 0);
  let height = metadataValue(kCellOutHeight, 0);
  const alt = caption || "";

  // calculate output file name
  const ext = extensionForMimeImageType(mimeType);
  const imageFile = options.assets.figures_dir + "/" + filename + "." + ext;

  // get the data
  const imageText = Array.isArray(data)
    ? (data as string[]).join("")
    : data as string;

  // base64 decode if it's not svg
  const outputFile = join(options.assets.base_dir, imageFile);
  if (mimeType !== kImageSvg) {
    const imageData = base64decode(imageText);

    // if we are in retina mode, then derive width and height from the image
    if (
      mimeType === kImagePng && options.figFormat === "retina" && options.figDpi
    ) {
      const png = new PngImage(imageData);
      if (
        png.dpiX === (options.figDpi * 2) && png.dpiY === (options.figDpi * 2)
      ) {
        width = Math.round(png.width / 2);
        height = Math.round(png.height / 2);
      }
    }
    Deno.writeFileSync(outputFile, imageData);
  } else {
    Deno.writeTextFileSync(outputFile, imageText);
  }

  let image = `![${alt}](${imageFile})`;
  if (label || width || height) {
    image += "{";
    if (label) {
      image += `${label} `;
    }
    if (width) {
      image += `width=${width} `;
    }
    if (height) {
      image += `height=${height} `;
    }
    [kCellFigAlign, kCellFigEnv, kCellFigAlt, kCellFigPos, kCellFigScap]
      .forEach(
        (attrib) => {
          // deno-lint-ignore no-explicit-any
          const value = (figureOptions as any)[attrib];
          if (value) {
            image += `${attrib}='${value}' `;
          }
        },
      );

    image = image.trimRight() + "}";
  }

  // surround with link if we have one
  if (figureOptions[kCellFigLink]) {
    image = `[${image}](${figureOptions[kCellFigLink]})`;
  }

  return mdMarkdownOutput([image]);
}

function mdMarkdownOutput(md: string[]) {
  return md.join("") + "\n";
}

function mdFormatOutput(format: string, source: string[]) {
  return mdEnclosedOutput("```{=" + format + "}", source, "```");
}

function mdLatexOutput(latex: string[]) {
  return mdFormatOutput("tex", latex);
}

function mdHtmlOutput(html: string[]) {
  return mdFormatOutput("html", html);
}

function mdJsonOutput(
  mimeType: string,
  json: Record<string, unknown>,
  options: JupyterToMarkdownOptions,
) {
  if (options.toIpynb) {
    return mdCodeOutput([JSON.stringify(json)], "json");
  } else {
    return mdScriptOutput(mimeType, [JSON.stringify(json)]);
  }
}

function mdScriptOutput(mimeType: string, script: string[]) {
  const scriptTag = [
    `<script type="${mimeType}">\n`,
    ...script,
    "\n</script>",
  ];
  return mdHtmlOutput(scriptTag);
}

function mdTrimEmptyLines(
  lines: string[],
  trim: "leading" | "trailing" | "all" = "all",
) {
  // trim leading lines
  if (trim === "all" || trim === "leading") {
    const firstNonEmpty = lines.findIndex((line) => line.trim().length > 0);
    if (firstNonEmpty === -1) {
      return [];
    }
    lines = lines.slice(firstNonEmpty);
  }

  // trim trailing lines
  if (trim === "all" || trim === "trailing") {
    let lastNonEmpty = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim().length > 0) {
        lastNonEmpty = i;
        break;
      }
    }
    if (lastNonEmpty > -1) {
      lines = lines.slice(0, lastNonEmpty + 1);
    }
  }

  return lines;
}

function mdCodeOutput(code: string[], clz?: string) {
  const open = "```" + (clz ? `{.${clz}}` : "");
  return mdEnclosedOutput(open, code, "```");
}

function mdEnclosedOutput(begin: string, text: string[], end: string) {
  const output = text.join("");
  const md: string[] = [
    begin + "\n",
    output + (output.endsWith("\n") ? "" : "\n"),
    end + "\n",
  ];
  return md.join("");
}

function mdWarningOutput(msg: string) {
  return mdOutputStream({
    output_type: "stream",
    name: "stderr",
    text: [msg],
  });
}

function isWarningOutput(output: JupyterOutput) {
  if (output.output_type === "stream") {
    const stream = output as JupyterOutputStream;
    return stream.name === "stderr";
  } else {
    return false;
  }
}

function outputTypeCssClass(output_type: string) {
  if (["display_data", "execute_result"].includes(output_type)) {
    output_type = "display";
  }
  return `cell-output-${output_type}`;
}
