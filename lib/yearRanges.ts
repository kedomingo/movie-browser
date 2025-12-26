export function getYearRange(yearFilter: string): { gte?: string; lte?: string } {
  switch (yearFilter) {
    case "2020s":
      return { gte: "2020-01-01", lte: "2029-12-31" };
    case "2000s":
      return { gte: "2000-01-01", lte: "2009-12-31" };
    case "1990s":
      return { gte: "1990-01-01", lte: "1999-12-31" };
    case "1980s":
      return { gte: "1980-01-01", lte: "1989-12-31" };
    case "1970s":
      return { gte: "1970-01-01", lte: "1979-12-31" };
    case "earlier":
      return { lte: "1969-12-31" };
    default:
      return {};
  }
}

