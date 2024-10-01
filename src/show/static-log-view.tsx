import { HassLegoEvent, StateChanged } from "@types";
import { StaticLogLine } from "./static-log-line.tsx";
import { Box } from "ink";

interface StaticLogView {
  events: (HassLegoEvent & {
    id: string;
  })[];
}
export const StaticLogView = ({ events }: StaticLogView) => {
  return (
    <Box marginTop={1} flexDirection="column" width="100%">
      {events.map((event, index) => (
        <StaticLogLine key={`log-line-${event.id}`} event={event} />
      ))}
    </Box>
  );
};
