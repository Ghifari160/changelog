package command

import (
	"fmt"
	"io"
	"os"
	"slices"
	"time"

	"github.com/ghifari160/changelog/keepachangelog"
	"github.com/ghifari160/changelog/markdown"
	"github.com/urfave/cli/v2"
)

func init() {
	cmd := cli.Command{
		Name:                   "promote",
		Usage:                  "promote unreleased",
		ArgsUsage:              "<version>",
		HideHelp:               true,
		UseShortOptionHandling: true,
		Flags: []cli.Flag{
			&cli.PathFlag{
				Name:    "file",
				Aliases: []string{"f"},
				Value:   "CHANGELOG.md",
				Usage:   "changelog file",
			},
		},
		Action: CommandPromote,
	}

	Register(&cmd)
}

func CommandPromote(ctx *cli.Context) error {
	if !ctx.Args().Present() {
		return cli.ShowSubcommandHelp(ctx)
	}

	target := ctx.Args().First()

	f, err := os.Open(ctx.Path("file"))
	if err != nil {
		return cli.Exit(fmt.Sprintf("Cannot open changelog file %s!", ctx.Path("file")), 1)
	}

	data, err := io.ReadAll(f)
	if err != nil {
		return cli.Exit(fmt.Sprintf("Cannot read changelog file %s!", ctx.Path("file")), 1)
	}

	err = f.Close()
	if err != nil {
		return cli.Exit(fmt.Sprintf("Cannot close changelog file %s!", ctx.Path("file")), 1)
	}

	var cl keepachangelog.Changelog

	err = markdown.Unmarshal(data, &cl)
	if err != nil {
		return cli.Exit(fmt.Sprintf("Cannot parse changelog file %s!\n%v", ctx.Path("file"), err), 2)
	}

	if len(cl.Versions) < 1 {
		return cli.Exit("Cannot promote non-existing draft!", 4)
	}

	var unreleased *keepachangelog.Version
	unreleasedIndex := make([]int, 2)
	for i, ver := range cl.Versions {
		if ver.Unreleased {
			unreleased = &ver
			unreleasedIndex[0] = i
			unreleasedIndex[1] = i + 1
		}
	}

	if unreleased == nil {
		return cli.Exit("Cannot promote non-existing draft!", 4)
	}

	unreleased.ID = target
	unreleased.ReleaseDate = time.Now()
	unreleased.Unreleased = false

	cl.Versions = slices.Insert(cl.Versions, 0, *unreleased)
	cl.Versions = slices.Delete(cl.Versions, unreleasedIndex[0]+1, unreleasedIndex[1]+1)

	f, err = os.OpenFile(ctx.Path("file"), os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0644)
	if err != nil {
		return cli.Exit(fmt.Sprintf("Cannot open changelog file %s!", ctx.Path("file")), 1)
	}
	defer f.Close()

	md, err := markdown.Marshal(cl)
	if err != nil {
		return cli.Exit(fmt.Sprintf("Cannot encode changelog: %v", err), 3)
	}

	_, err = f.Write(md)
	if err != nil {
		return cli.Exit(fmt.Sprintf("Cannot write changelog: %v", err), 3)
	}

	return nil
}
