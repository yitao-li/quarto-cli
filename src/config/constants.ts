/*
* constants.ts
*
* Copyright (C) 2020 by RStudio, PBC
*
*/

export const kMetadataFormat = "format";

export const kRenderDefaults = "render";
export const kExecuteDefaults = "execute";
export const kPandocDefaults = "pandoc";
export const kLanguageDefaults = "language";
export const kPandocMetadata = "metadata";

export const kFigWidth = "fig.width";
export const kFigHeight = "fig.height";
export const kFigFormat = "fig.format";
export const kFigDpi = "fig.dpi";

export const kCache = "cache";
export const kFreeze = "freeze";
export const kEngine = "engine";
export const kEval = "eval";
export const kEcho = "echo";
export const kOutput = "output";
export const kWarning = "warning";
export const kError = "error";
export const kInclude = "include";

export const kResources = "resources";

export const kKeepHidden = "keep-hidden";

export const kExecuteEnabled = "enabled";
export const kExecuteIpynb = "ipynb";
export const kExecuteDaemon = "daemon";
export const kExecuteDaemonRestart = "daemon-restart";
export const kExecuteDebug = "debug";

export const kKeepMd = "keep-md";
export const kKeepTex = "keep-tex";
export const kKeepYaml = "keep-yaml";
export const kKeepIpynb = "keep-ipynb";
export const kKeepSource = "keep-source";
export const kVariant = "variant";
export const kOutputExt = "output-ext";
export const kOutputDivs = "output-divs";
export const kPageWidth = "page-width";
export const kFigAlign = "fig-align";
export const kCodeFold = "code-fold";
export const kCodeLineNumbers = "code-line-numbers";
export const kCodeOverflow = "code-overflow";
export const kCodeLink = "code-link";
export const kCodeTools = "code-tools";
export const kMergeIncludes = "merge-includes";
export const kPreferHtml = "prefer-html";
export const kSelfContainedMath = "self-contained-math";

export const kLatexAutoMk = "latex-auto-mk";
export const kLatexAutoInstall = "latex-auto-install";
export const kLatexMinRuns = "latex-min-runs";
export const kLatexMaxRuns = "latex-max-runs";
export const kLatexClean = "latex-clean";

export const kLatexMakeIndex = "latex-makeindex";
export const kLatexMakeIndexOpts = "latex-makeindex-opts";

export const kLatexTlmgrOpts = "latex-tlmgr-opts";
export const kLatexOutputDir = "latex-output-dir";

export const kLinkExternalIcon = "link-external-icon";
export const kLinkExternalNewwindow = "link-external-newwindow";

export const kExecuteDefaultsKeys = [
  kFigWidth,
  kFigHeight,
  kFigFormat,
  kFigDpi,
  kError,
  kEval,
  kEngine,
  kCache,
  kFreeze,
  kEcho,
  kOutput,
  kWarning,
  kInclude,
  kKeepMd,
  kKeepIpynb,
  kExecuteEnabled,
  kExecuteIpynb,
  kExecuteDaemon,
  kExecuteDaemonRestart,
  kExecuteDebug,
];

export const kRenderDefaultsKeys = [
  kKeepTex,
  kKeepYaml,
  kKeepSource,
  kKeepHidden,
  kVariant,
  kOutputExt,
  kOutputDivs,
  kPreferHtml,
  kPageWidth,
  kFigAlign,
  kCodeFold,
  kCodeLink,
  kCodeLineNumbers,
  kCodeOverflow,
  kCodeTools,
  kSelfContainedMath,
  kLatexAutoMk,
  kLatexAutoInstall,
  kLatexMinRuns,
  kLatexMaxRuns,
  kLatexClean,
  kLatexMakeIndex,
  kLatexMakeIndexOpts,
  kLatexTlmgrOpts,
  kLatexOutputDir,
  kLinkExternalIcon,
  kLinkExternalNewwindow,
];

