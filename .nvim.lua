require('formatter').setup({
  logging = true,
  log_level = vim.log.levels.WARN,
  filetype = {
    lua = {
      require('formatter.filetypes.lua').stylua,
    },
    json = {
      require('formatter.filetypes.json').prettier,
    },
    css = {
      require('formatter.filetypes.css').prettier,
    },
    html = {
      require('formatter.filetypes.html').prettier,
    },
    javascript = {

      require('formatter.filetypes.javascript').prettier,
    },
    typescriptreact = {
      require('formatter.filetypes.typescriptreact').prettier,
    },
    typescript = {
      require('formatter.filetypes.typescript').prettier,
    },
    sql = {
      require('formatter.defaults.prettier'),
    },
  },
})
