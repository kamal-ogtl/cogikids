/**
 * Curriculum lookup helpers — filter and resolve curriculum nodes by subject,
 * age group and prerequisite. Drives the skills tree: getAvailableNodes returns
 * only the nodes a player has unlocked based on completed prerequisites.
 */
import { CURRICULUM_NODES, CurriculumNode, Subject, AgeGroup } from '../constants/curriculum';

/** All nodes for a subject + age group, ordered by level. */
export function getNodesForSubject(subject: Subject, ageGroup: AgeGroup): CurriculumNode[] {
  return CURRICULUM_NODES.filter(
    (n) => n.subject === subject && n.ageGroup === ageGroup,
  ).sort((a, b) => a.level - b.level);
}

export function getNodeById(id: string): CurriculumNode | undefined {
  return CURRICULUM_NODES.find((n) => n.id === id);
}

// Returns nodes whose prerequisite is completed (or have no prerequisite)
export function getAvailableNodes(
  subject: Subject,
  ageGroup: AgeGroup,
  completedIds: Set<string>,
): CurriculumNode[] {
  return getNodesForSubject(subject, ageGroup).filter(
    (n) => !n.prerequisite || completedIds.has(n.prerequisite),
  );
}