// language fields
export const kTocTitleDocument = "toc-title-document";
export const kTocTitleWebsite = "toc-title-website";
export const kCalloutTipCaption = "callout-tip-caption";
export const kCalloutNoteCaption = "callout-note-caption";
export const kCalloutWarningCaption = "callout-warning-caption";
export const kCalloutImportantCaption = "callout-important-caption";
export const kCalloutDangerCaption = "callout-danger-caption";
export const kSectionTitleFootnotes = "section-title-footnotes";
export const kCodeSummary = "code-summary";
export const kCodeToolsMenuCaption = "code-tools-menu-caption";
export const kCodeToolsShowAllCode = "code-tools-show-all-code";
export const kCodeToolsHideAllCode = "code-tools-hide-all-code";
export const kCodeToolsViewSource = "code-tools-view-source";
export const kCodeToolsSourceCode = "code-tools-source-code";
export const kSearchNoResultsText = "search-no-results-text";
export const kCopyButtonTooltip = "copy-button-tooltip";
export const kRepoActionLinksEdit = "repo-action-links-edit";
export const kRepoActionLinksSource = "repo-action-links-source";
export const kRepoActionLinksIssue = "repo-action-links-issue";
export const kSearchMatchingDocumentsText = "search-matching-documents-text";
export const kSearchCopyLinkTitle = "search-copy-link-title";
export const kSearchHideMatchesText = "search-hide-matches-text";
export const kSearchMoreMatchText = "search-more-match-text";
export const kSearchMoreMatchesText = "search-more-matches-text";
export const kSearchClearButtonTitle = "search-clear-button-title";
export const kSearchDetatchedCancelButtonTitle =
  "search-detached-cancel-button-title";
export const kSearchSubmitButtonTitle = "search-submit-button-title";
export const kCrossrefFigTitle = "crossref-fig-title";
export const kCrossrefTblTitle = "crossref-tbl-title";
export const kCrossrefLstTitle = "crossref-lst-title";
export const kCrossrefThmTitle = "crossref-thm-title";
export const kCrossrefLemTitle = "crossref-lem-title";
export const kCrossrefCorTitle = "crossref-cor-title";
export const kCrossrefPrfTitle = "crossref-prp-title";
export const kCrossrefCnjTitle = "crossref-cnj-title";
export const kCrossrefDefTitle = "crossref-def-title";
export const kCrossrefExmTitle = "crossref-exm-title";
export const kCrossrefExrTitle = "crossref-exr-title";
export const kCrossrefFigPrefix = "crossref-fig-prefix";
export const kCrossrefTblPrefix = "crossref-tbl-prefix";
export const kCrossrefLstPrefix = "crossref-lst-prefix";
export const kCrossrefSecPrefix = "crossref-sec-prefix";
export const kCrossrefEqPrefix = "crossref-eq-prefix";
export const kCrossrefThmPrefix = "crossref-thm-prefix";
export const kCrossrefLemPrefix = "crossref-lem-prefix";
export const kCrossrefCorPrefix = "crossref-cor-prefix";
export const kCrossrefPrpPrefix = "crossref-prp-prefix";
export const kCrossrefCnjPrefix = "crossref-cnj-prefix";
export const kCrossrefDefPrefix = "crossref-def-prefix";
export const kCrossrefExmPrefix = "crossref-exm-prefix";
export const kCrossrefExrPrefix = "crossref-exr-prefix";
export const kCrossrefLofTitle = "crossref-lof-title";
export const kCrossrefLotTitle = "crossref-lot-title";
export const kCrossrefLolTitle = "crossref-lol-title";

