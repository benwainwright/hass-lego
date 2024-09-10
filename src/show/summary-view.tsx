import { HassLegoEvent } from "@types";
import { Box } from "ink";
import { SummaryViewRow } from "./summary-view-row.tsx";

interface SummaryViewProps {
  events: HassLegoEvent<unknown, unknown>[];
}

export const SummaryView = ({ events }: SummaryViewProps) => {
  const data = Object.entries(
    events.reduce<Record<string, HassLegoEvent<unknown, unknown>[]>>(
      (accum, event) => {
        const id = "triggerId" in event && event.triggerId;
        if (id) {
          accum[id] = [...(accum[id] ?? []), event];
        }
        return accum;
      },
      {}
    )
  ).map(([name, events]) => ({
    name,
    events,
  }));

  return (
    <Box flexDirection="column">
      {data.map((row) => (
        <SummaryViewRow
          key={`summary-view-row${row.name}`}
          name={row.name}
          events={row.events}
        />
      ))}
    </Box>
  );
};
