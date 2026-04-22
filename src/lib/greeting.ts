export function getTimeGreeting(date: Date): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

export function getMsUntilNextGreetingBoundary(date: Date): number {
  const nextBoundary = new Date(date);

  if (date.getHours() < 5) {
    nextBoundary.setHours(5, 0, 0, 0);
  } else if (date.getHours() < 12) {
    nextBoundary.setHours(12, 0, 0, 0);
  } else if (date.getHours() < 17) {
    nextBoundary.setHours(17, 0, 0, 0);
  } else {
    nextBoundary.setDate(nextBoundary.getDate() + 1);
    nextBoundary.setHours(5, 0, 0, 0);
  }

  return Math.max(1000, nextBoundary.getTime() - date.getTime());
}