export const kLanguageDefaultsKeys = [
  kTocTitleDocument,
  kTocTitleWebsite,
  kCalloutTipCaption,
  kCalloutNoteCaption,
  kCalloutWarningCaption,
  kCalloutImportantCaption,
  kCalloutDangerCaption,
  kSectionTitleFootnotes,
  kCodeSummary,
  kCodeToolsMenuCaption,
  kCodeToolsShowAllCode,
  kCodeToolsHideAllCode,
  kCodeToolsViewSource,
  kCodeToolsSourceCode,
  kSearchNoResultsText,
  kCopyButtonTooltip,
  kRepoActionLinksEdit,
  kRepoActionLinksSource,
  kRepoActionLinksIssue,
  kSearchMatchingDocumentsText,
  kSearchCopyLinkTitle,
  kSearchHideMatchesText,
  kSearchMoreMatchText,
  kSearchMoreMatchesText,
  kSearchClearButtonTitle,
  kSearchDetatchedCancelButtonTitle,
  kSearchSubmitButtonTitle,
  kCrossrefFigTitle,
  kCrossrefTblTitle,
  kCrossrefLstTitle,
  kCrossrefThmTitle,
  kCrossrefLemTitle,
  kCrossrefCorTitle,
  kCrossrefPrfTitle,
  kCrossrefCnjTitle,
  kCrossrefDefTitle,
  kCrossrefExmTitle,
  kCrossrefExrTitle,
  kCrossrefFigPrefix,
  kCrossrefTblPrefix,
  kCrossrefLstPrefix,
  kCrossrefSecPrefix,
  kCrossrefEqPrefix,
  kCrossrefThmPrefix,
  kCrossrefLemPrefix,
  kCrossrefCorPrefix,
  kCrossrefPrpPrefix,
  kCrossrefCnjPrefix,
  kCrossrefDefPrefix,
  kCrossrefExmPrefix,
  kCrossrefExrPrefix,
  kCrossrefLofTitle,
  kCrossrefLotTitle,
  kCrossrefLolTitle,
];

// 'defaults' fields
export const kTo = "to";
export const kFrom = "from";
export const kReader = "reader";
export const kWriter = "writer";
export const kOutputFile = "output-file";
export const kInputFiles = "input-files";
export const kAtxHeaders = "atx-headers";
export const kMarkdownHeadings = "markdown-headings";
export const kTemplate = "template";
export const kStandalone = "standalone";
export const kSelfContained = "self-contained";
export const kIncludeBeforeBody = "include-before-body";
export const kIncludeAfterBody = "include-after-body";
export const kIncludeInHeader = "include-in-header";
export const kCiteproc = "citeproc";
export const kCiteMethod = "cite-method";
export const kFilters = "filters";
export const kFilterParams = "filter-params";
export const kPdfEngine = "pdf-engine";
export const kPdfEngineOpts = "pdf-engine-opts";
export const kPdfEngineOpt = "pdf-engine-opt";
export const kListings = "listings";
export const kNumberSections = "number-sections";
export const kNumberOffset = "number-offset";
export const kShiftHeadingLevelBy = "shift-heading-level-by";
export const kNumberDepth = "number-depth";
export const kTopLevelDivision = "top-level-division";
export const kPaperSize = "papersize";
export const kLogFile = "log-file";
export const kHighlightStyle = "highlight-style";
export const kLinkColor = "linkcolor";
export const kColorLinks = "colorlinks";
export const kVariables = "variables";
export const kMetadataFile = "metadata-file";
export const kMetadataFiles = "metadata-files";
export const kSyntaxDefinitions = "syntax-definitions";
export const kSyntaxDefinition = "syntax-definition";
export const kReferenceDoc = "reference-doc";
export const kHtmlMathMethod = "html-math-method";
export const kToc = "toc";
export const kTableOfContents = "table-of-contents";
export const kSectionDivs = "section-divs";
export const kEPubCoverImage = "epub-cover-image";
export const kReferenceLocation = "reference-location";
export const kQuartoVarsKey = "_quarto-vars";

// command line flags
export const kMathjax = "mathjax";
export const kKatex = "katex";
export const kMathml = "mathml";
export const kGladtex = "gladtex";
export const kWebtex = "webtex";

// metadata fields
export const kTitle = "title";
export const kSubtitle = "subtitle";
export const kAuthor = "author";
export const kDate = "date";
export const kDoi = "doi";
export const kAbstract = "abstract";
export const kDescription = "description";
export const kTocTitle = "toc-title";
export const kLang = "lang";

export const kServer = "server";

export const kPageTitle = "pagetitle";
export const kTitlePrefix = "title-prefix";
export const kCsl = "csl";
export const kCss = "css";
export const kBibliography = "bibliography";
export const kHeaderIncludes = "header-includes";
export const kIncludeBefore = "include-before";
export const kIncludeAfter = "include-after";
export const kLinkCitations = "link-citations";
export const kDocumentClass = "documentclass";
export const kClassOption = "classoption";
export const kSlideLevel = "slide-level";

