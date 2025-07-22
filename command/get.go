package command

import (
	"fmt"
	"io"
	"os"
	"slices"
	"strings"

	"github.com/ghifari160/changelog/keepachangelog"
	"github.com/ghifari160/changelog/markdown"
	"github.com/urfave/cli/v2"
)

func init() {
	cmd := cli.Command{
		Name:                   "get",
		Usage:                  "show changes for a specific version(s)",
		ArgsUsage:              "<version> [version...]",
		HideHelp:               true,
		UseShortOptionHandling: true,
		Flags: []cli.Flag{
			&cli.PathFlag{
				Name:    "file",
				Aliases: []string{"f"},
				Value:   "CHANGELOG.md",
				Usage:   "changelog file",
			},
			&cli.BoolFlag{
				Name:    "hide-id",
				Aliases: []string{"v"},
				Value:   false,
				Usage:   "hide version IDs (i.e. aggregate the sections)",
			},
		},
		Action: CommandGet,
	}

	Register(&cmd)
}

func CommandGet(ctx *cli.Context) error {
	if !ctx.Args().Present() {
		return cli.ShowSubcommandHelp(ctx)
	}

	targets := []string{strings.ToLower(ctx.Args().First())}
	for _, version := range ctx.Args().Tail() {
		targets = append(targets, strings.ToLower(version))
	}

	normalizeVersions(targets)

	f, err := os.OpenFile(ctx.Path("file"), os.O_RDONLY, 0644)
	if err != nil {
		return cli.Exit(fmt.Sprintf("Cannot open changelog file %s!", ctx.Path("file")), 1)
	}
	defer f.Close()

	data, err := io.ReadAll(f)
	if err != nil {
		return cli.Exit(fmt.Sprintf("Cannot read changelog file %s!", ctx.Path("file")), 1)
	}

	var cl keepachangelog.Changelog

	err = markdown.Unmarshal(data, &cl)
	if err != nil {
		return cli.Exit(fmt.Sprintf("Cannot parse changelog file %s!\n%v", ctx.Path("file"), err), 2)
	}

	if !ctx.Bool("hide-id") {
		for _, ver := range cl.Versions {
			if slices.Contains(targets, strings.ToLower(ver.ID)) {
				md, err := markdown.Marshal(ver)
				if err != nil {
					return cli.Exit(fmt.Sprintf("Cannot encode changelog: %v", err), 3)
				}

				fmt.Printf("%s", md)
			}
		}
	} else {
		sections := make(map[string]*keepachangelog.Section)

		for _, ver := range cl.Versions {
			if slices.Contains(targets, strings.ToLower(ver.ID)) {
				for _, section := range ver.Sections {
					if sec, ok := sections[section.Heading]; ok {
						sec.Changes = append(sec.Changes, section.Changes...)
					} else {
						sections[section.Heading] = &section
					}
				}
			}
		}

		for _, section := range sections {
			md, err := markdown.Marshal(section)
			if err != nil {
				return cli.Exit(fmt.Sprintf("Cannot encode changelog: %v", err), 3)
			}

			fmt.Printf("%s", md)
		}
	}

	return nil
}
