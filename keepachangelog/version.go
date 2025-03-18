package keepachangelog

import (
	"encoding/json"
	"fmt"
	"slices"
	"strings"
	"time"
)

// A Version contains all changes for a given version.
type Version struct {
	ID          string    `json:"name"`
	ReleaseDate time.Time `json:"release_date"`
	Unreleased  bool      `json:"unreleased"`
	Yanked      bool      `json:"yanked"`
	Sections    []Section `json:"contents"`
}

// MarshalJSON implements [json.Marshaler].
//
// MarshalJSON skips empty Sections on released versions.
// Unreleased versions will *always* export all Sections.
func (v Version) MarshalJSON() ([]byte, error) {
	type shadowVersion Version
	export := shadowVersion(v)

	if !export.Unreleased {
		delIndices := make([][]int, 0)
		for i, section := range export.Sections {
			if len(section.Changes) < 1 {
				delIndices = append(delIndices, []int{i, i + 1})
			}
		}

		delCnt := 0
		for _, delIndex := range delIndices {
			export.Sections = slices.Delete(export.Sections,
				delIndex[0]-delCnt,
				delIndex[1]-delCnt)
			delCnt++
		}
	}

	return json.Marshal(export)
}

// MarshalMarkdown implements [markdown.Marshaler].
func (v Version) MarshalMarkdown() ([]byte, error) {
	var sb strings.Builder

	v.marshalMarkdown(&sb)

	return []byte(sb.String()), nil
}

// UnmarshalMarkdown implements [markdown.Unmarshaler].
func (v *Version) UnmarshalMarkdown(data []byte) error {
	return v.unmarshalMarkdown(data)
}

// marshalMarkdown encodes v to Markdown, writing into sb.
func (v Version) marshalMarkdown(sb *strings.Builder) {
	sb.WriteString("## ")

	if v.Unreleased {
		sb.WriteString("[UNRELEASED]")
	} else {
		fmt.Fprintf(sb, "[%s]", v.ID)
	}

	if !v.Unreleased && !v.ReleaseDate.IsZero() || v.Yanked {
		sb.WriteString(" -")
	}

	if !v.Unreleased && !v.ReleaseDate.IsZero() {
		fmt.Fprintf(sb, " %s", v.ReleaseDate.Format(LayoutChangelog))
	}

	if !v.Unreleased && v.Yanked {
		fmt.Fprint(sb, " [YANKED]")
	}

	sb.WriteString("\n\n")

	for _, content := range v.Sections {
		if !v.Unreleased && len(content.Changes) < 1 {
			continue
		}

		content.marshalMarkdown(sb)
	}
}

// unmarshalMarkdown decodes a Version in Markdown representation from data, storing the parsed
// values in v.
func (v *Version) unmarshalMarkdown(data []byte) error {
	var err error
	normalized := normalize(string(data))

	secIndices := secPattern.FindAllIndex([]byte(normalized), -1)

	header := verPattern.FindStringSubmatch(normalized)

	for i, submatch := range header {
		if len(submatch) < 1 {
			continue
		}

		switch i {
		case 0:
			continue

		case 1:
			v.ID = submatch
			if strings.ToLower(submatch) == "unreleased" {
				v.Unreleased = true
			}

		case 2:
			v.ReleaseDate, err = time.Parse(LayoutChangelog, submatch)

		case 3:
			if strings.ToLower(submatch) == "yanked" {
				v.Yanked = true
			}
		}
	}

	v.Sections = make([]Section, 0)

	for i, index := range secIndices {
		start := index[0]
		var end int

		if i < len(secIndices)-1 {
			end = secIndices[i+1][0]
		} else {
			end = len(normalized)
		}

		sec := &Section{}
		sec.UnmarshalMarkdown([]byte(normalized[start:end]))

		v.Sections = append(v.Sections, *sec)
	}

	return err
}
