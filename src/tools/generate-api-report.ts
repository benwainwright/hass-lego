import {
  Extractor,
  ExtractorConfig,
  ExtractorResult,
} from "@microsoft/api-extractor";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const configFile = join(__dirname, "..", "..", "api-extractor.config.json");

const extractorConfig: ExtractorConfig =
  ExtractorConfig.loadFileAndPrepare(configFile);

const result: ExtractorResult = Extractor.invoke(extractorConfig, {
  localBuild: true,
  showVerboseMessages: true,
});

if (result.succeeded && result.warningCount === 0 && result.errorCount === 0) {
  console.log(`API Extractor completed successfully`);
  process.exitCode = 0;
} else {
  console.log(
    `API extractor completed with ${result.errorCount} errors and ${result.warningCount} warnings`
  );
  process.exitCode = 1;
}
