import { myLevel, visitUrl } from "kolmafia";
import { $item, $location, have } from "libram";
import { Quest, step } from "./structure";

export const MosquitoQuest: Quest = {
  name: "Mosquito Quest",
  tasks: [
    {
      name: "Start",
      ready: () => myLevel() >= 2,
      completed: () => step("questL02Larva") !== -1,
      do: () => visitUrl("council.php"),
    },
    {
      name: "Burn Delay",
      after: "Start",
      completed: () => $location`The Spooky Forest`.turnsSpent >= 5,
      do: $location`The Spooky Forest`,
    },
    {
      name: "Mosquito",
      after: "Burn Delay",
      completed: () => have($item`mosquito larva`),
      do: $location`The Spooky Forest`,
      choices: { 502: 2, 505: 1, 334: 1 },
      modifier: "-combat",
    },
    {
      name: "Finish",
      after: "Mosquito",
      completed: () => step("questL02Larva") === 999,
      do: () => visitUrl("council.php"),
    },
  ],
};
