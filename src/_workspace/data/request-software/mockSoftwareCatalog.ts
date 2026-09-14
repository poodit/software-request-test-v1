export type SoftwareCatalogItem = {
  softwareControlNo: string;
  softwareName: string;
  product: string;
  process: string;
  currentVersion: string;
  status: "Active" | "Inactive";
};

// This represents the existing software database, not request records shown in SearchResult.
export const softwareCatalogMockData: SoftwareCatalogItem[] = [
  {
    softwareControlNo: "SC-00125",
    softwareName: "Check Status",
    product: "980",
    process: "Check Flow",
    currentVersion: "1.2.3",
    status: "Active",
  },
  {
    softwareControlNo: "SC-00210",
    softwareName: "Request History",
    product: "Smart Factory",
    process: "Approval Flow",
    currentVersion: "2.5.1",
    status: "Active",
  },
  {
    softwareControlNo: "SC-00404",
    softwareName: "User Permission",
    product: "Smart Factory",
    process: "Approval Flow",
    currentVersion: "1.5.2",
    status: "Active",
  },
  {
    softwareControlNo: "SC-00999",
    softwareName: "Legacy Inspection",
    product: "980",
    process: "Check Flow",
    currentVersion: "3.4.2",
    status: "Active",
  },
];

const softwareCatalogStorageKey = "template-test.software-master.v1";

export function loadSoftwareCatalog(): SoftwareCatalogItem[] {
  try {
    const stored = window.localStorage.getItem(softwareCatalogStorageKey);
    if (!stored) return softwareCatalogMockData;
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed as SoftwareCatalogItem[] : softwareCatalogMockData;
  } catch {
    return softwareCatalogMockData;
  }
}

export function saveSoftwareCatalog(items: SoftwareCatalogItem[]) {
  window.localStorage.setItem(softwareCatalogStorageKey, JSON.stringify(items));
}

export function findSoftwareByControlNo(controlNo: string) {
  const normalizedControlNo = controlNo.trim().toLowerCase();
  return loadSoftwareCatalog().find(
    (item) => item.softwareControlNo.toLowerCase() === normalizedControlNo,
  );
}

export function getNextVersion(
  currentVersion: string,
  level: "Low" | "Medium" | "High",
) {
  const [major = 1, minor = 0, patch = 0] = currentVersion
    .split(".")
    .map((value) => Number(value));

  if (level === "Low") return `${major}.${minor}.${patch + 1}`;
  if (level === "Medium") return `${major}.${minor + 1}.0`;
  return `${major + 1}.0.0`;
}
