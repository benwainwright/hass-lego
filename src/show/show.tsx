import { EventBus } from "@core";
import { useState, useEffect } from "react";
import { StaticLogView } from "./static-log-view.tsx";
import { Box, Text } from "ink";
import { HassLegoEvent, StateChanged } from "@types";
import { SummaryView } from "./summary-view.tsx";

interface ShowProps {
  staticLog: boolean;
  events: EventBus;
}
export const Show = ({ staticLog, events }: ShowProps) => {
  const [logs, setLogs] = useState<
    (HassLegoEvent<unknown, unknown> & { id: string })[]
  >([]);

  useEffect(() => {
    events.subscribe((event) => {
      if (event.type !== "hass-state-changed") {
        setLogs((logs) => [...logs, event]);
      }
    });
  }, []);

  return (
    <Box flexDirection="column" margin={1}>
      <Text color="green" bold>
        Hass Lego started...
      </Text>
      {staticLog ? (
        <StaticLogView events={logs} />
      ) : (
        <SummaryView events={logs} />
      )}
    </Box>
  );
};
