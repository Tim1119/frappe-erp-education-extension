import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getGuardians } from "@/services/education/studentService";

const RELATIONS = ["Father", "Mother", "Guardian", "Other"];

export default function StudentGuardianTable({ guardians = [], onChange }) {
  const [allGuardians, setAllGuardians] = useState([]);

  useEffect(() => {
    getGuardians()
      .then(setAllGuardians)
      .catch(() => {});
  }, []);

  function addRow() {
    onChange([...guardians, { guardian: "", guardian_name: "", relation: "Guardian" }]);
  }

  function removeRow(idx) {
    onChange(guardians.filter((_, i) => i !== idx));
  }

  function updateRow(idx, field, value) {
    const copy = [...guardians];
    copy[idx] = { ...copy[idx], [field]: value };

    // Auto-fill name when guardian is selected
    if (field === "guardian") {
      const found = allGuardians.find((g) => g.name === value);
      if (found) copy[idx].guardian_name = found.guardian_name;
    }
    onChange(copy);
  }

  return (
    <div className="space-y-3">
      {guardians.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guardian</TableHead>
              <TableHead>Relation</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {guardians.map((g, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Select value={g.guardian || ""} onValueChange={(v) => updateRow(i, "guardian", v)}>
                    <SelectTrigger><SelectValue placeholder="Select guardian" /></SelectTrigger>
                    <SelectContent>
                      {allGuardians.map((ag) => (
                        <SelectItem key={ag.name} value={ag.name}>
                          {ag.guardian_name} ({ag.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select value={g.relation || "Guardian"} onValueChange={(v) => updateRow(i, "relation", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RELATIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRow(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="mr-2 h-4 w-4" /> Add Guardian
      </Button>
    </div>
  );
}
