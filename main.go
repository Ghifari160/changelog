package main

import (
	"log"
	"os"

	"github.com/ghifari160/changelog/command"
	"github.com/urfave/cli/v2"
)

const helpTemplate = `USAGE:
    {{.HelpName}}{{if .Commands}} command [command options]{{end}} {{if .ArgsUsage}}{{.ArgsUsage}}{{else}}[arguments...]{{end}}

COMMANDS:
{{range .Commands}}    {{join .Names ", "}}{{ "\t"}}{{.Usage}}{{ "\n" }}{{end}}
`

func main() {
	cmd := cli.App{
		Name:                  "Changelog",
		HelpName:              "changelog",
		Version:               "0.4.0",
		Copyright:             "(c) 2025 GHIFARI160",
		HideVersion:           true,
		CustomAppHelpTemplate: helpTemplate,
		Commands:              command.Retrieve(),
	}

	if err := cmd.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}
