package keepachangelog

import (
	"regexp"
	"strings"
)

// LayoutChangelog is a [time.Layout] string.
//
// [Keep a Changelog] dates are formatted as [ISO 8601] (YYYY-MM-DD).
//
// [Keep a Changelog]: https://keepachangelog.com/en/1.1.0/
// [ISO 8601]: https://www.iso.org/iso-8601-date-and-time-format.html
const LayoutChangelog = "2006-01-02"

var (
	titlePattern             = regexp.MustCompile(`(?m)^#[\t ]+Changelog[\t ]*$`)
	verPattern               = regexp.MustCompile(`(?m)^#{2}[\t ]+\[([^\[\]\s]+)\](?:[\t ]+\-){0,1}(?:[\t ]+([0-9]{4}\-[0-9]{2}\-[0-9]{2})){0,1}(?:[\t ]+\[(YANKED){1}\]){0,1}[\t ]*`)
	secPattern               = regexp.MustCompile(`(?m)^#{3}[\t ]+(.+)[\t ]*$`)
	globalLintDisablePattern = regexp.MustCompile(`(?m)^<!--[\t ]+markdownlint-disable[\t ]+(.*)[\t ]+-->$`)
	lintRulePattern          = regexp.MustCompile(`MD[0-9]{3}`)
)

// normalize normalizes str, replacing `\r\n` and `\r` to `\n`.
// Effectively, normalize converts all line endings to LF.
func normalize(str string) string {
	normalized := strings.ReplaceAll(string(str), "\r\n", "\n")
	normalized = strings.ReplaceAll(normalized, "\r", "\n")

	return normalized
}
