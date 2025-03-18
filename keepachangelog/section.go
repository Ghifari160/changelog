package keepachangelog

import (
	"fmt"
	"strings"
)

// A Section is a group of similar changes.
//
// For example, a Section may be a group of `Added` for new features, `Changed` for changes,
// `Deprecated` for outdated to-be-removed features, `Removed` for removed features, etc.
type Section struct {
	Heading string   `json:"heading"`
	Changes []string `json:"changes"`
}

// MarshalMarkdown implements [markdown.Marshaler].
func (s Section) MarshalMarkdown() ([]byte, error) {
	var sb strings.Builder

	s.marshalMarkdown(&sb)

	return []byte(sb.String()), nil
}

// UnmarshalMarkdown implements [markdown.Unmarshaler].
func (s *Section) UnmarshalMarkdown(data []byte) error {
	return s.unmarshalMarkdown(data)
}

// marshalMarkdown encodes s to Markdown, writing into sb.
func (s Section) marshalMarkdown(sb *strings.Builder) {
	fmt.Fprintf(sb, "### %s\n\n", s.Heading)

	for _, change := range s.Changes {
		lines := strings.Split(change, ". ")
		change = strings.Join(lines, ".\n  ")

		fmt.Fprintf(sb, "- %s\n", change)
	}

	if len(s.Changes) > 0 {
		sb.WriteString("\n")
	}
}

// unmarshalMarkdown decodes a Section in Markdown representation from data, storing the parsed
// values in s.
func (s *Section) unmarshalMarkdown(data []byte) error {
	normalized := normalize(string(data))

	header := secPattern.FindStringSubmatch(normalized)
	headerIndices := secPattern.FindIndex([]byte(normalized))

	s.Changes = make([]string, 0)

	for i, submatch := range header {
		switch i {
		case 0:
			continue

		case 1:
			s.Heading = submatch
		}
	}

	lines := strings.Split(normalized[headerIndices[1]:], "\n")

	var entry string
	for _, line := range lines {
		line = strings.TrimSpace(line)

		if len(line) < 1 {
			continue
		}

		if line[:1] == "-" {
			if len(entry) > 0 {
				s.Changes = append(s.Changes, strings.TrimSpace(entry))
			}

			entry = line[1:]
		} else {
			entry += fmt.Sprintf(" %s", line)
		}
	}

	if len(entry) > 0 {
		s.Changes = append(s.Changes, strings.TrimSpace(entry))
	}

	return nil
}
