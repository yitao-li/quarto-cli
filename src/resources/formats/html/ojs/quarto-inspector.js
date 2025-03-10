/*
* quarto-inspector.js
*
* Copyright (C) 2021 RStudio, PBC
*
*/

import {
  Inspector
} from "https://cdn.skypack.dev/@observablehq/runtime";

export class QuartoInspector extends Inspector {
  constructor(node, cellAst) {
    super(node);
    this._cellAst = cellAst;
  }
  rejected(error) {
    return super.rejected(error);
  }
}
