import { HassLegoEvent } from "@types";
import { Box, Text } from "ink";
import InkSpinner from "ink-spinner";

interface SummaryViewRowProps {
  name: string;
  events: HassLegoEvent[];
}

const getIcon = (events: HassLegoEvent[]) => {
  const lastAutomationEvent = events.flatMap((event) =>
    event.type === "automation" ? [event] : []
  );

  const event = lastAutomationEvent.at(-1);

  switch (event?.status) {
    case "started":
      return <InkSpinner />;
    case "finished":
      return <Text>✅</Text>;
  }
};

export const SummaryViewRow = ({ name, events }: SummaryViewRowProps) => {
  const childEvents = events.filter((event) => event.type !== "automation");
  const lastEvent = childEvents.at(-1);
  const lastEventName = lastEvent && "name" in lastEvent && lastEvent.name;
  return (
    <Box
      borderStyle="single"
      flexDirection="row"
      gap={2}
      paddingLeft={3}
      paddingRight={3}
    >
      <Box>
        <Text>{getIcon(events)}</Text>
      </Box>
      <Box>
        <Text>{name}</Text>
      </Box>
      <Box>
        <Text>-</Text>
      </Box>
      <Box>
        <Text>{lastEventName}</Text>
      </Box>
    </Box>
  );
};
