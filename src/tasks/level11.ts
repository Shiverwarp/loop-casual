import { buy, cliExecute, itemAmount, myLevel, runChoice, use, visitUrl } from "kolmafia";
import {
  $coinmaster,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  get,
  have,
  Macro,
} from "libram";
import { Limit, Quest, step, Task } from "./structure";
import { CombatStrategy } from "../combat";

const Diary: Task[] = [
  {
    name: "Forest",
    after: ["Start"],
    acquire: $items`blackberry galoshes`,
    completed: () => step("questL11Black") >= 2,
    do: $location`The Black Forest`,
    equip: $items`blackberry galoshes`,
    familiar: $familiar`Reassembled Blackbird`,
    modifier: "+combat 5min",
    choices: { 923: 1, 924: 1 },
    combat: new CombatStrategy().flee($monster`blackberry bush`).kill(),
  },
  {
    name: "Buy Documents",
    after: ["Forest"],
    completed: () => have($item`forged identification documents`) || step("questL11Black") >= 4,
    do: () => cliExecute("buy forged identification documents"),
    cap: 1,
    freeaction: true,
  },
  {
    name: "Diary",
    after: ["Buy Documents", "Misc/Unlock Beach"],
    completed: () => step("questL11Black") >= 4,
    do: $location`The Shore, Inc. Travel Agency`,
    choices: { 793: 1 },
    cap: 1,
  },
];

const Desert: Task[] = [
  {
    name: "Scrip",
    after: ["Misc/Unlock Beach"],
    completed: () => have($item`Shore Inc. Ship Trip Scrip`) || have($item`UV-resistant compass`),
    do: $location`The Shore, Inc. Travel Agency`,
    choices: { 793: 1 },
    cap: 1,
    freeaction: true,
  },
  {
    name: "Compass",
    after: ["Misc/Unlock Beach", "Scrip"],
    completed: () => have($item`UV-resistant compass`),
    do: () => buy($coinmaster`The Shore, Inc. Gift Shop`, 1, $item`UV-resistant compass`),
    cap: 1,
    freeaction: true,
  },
  {
    name: "Desert",
    after: ["Diary", "Compass"],
    ready: () =>
      get("desertExploration") < 20 ||
      ((get("gnasirProgress") & 2) > 0 &&
        (get("gnasirProgress") & 4) > 0 &&
        ((get("gnasirProgress") & 8) > 0 || itemAmount($item`worm-riding manual page`) < 15)),
    completed: () => get("desertExploration") >= 100,
    prepare: (): void => {
      if (have($item`desert sightseeing pamphlet`)) use($item`desert sightseeing pamphlet`);
    },
    do: $location`The Arid, Extra-Dry Desert`,
    equip: (): Item[] => {
      if (
        have($item`industrial fire extinguisher`) &&
        get("_fireExtinguisherCharge") >= 20 &&
        !get("fireExtinguisherDesertUsed") &&
        have($effect`Ultrahydrated`)
      )
        return $items`industrial fire extinguisher, UV-resistant compass, dromedary drinking helmet`;
      else return $items`UV-resistant compass, dromedary drinking helmet`;
    },
    familiar: $familiar`Melodramedary`,
    combat: (): CombatStrategy => {
      if (
        have($item`industrial fire extinguisher`) &&
        get("_fireExtinguisherCharge") >= 20 &&
        !get("fireExtinguisherDesertUsed") &&
        have($effect`Ultrahydrated`)
      )
        return new CombatStrategy().macro(
          new Macro().skill($skill`Fire Extinguisher: Zone Specific`)
        );
      else return new CombatStrategy().kill();
    },
    choices: { 805: 1 },
  },
  {
    name: "Gnasir",
    after: ["Diary"],
    acquire: $items`can of black paint, killing jar`,
    completed: () =>
      ((get("gnasirProgress") & 2) > 0 && (get("gnasirProgress") & 4) > 0) ||
      get("desertExploration") >= 100,
    ready: () => $location`The Arid, Extra-Dry Desert`.noncombatQueue.includes("A Sietch in Time"),
    do: () => {
      let res = visitUrl("place.php?whichplace=desertbeach&action=db_gnasir");
      while (res.includes("value=2")) {
        res = runChoice(2);
      }
      runChoice(1);
      cliExecute("use * desert sightseeing pamphlet");
      if (have($item`worm-riding hooks`)) use($item`drum machine`);
    },
    cap: 1,
    freeaction: true,
  },
  {
    name: "Gnasir Drum",
    after: ["Diary"],
    acquire: $items`drum machine`,
    completed: () =>
      ((get("gnasirProgress") & 8) > 0 && !have($item`worm-riding hooks`)) ||
      get("desertExploration") >= 100,
    ready: () => itemAmount($item`worm-riding manual page`) >= 15 || have($item`worm-riding hooks`),
    do: () => {
      let res = visitUrl("place.php?whichplace=desertbeach&action=db_gnasir");
      while (res.includes("value=2")) {
        res = runChoice(2);
      }
      runChoice(1);
      cliExecute("use * desert sightseeing pamphlet");
      if (have($item`worm-riding hooks`)) use($item`drum machine`);
    },
    cap: 1,
    freeaction: true,
  },
];

