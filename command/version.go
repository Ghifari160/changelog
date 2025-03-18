package command

import (
	"fmt"

	"github.com/urfave/cli/v2"
)

func init() {
	cmd := cli.Command{
		Name:   "version",
		Usage:  "print the app version",
		Action: CommandVersion,
	}

	Register(&cmd)
}

func CommandVersion(ctx *cli.Context) error {
	ShowBanner(ctx)

	return nil
}

func ShowBanner(ctx *cli.Context) {
	fmt.Printf("%s v%s\n%s\n\n", ctx.App.Name, ctx.App.Version, ctx.App.Copyright)
}
