"use client";

import { Menu, MenuItem, MenuLabel } from "./ui";
import type { GroupBy } from "@/types/chat";

const OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "none", label: "None" },
  { value: "date", label: "Date" },
  { value: "project", label: "Project" },
];

/** "Group by" popover on the sidebar Recents label and the /recents header. */
export default function GroupByMenu({
  value,
  onChange,
  onClose,
  className,
}: {
  value: GroupBy;
  onChange: (v: GroupBy) => void;
  onClose: () => void;
  className?: string;
}) {
  return (
    <Menu onClose={onClose} className={className}>
      <MenuLabel>Group by</MenuLabel>
      {OPTIONS.map((o) => (
        <MenuItem
          key={o.value}
          label={o.label}
          checked={value === o.value}
          onClick={() => {
            onChange(o.value);
            onClose();
          }}
        />
      ))}
    </Menu>
  );
}
