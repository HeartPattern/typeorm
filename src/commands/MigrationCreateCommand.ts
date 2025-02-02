import { CommandUtils } from "./CommandUtils"
import { camelCase } from "../util/StringUtils"
import * as yargs from "yargs"
import chalk from "chalk"
import { PlatformTools } from "../platform/PlatformTools"
import path from "path"

/**
 * Creates a new migration file.
 */
export class MigrationCreateCommand implements yargs.CommandModule {
    command = "migration:create <path>"
    describe = "Creates a new migration file."

    builder(args: yargs.Argv) {
        return args
            .option("o", {
                alias: "outputJs",
                type: "boolean",
                default: false,
                describe:
                    "Generate a migration file on Javascript instead of Typescript",
            })
            .option("t", {
                alias: "timestamp",
                type: "number",
                default: false,
                describe: "Custom timestamp for the migration name",
            })
    }

    async handler(args: yargs.Arguments) {
        try {
            const timestamp = CommandUtils.getTimestamp(args.timestamp)
            const fullPath = (args.path as string).startsWith("/")
                ? (args.path as string)
                : path.resolve(process.cwd(), args.path as string)
            const filename = path.basename(fullPath)

            const fileContent = args.outputJs
                ? MigrationCreateCommand.getJavascriptTemplate(
                      filename,
                      timestamp,
                  )
                : MigrationCreateCommand.getTemplate(filename, timestamp)

            await CommandUtils.createFile(
                fullPath + (args.outputJs ? ".js" : ".ts"),
                fileContent,
            )
            console.log(
                `Migration ${chalk.blue(
                    fullPath + (args.outputJs ? ".js" : ".ts"),
                )} has been generated successfully.`,
            )
        } catch (err) {
            PlatformTools.logCmdErr("Error during migration creation:", err)
            process.exit(1)
        }
    }

    // -------------------------------------------------------------------------
    // Protected Static Methods
    // -------------------------------------------------------------------------

    /**
     * Gets contents of the migration file.
     */
    protected static getTemplate(name: string, timestamp: number): string {
        return `import { MigrationInterface, QueryRunner } from "typeorm"

export class ${camelCase(
            name,
            true,
        )}${timestamp} implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
`
    }

    /**
     * Gets contents of the migration file in Javascript.
     */
    protected static getJavascriptTemplate(
        name: string,
        timestamp: number,
    ): string {
        return `const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class ${camelCase(name, true)}${timestamp} {

    async up(queryRunner) {
    }

    async down(queryRunner) {
    }

}
`
    }
}
