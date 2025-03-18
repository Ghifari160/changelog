package command

import "github.com/urfave/cli/v2"

var cmds []*cli.Command

func init() {
	cmds = make([]*cli.Command, 0)
}

func Register(cmd *cli.Command) {
	cmds = append(cmds, cmd)
}

func Retrieve() []*cli.Command {
	return cmds
}
