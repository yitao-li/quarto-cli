
-- required lua modules
text = require 'text'

-- global crossref state
crossref = {
  index = {
    nextOrder = {},
    nextSubfigureOrder = 1,
    entries = {}
  },
  options = {}
}

-- [import]
function import(script)
  local path = PANDOC_SCRIPT_FILE:match("(.*/)")
  dofile(path .. script)
end
import("index.lua")
import("figures.lua")
import("tables.lua")
import("equations.lua")
import("listings.lua")
import("refs.lua")
import("meta.lua")
import("format.lua")
import("options.lua")
import("utils.lua")
-- [/import]


-- apply filters
return {
  initOptions(),
  figures(),
  tables(),
  equations(),
  listings(),
  metaInject(),
  resolveRefs(),
}