function rotatePyramid(goal: number): void {
  const ratchets = (goal - get("pyramidPosition") + 5) % 5;
  const to_buy =
    ratchets - itemAmount($item`tomb ratchet`) - itemAmount($item`crumbling wooden wheel`);
  if (to_buy > 0) {
    buy($item`tomb ratchet`, to_buy);
  }
  visitUrl("place.php?whichplace=pyramid&action=pyramid_control");
  for (let i = 0; i < ratchets; i++) {
    if (have($item`crumbling wooden wheel`)) {
      visitUrl("choice.php?whichchoice=929&option=1&pwd");
    } else {
      visitUrl("choice.php?whichchoice=929&option=2&pwd");
    }
  }
  if (get("pyramidPosition") !== goal) throw `Failed to rotate pyramid to ${goal}`;
  visitUrl("choice.php?whichchoice=929&option=5&pwd");
}

const Pyramid: Task[] = [
  {
    name: "Open Pyramid",
    after: ["Desert", "Gnasir", "Gnasir Drum", "Manor/Boss", "Palindome/Boss", "Hidden City/Boss"],
    completed: () => step("questL11Pyramid") >= 0,
    do: () => visitUrl("place.php?whichplace=desertbeach&action=db_pyramid1"),
    cap: 1,
    freeaction: true,
  },
  {
    name: "Upper Chamber",
    after: ["Open Pyramid"],
    completed: () => step("questL11Pyramid") >= 1,
    do: $location`The Upper Chamber`,
    modifier: "+combat",
    cap: 6,
  },
  {
    name: "Middle Chamber",
    after: ["Upper Chamber"],
    completed: () => get("controlRoomUnlock"),
    do: $location`The Middle Chamber`,
    cap: new Limit(11),
    delay: 9,
  },
  {
    name: "Get Token",
    acquire: [[3, $item`tomb ratchet`]],
    after: ["Middle Chamber"],
    completed: () =>
      have($item`ancient bronze token`) || have($item`ancient bomb`) || get("pyramidBombUsed"),
    do: () => rotatePyramid(4),
    cap: 1,
  },
  {
    name: "Get Bomb",
    acquire: [[4, $item`tomb ratchet`]],
    after: ["Get Token"],
    completed: () => have($item`ancient bomb`) || get("pyramidBombUsed"),
    do: () => rotatePyramid(3),
    cap: 1,
  },
  {
    name: "Use Bomb",
    acquire: [[3, $item`tomb ratchet`]],
    after: ["Get Bomb"],
    completed: () => get("pyramidBombUsed"),
    do: () => rotatePyramid(1),
    cap: 1,
  },
  {
    name: "Boss",
    after: ["Use Bomb"],
    completed: () => step("questL11Pyramid") === 999,
    do: () => visitUrl("place.php?whichplace=pyramid&action=pyramid_state1a"),
    combat: new CombatStrategy(true).macro(
      new Macro()
        .trySkill($skill`Saucegeyser`)
        .attack()
        .repeat()
    ),
    cap: 1,
  },
];

export const MacguffinQuest: Quest = {
  name: "Macguffin",
  tasks: [
    {
      name: "Start",
      after: [],
      ready: () => myLevel() >= 11,
      completed: () => step("questL11MacGuffin") !== -1,
      do: () => visitUrl("council.php"),
      cap: 1,
      freeaction: true,
    },
    ...Diary,
    ...Desert,
    ...Pyramid,
    {
      name: "Finish",
      after: ["Boss"],
      completed: () => step("questL11MacGuffin") === 999,
      do: () => visitUrl("council.php"),
      cap: 1,
      freeaction: true,
    },
  ],
};
