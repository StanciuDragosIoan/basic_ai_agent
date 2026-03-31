/**
 * VRM Humanoid Bones you can control
 *
 * Usage example:
 *   const h = currentVRM.humanoid;
 *   const bone = h.getNormalizedBoneNode('leftUpperArm');
 *   if (bone) bone.rotation.set(x, y, z);   // values in radians
 *
 * Tip: Most posing is done on .rotation (Quaternion or Euler).
 *      For hips you can also change .position.y to move the whole body up/down.
 *
 * Official list comes from VRM specification (VRM 0.x and VRM 1.0).
 * Not every model has every finger bone — always check if the bone exists.
 */

const VRM_BONES = {
  // Torso / Core
  hips: "hips", // Root of the body - great for lowering when sitting
  spine: "spine",
  chest: "chest",
  upperChest: "upperChest", // Sometimes present in VRM 1.0

  // Head & Neck
  neck: "neck",
  head: "head",

  // Eyes & Jaw (useful for look-at or mouth)
  leftEye: "leftEye",
  rightEye: "rightEye",
  jaw: "jaw",

  // Legs
  leftUpperLeg: "leftUpperLeg", // Thigh
  rightUpperLeg: "rightUpperLeg",
  leftLowerLeg: "leftLowerLeg", // Shin / calf
  rightLowerLeg: "rightLowerLeg",
  leftFoot: "leftFoot",
  rightFoot: "rightFoot",
  leftToes: "leftToes", // Optional
  rightToes: "rightToes",

  // Arms & Shoulders
  leftShoulder: "leftShoulder",
  rightShoulder: "rightShoulder",
  leftUpperArm: "leftUpperArm", // Upper arm
  rightUpperArm: "rightUpperArm",
  leftLowerArm: "leftLowerArm", // Forearm
  rightLowerArm: "rightLowerArm",
  leftHand: "leftHand",
  rightHand: "rightHand",

  // Fingers (Left Hand)
  leftThumbProximal: "leftThumbProximal",
  leftThumbIntermediate: "leftThumbIntermediate",
  leftThumbDistal: "leftThumbDistal",

  leftIndexProximal: "leftIndexProximal",
  leftIndexIntermediate: "leftIndexIntermediate",
  leftIndexDistal: "leftIndexDistal",

  leftMiddleProximal: "leftMiddleProximal",
  leftMiddleIntermediate: "leftMiddleIntermediate",
  leftMiddleDistal: "leftMiddleDistal",

  leftRingProximal: "leftRingProximal",
  leftRingIntermediate: "leftRingIntermediate",
  leftRingDistal: "leftRingDistal",

  leftLittleProximal: "leftLittleProximal",
  leftLittleIntermediate: "leftLittleIntermediate",
  leftLittleDistal: "leftLittleDistal",

  // Fingers (Right Hand)
  rightThumbProximal: "rightThumbProximal",
  rightThumbIntermediate: "rightThumbIntermediate",
  rightThumbDistal: "rightThumbDistal",

  rightIndexProximal: "rightIndexProximal",
  rightIndexIntermediate: "rightIndexIntermediate",
  rightIndexDistal: "rightIndexDistal",

  rightMiddleProximal: "rightMiddleProximal",
  rightMiddleIntermediate: "rightMiddleIntermediate",
  rightMiddleDistal: "rightMiddleDistal",

  rightRingProximal: "rightRingProximal",
  rightRingIntermediate: "rightRingIntermediate",
  rightRingDistal: "rightRingDistal",

  rightLittleProximal: "rightLittleProximal",
  rightLittleIntermediate: "rightLittleIntermediate",
  rightLittleDistal: "rightLittleDistal",
};
