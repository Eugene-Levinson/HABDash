var colour = {};

colour.Reset = "\x1b[0m"
colour.Bright = "\x1b[1m"
colour.Dim = "\x1b[2m"
colour.Underscore = "\x1b[4m"
colour.Blink = "\x1b[5m"
colour.Reverse = "\x1b[7m"
colour.Hidden = "\x1b[8m"

colour.FgBlack = "\x1b[30m"
colour.FgRed = "\x1b[31m"
colour.FgGreen = "\x1b[32m"
colour.FgYellow = "\x1b[33m"
colour.FgBlue = "\x1b[34m"
colour.FgMagenta = "\x1b[35m"
colour.FgCyan = "\x1b[36m"
colour.FgWhite = "\x1b[37m"

colour.BgBlack = "\x1b[40m"
colour.BgRed = "\x1b[41m"
colour.BgGreen = "\x1b[42m"
colour.BgYellow = "\x1b[43m"
colour.BgBlue = "\x1b[44m"
colour.BgMagenta = "\x1b[45m"
colour.BgCyan = "\x1b[46m"
colour.BgWhite = "\x1b[47m"

module.exports = colour;