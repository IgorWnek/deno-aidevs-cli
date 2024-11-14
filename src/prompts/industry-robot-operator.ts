/**
 * Try to lead the robot to the extraction point.
 * Use dumbest model possible, like 4o-mini or less powerful.
 */
export const industryRobotOperatorPrompt = `
You are a robot controller. The robot is in the room represented by the map below:
 [
  ['p', 'X', 'p', 'p', 'p', 'p'], 
  ['p', 'p', 'p', 'X', 'p', 'p'],
  ['p', 'X', 'p', 'X', 'p', 'p'],
  ['o', 'X', 'p', 'p', 'p', 'F']
]

<rules>
- Robot moves one field at a time: UP, RIGHT, LEFT or TOP,
- Robot is marked as "o" at the map,
- Robot can move through fields marked as "p" at the map,
- robot CAN'T move through the fields marked as "X", these are obstacles,
- Robot must reach the field "F" which is the final destination.
</rules>

These are moves and what they mean on the map:
<move-top>
- initial position of the Robot "o":
 [
  ['p', 'X', 'p', 'p', 'p', 'p'], 
  ['p', 'p', 'p', 'X', 'p', 'p'],
  ['p', 'X', 'p', 'X', 'p', 'p'],
  ['o', 'X', 'p', 'p', 'p', 'F']
]
- move robot top, new position:
 [
  ['p', 'X', 'p', 'p', 'p', 'p'], 
  ['p', 'p', 'p', 'X', 'p', 'p'],
  ['o', 'X', 'p', 'X', 'p', 'p'],
  ['p', 'X', 'p', 'p', 'p', 'F']
]
</move-top>
<move-right>
- initial position of the Robot "1":
 [
  ['p', 'X', 'p', 'p', 'p', 'p'], 
  ['o', 'p', 'p', 'X', 'p', 'p'],
  ['p', 'X', 'p', 'X', 'p', 'p'],
  ['p', 'X', 'p', 'p', 'p', 'F']
]
- move robot top, new position:
 [
  ['p', 'X', 'p', 'p', 'p', 'p'], 
  ['p', 'o', 'p', 'X', 'p', 'p'],
  ['p', 'X', 'p', 'X', 'p', 'p'],
  ['o', 'X', 'p', 'p', 'p', 'F']
]
</move-right>

IMPORTANT: before every step write down your reasoning and create fresh look of the map after the move. Make sure the move is possible and that robot is getting closer to the point "0".
Response MUST contain the final instruction with JSON object within a <RESULT></RESULT> tag, like the example below:
<example>
- reasoning steps,
- another reasoning steps
<RESULT>
{
"steps": "UP, RIGHT, RIGHT, DOWN"
}
</RESULT>
</example>

`;
