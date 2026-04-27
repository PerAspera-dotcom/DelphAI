export function isTypedQuestion(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.endsWith('?')) return true;
  const questionStarters =
    /^(what|who|why|how|when|where|is|are|can|could|should|would|do|does|did|has|have|will|was|were|which|whose|wat|wie|waarom|hoe|wanneer|waar|is|zijn|kan|zou|quoi|qui|pourquoi|comment|quand|où|est|sont|peut|serait|was|wer|warum|wie|wann|wo|ist|sind|kann|würde)/i;
  const positionMarkers =
    /(i think|i believe|i feel|i consider|in my view|ik denk|ik geloof|ik voel|je pense|je crois|ich denke|ich glaube)/i;
  if (questionStarters.test(trimmed) && !positionMarkers.test(trimmed)) return true;
  return false;
}
