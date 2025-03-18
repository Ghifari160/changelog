package keepachangelog

import (
	"fmt"
	"slices"
	"strings"
)

// Changelog represents a chronologically ordered list of notable changes for each version of
// of a project.
type Changelog struct {
	Description      string    `json:"description"`
	DisableLintRules []string  `json:"disable_lint_rules,omitempty"`
	Versions         []Version `json:"versions"`
}

// MarshalMarkdown implements [markdown.Marshaler].
func (c Changelog) MarshalMarkdown() ([]byte, error) {
	var sb strings.Builder

	c.marshalMarkdown(&sb)

	md := strings.TrimSpace(sb.String())
	md += "\n"

	return []byte(md), nil
}

// UnmarshalMarkdown implements [markdown.Unmarshaler].
func (c *Changelog) UnmarshalMarkdown(data []byte) error {
	return c.unmarshalMarkdown(data)
}

// marshalMarkdown encodes c to Markdown, writing into sb.
func (c Changelog) marshalMarkdown(sb *strings.Builder) {
	if len(c.DisableLintRules) > 0 {
		fmt.Fprintf(sb, "<!-- markdownlint-disable %s -->", strings.Join(c.DisableLintRules, " "))
		sb.WriteString("\n\n")
	}

	sb.WriteString("# Changelog\n\n")
	sb.WriteString(c.Description)
	sb.WriteString("\n\n")

	for _, ver := range c.Versions {
		ver.marshalMarkdown(sb)
	}
}

// unmarshalMarkdown decodes a Changelog in Markdown representation from data, storing the parsed
// values in c.
func (c *Changelog) unmarshalMarkdown(data []byte) error {
	normalized := normalize(string(data))

	c.DisableLintRules = make([]string, 0)

	lintRuleGroups := globalLintDisablePattern.FindAllStringSubmatch(normalized, -1)
	for _, ruleGroup := range lintRuleGroups {
		if len(ruleGroup) < 2 {
			continue
		}

		rules := strings.Split(ruleGroup[1], " ")

		for _, rule := range rules {
			rule = strings.TrimSpace(rule)

			if lintRulePattern.MatchString(rule) && !slices.Contains(c.DisableLintRules, rule) {
				c.DisableLintRules = append(c.DisableLintRules, rule)
			}
		}
	}

	titleIndices := titlePattern.FindIndex([]byte(normalized))
	verIndices := verPattern.FindAllIndex([]byte(normalized), -1)

	c.Versions = make([]Version, 0)

	for i, index := range verIndices {
		start := index[0]
		var end int

		if i < len(verIndices)-1 {
			end = verIndices[i+1][0]
		} else {
			end = len(normalized)
		}

		if i == 0 {
			c.Description = strings.TrimSpace(normalized[titleIndices[1]:start])
		}

		ver := &Version{}
		err := ver.UnmarshalMarkdown([]byte(normalized[start:end]))
		if err != nil {
			return err
		}

		c.Versions = append(c.Versions, *ver)
	}

	return nil
}