export const kTheme = "theme";
export const kCrossref = "crossref";
export const kCrossrefChapters = "chapters";
export const kCrossrefLabels = "labels";
export const kCrossrefAppendixTitle = "appendix-title";
export const kCrossrefAppendixDelim = "appendix-delim";
export const kCrossrefChaptersAlpha = "chapters-alpha";
export const kCrossrefChapterId = "chapter-id";

// https://pandoc.org/MANUAL.html#default-files
// note: we are keeping some things out of 'defaults' b/ca
// they are known to be valid in metadata. this includes:
//    "csl",
//    "bibliography",
//
export const kPandocDefaultsKeys = [
  kTo,
  kFrom,
  kReader,
  kWriter,
  kOutputFile,
  kInputFiles,
  kTemplate,
  kStandalone,
  kSelfContained,
  kVariables,
  "metadata",
  kMetadataFiles,
  kMetadataFile,
  kIncludeBeforeBody,
  kIncludeAfterBody,
  kIncludeInHeader,
  "resource-path",
  kCiteproc,
  kCiteMethod,
  "filters",
  "file-scope",
  "data-dir",
  "verbosity",
  kLogFile,
  kTopLevelDivision,
  "abbreviations",
  kPdfEngine,
  kPdfEngineOpts,
  kPdfEngineOpt,
  "wrap",
  "columns",
  "dpi",
  "extract-media",
  kToc,
  kTableOfContents,
  "toc-depth",
  kNumberSections,
  kNumberOffset,
  kShiftHeadingLevelBy,
  kSectionDivs,
  "identifier-prefix",
  kTitlePrefix,
  "strip-empty-paragraphs",
  "eol",
  "strip-comments",
  "indented-code-classes",
  "ascii",
  "default-image-extension",
  kHighlightStyle,
  kSyntaxDefinitions,
  kSyntaxDefinition,
  kListings,
  kReferenceDoc,
  kHtmlMathMethod,
  "email-obfuscation",
  "tab-stop",
  "preserve-tabs",
  "incremental",
  kSlideLevel,
  "epub-subdirectory",
  "epub-metadata",
  "epub-fonts",
  "epub-chapter-level",
  kEPubCoverImage,
  "reference-links",
  kReferenceLocation,
  kAtxHeaders,
  kMarkdownHeadings,
  "track-changes",
  "html-q-tags",
  "css",
  "ipynb-output",
  "request-headers",
  "fail-if-warnings",
  "dump-args",
  "ignore-args",
  "trace",
];

// cell options + metadata
export const kCellCollapsed = "collapsed";
export const kCellAutoscroll = "autoscroll";
export const kCellDeletable = "deletable";
export const kCellFormat = "format";
export const kCellName = "name";
export const kCellTags = "tags";
export const kCellLinesToNext = "lines_to_next_cell";
export const kCellSlideshow = "slideshow";
export const kCellSlideshowSlideType = "slide_type";
export const kCellRawMimeType = "raw_mimetype";

export const kCellId = "id";
export const kCellLabel = "label";
export const kCellFigCap = "fig-cap";
export const kCellFigSubCap = "fig-subcap";
export const kCellFigScap = "fig-scap";
export const kCellCapLoc = "cap-location";
export const kCellFigCapLoc = "fig-cap-location";
export const kCellTblCapLoc = "tbl-cap-location";
export const kCellFigColumn = "fig-column";
export const kCellTblColumn = "tbl-column";
export const kCellFigLink = "fig-link";
export const kCellFigAlign = "fig-align";
export const kCellFigEnv = "fig-env";
export const kCellFigPos = "fig-pos";
export const kCellFigAlt = "fig-alt";
export const kCellLstLabel = "lst-label";
export const kCellLstCap = "lst-cap";
export const kCellClasses = "classes";
export const kCellPanel = "panel";
export const kCellColumn = "column";
export const kCellOutWidth = "out-width";
export const kCellOutHeight = "out-height";
export const kCellMdIndent = "md-indent";

export const kCellColab = "colab";
export const kCellColabType = "colab_type";
export const kCellColbOutputId = "outputId";

export const kLayoutAlign = "layout-align";
export const kLayoutVAlign = "layout-valign";
export const kLayoutNcol = "layout-ncol";
export const kLayoutNrow = "layout-nrow";
export const kLayout = "layout";
